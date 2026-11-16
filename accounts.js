/* Supabase Auth and account-owned progress. */
(() => {
  const config = window.COOKPATH_ACCOUNT_CONFIG || {};
  const P = window.COOKPATH_PROGRESS;
  const {choose:L} = window.COOKPATH_I18N;
  const enabled = config.enabled === true;
  let client, user = null, ready = false, generation = 0, publish = () => {}, legacy = P.fresh(), canonical = P.fresh();
  let dialog, status, button, busy = false, syncError = false, pendingEmail = "", progressView = false, entryVisible = false;
  const pendingKey = 'cookpath-pending-email';
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function setPending(email) {
    pendingEmail = email;
    try { if(email)sessionStorage.setItem(pendingKey,email);else sessionStorage.removeItem(pendingKey); } catch {}
  }
  function entry(required) {
    if(required)document.documentElement.setAttribute('data-account-entry','required');
    else document.documentElement.removeAttribute('data-account-entry');
    const shell=document.querySelector('.shell');if(shell)shell.inert=required;
    document.querySelector('#account-entry-loader')?.remove();
  }
  function showEntry() {
    entry(true); entryVisible=true; progressView=false; renderDialog();
    if(!dialog.open)dialog.showModal();
  }
  function authBusy(value) {
    busy=value;
    dialog.querySelectorAll('[data-auth-action]').forEach(el=>el.disabled=value||!client);
    const language=dialog.querySelector('#account-entry-language');if(language)language.disabled=value;
  }
  function paintStatus(message) {
    if (!status) return;
    status.textContent = message || (user ? ready ? L('Saved to your account','Αποθηκεύτηκε στον λογαριασμό σας') : L('Loading your progress…','Φόρτωση της προόδου σας…') : L('Sign in to save your progress','Συνδεθείτε για να αποθηκεύσετε την πρόοδό σας'));
    button.textContent = user ? L('My account','Ο λογαριασμός μου') : L('Sign in','Σύνδεση');
  }
  function notice(message, error = false) {
    const el = dialog.querySelector('#account-message');
    el.textContent = message; el.classList.toggle('account-error',error);
  }
  function renderDialog() {
    dialog.classList.toggle('account-dialog-wide',!!user && progressView);
    dialog.classList.toggle('account-welcome',!user);
    const title=user ? progressView ? L('Your progress, at a glance','Η πρόοδός σας με μια ματιά') : L('Your cooking progress','Η μαγειρική πρόοδός σας') : pendingEmail ? L('Check your inbox','Δείτε τα εισερχόμενά σας') : L('Welcome to CookPath','Καλώς ήρθατε στο CookPath');
    dialog.innerHTML = `<div class="account-heading"><div><span class="eyebrow">CookPath</span><h2 id="account-title" tabindex="-1">${title}</h2></div>${user ? `<button class="btn outline" type="button" id="account-close" aria-label="${L('Close account window','Κλείσιμο παραθύρου λογαριασμού')}">×</button>` : `<select id="account-entry-language" aria-label="Language / Γλώσσα"><option value="en">English</option><option value="el">Ελληνικά</option></select>`}</div><p id="account-message" role="status" aria-live="polite"></p>`;
    const close=dialog.querySelector('#account-close');if(close)close.onclick = () => dialog.close();
    const language=dialog.querySelector('#account-entry-language');
    if(language){language.value=window.COOKPATH_I18N.language||'en';language.onchange=()=>window.COOKPATH_I18N.changeLanguage(language.value);}
    if (user) {
      const account = document.createElement('div');
      account.innerHTML = `<p class="muted account-email">${esc(user.email || '')}</p><p class="muted">${L('Your completed tasks and first quiz answers belong to this account and follow you across devices.','Οι ολοκληρωμένες ασκήσεις και οι πρώτες απαντήσεις σας αποθηκεύονται στον λογαριασμό σας και σας ακολουθούν σε κάθε συσκευή.')}</p><div class="actions"><button class="btn" id="account-progress">${progressView ? L('Back to my account','Επιστροφή στον λογαριασμό') : L('Check my progress','Προβολή της προόδου μου')}</button><button class="btn secondary" id="account-refresh">${L('Refresh progress','Ανανέωση προόδου')}</button><button class="btn outline" id="account-signout">${L('Sign out','Αποσύνδεση')}</button></div>`;
      dialog.append(account);
      account.querySelector('#account-progress').onclick = () => {
        progressView = !progressView; renderDialog(); dialog.querySelector('#account-title').focus();
      };
      account.querySelector('#account-refresh').onclick = async () => {
        try { await refresh(); notice(L('Your progress is up to date.','Η πρόοδός σας είναι ενημερωμένη.')); } catch { notice(L('Could not load progress. Check your connection and try again.','Δεν φορτώθηκε η πρόοδος. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.'),true); }
      };
      account.querySelector('#account-signout').onclick = async event => {
        event.target.disabled = true;
        const {error} = await client.auth.signOut({scope:'local'});
        if (error) { event.target.disabled = false; notice(L('Could not sign out. Please try again.','Η αποσύνδεση απέτυχε. Δοκιμάστε ξανά.'),true); }
        else { setPending(''); await acceptSession(null); }
      };
      if (progressView) {
        const analytics = document.createElement('section'); analytics.id = 'account-analytics';
        analytics.setAttribute('aria-label',L('Personal progress analytics','Προσωπικά στατιστικά προόδου'));
        dialog.append(analytics); renderProgress();
      }
      if (!progressView && (legacy.completed.length || Object.keys(legacy.qnaAnswers).length)) {
        const importedKey = `cookpath-imported:${user.id}`;
        let handled = false;
        try { handled = localStorage.getItem(importedKey) === 'yes'; } catch {}
        if (!handled) {
          const box = document.createElement('section'); box.className = 'account-import';
          box.innerHTML = `<h3>${L('Bring your earlier practice with you?','Να μεταφέρετε την προηγούμενη εξάσκησή σας;')}</h3><p>${L('This browser has earlier progress. Import it only if it is yours. Answers already saved to your account will keep their first choice.','Αυτός ο περιηγητής έχει προηγούμενη πρόοδο. Μεταφέρετέ την μόνο αν είναι δική σας. Οι ήδη αποθηκευμένες απαντήσεις του λογαριασμού σας διατηρούν την πρώτη επιλογή τους.')}</p><button class="btn" id="account-import">${L('Import my browser progress','Μεταφορά της προόδου μου')}</button>`;
          dialog.append(box);
          box.querySelector('button').onclick = async event => {
            event.target.disabled = true;
            try {
              const imported = await rpc('cookpath_import_progress',{p_progress:legacy});
              const allImported = legacy.completed.every(id=>imported.completed.includes(id))
                && Object.keys(legacy.qnaAnswers).every(id=>imported.qnaAnswers[id] !== undefined);
              if (allImported) {
                try { localStorage.setItem(importedKey,'yes'); } catch {}
                box.remove(); notice(L('Your earlier progress is saved to this account.','Η προηγούμενη πρόοδός σας αποθηκεύτηκε στον λογαριασμό.'));
              } else {
                event.target.disabled = false;
                notice(L('Available earlier progress is saved. Finish the preceding challenges, then import the remaining history. Your browser copy is kept.','Αποθηκεύτηκε η διαθέσιμη προηγούμενη πρόοδος. Ολοκληρώστε τις προηγούμενες προκλήσεις και μεταφέρετε ξανά το υπόλοιπο ιστορικό. Το αντίγραφο στον περιηγητή διατηρείται.'));
              }
            } catch { event.target.disabled = false; notice(L('Import did not finish. Your browser copy is safe; try again.','Η μεταφορά δεν ολοκληρώθηκε. Το τοπικό αντίγραφο διατηρείται· δοκιμάστε ξανά.'),true); }
          };
        }
      }
    } else {
      if(pendingEmail){showCodeForm(pendingEmail);authBusy(busy);return;}
      const intro=document.createElement('div');intro.className='account-welcome-intro';
      intro.innerHTML=`<p>${L('Your cooking school, wherever you are.','Η δική σας σχολή μαγειρικής, όπου κι αν βρίσκεστε.')}</p><ol><li>${L('Follow the lessons and practise five tasks.','Ακολουθήστε τα μαθήματα και εξασκηθείτε σε πέντε ασκήσεις.')}</li><li>${L('Try the recipe and answer ten quiz questions.','Δοκιμάστε τη συνταγή και απαντήστε σε δέκα ερωτήσεις.')}</li><li>${L('Finish the challenge to unlock the next.','Ολοκληρώστε την πρόκληση για να ανοίξει η επόμενη.')}</li></ol><p class="account-small">${L('30 challenges. Learn at your own pace.','30 προκλήσεις. Μάθετε στον δικό σας ρυθμό.')}</p>`;
      dialog.append(intro);
      const form = document.createElement('form'); form.className = 'account-form';
      form.innerHTML = `<label for="account-email">${L('Start with your email','Ξεκινήστε με το email σας')}</label><input id="account-email" name="email" type="email" inputmode="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"><button class="btn" type="submit" data-auth-action>${L('Continue with email','Συνέχεια με email')}</button><p class="account-small">${L('We’ll email you an 8-digit code to create your account or sign in. Your progress stays saved.','Θα λάβετε έναν 8ψήφιο κωδικό για εγγραφή ή σύνδεση. Η πρόοδός σας αποθηκεύεται.')}</p>`;
      dialog.append(form);
      form.onsubmit = async event => {
        event.preventDefault(); await sendCode(form.elements.email.value.trim());
      };
      authBusy(busy);
    }
  }
  function renderProgress() {
    const host = dialog?.querySelector('#account-analytics');
    if (!host || !user) return;
    if (!ready) {
      host.innerHTML = `<p class="account-analytics-note">${syncError ? L('Your saved results could not be loaded. Choose Refresh progress to try again.','Δεν φορτώθηκαν τα αποθηκευμένα αποτελέσματα. Επιλέξτε Ανανέωση προόδου για νέα προσπάθεια.') : L('Loading your saved results…','Φόρτωση των αποθηκευμένων αποτελεσμάτων…')}</p>`;
      return;
    }
    const s = P.summarize(canonical);
    const pct = value => new Intl.NumberFormat(L('en','el'),{maximumFractionDigits:1}).format(value)+'%';
    const stat = (label,value,total,extra) => `<article class="account-stat"><h3>${label}</h3><p><strong>${value}</strong><span> / ${total}</span></p><progress value="${value}" max="${total}" aria-label="${esc(label)}"></progress><small>${extra}</small></article>`;
    const next = s.challenges.find(c => !c.complete);
    host.innerHTML = `${syncError ? `<p class="account-analytics-note">${L('Showing the last loaded results. Choose Refresh progress to check for updates.','Εμφανίζονται τα τελευταία φορτωμένα αποτελέσματα. Επιλέξτε Ανανέωση προόδου για ενημέρωση.')}</p>` : ''}<div class="account-stats">
      ${stat(L('Tasks practiced','Ασκήσεις που ολοκληρώθηκαν'),s.tasks,s.taskTotal,`${pct(s.tasks/s.taskTotal*100)} ${L('complete','ολοκληρώθηκε')}`)}
      ${stat(L('Challenges finished','Ολοκληρωμένες προκλήσεις'),s.completedChallenges,s.challengeTotal,`${pct(s.completedChallenges/s.challengeTotal*100)} ${L('complete','ολοκληρώθηκε')}`)}
      ${stat(L('Questions answered','Απαντημένες ερωτήσεις'),s.answered,s.questionTotal,`${s.unanswered} ${L('still to explore','μένουν για εξάσκηση')}`)}
      </div><section class="account-quiz-results" aria-labelledby="account-quiz-title"><div class="account-result-ring" style="--result-angle:${s.accuracy===null?0:s.accuracy*3.6}deg" ${s.answered?'':'data-empty="true"'}><div><strong>${s.accuracy===null?'—':pct(s.accuracy)}</strong><span>${L('correct','σωστές')}</span></div></div><div class="account-quiz-copy"><h3 id="account-quiz-title">${L('Your quiz results','Αποτελέσματα των κουίζ')}</h3><ul class="account-result-legend"><li><span class="result-dot result-correct" aria-hidden="true"></span><span>${L('Correct answers','Σωστές απαντήσεις')}</span><strong>${s.correct} · ${s.accuracy===null?'—':pct(s.accuracy)}</strong></li><li><span class="result-dot result-wrong" aria-hidden="true"></span><span>${L('Wrong answers','Λάθος απαντήσεις')}</span><strong>${s.wrong} · ${s.accuracy===null?'—':pct(100-s.accuracy)}</strong></li></ul><p>${s.answered ? L('Percentages use your submitted answers only. Unanswered questions are excluded.','Τα ποσοστά αφορούν μόνο τις απαντήσεις που υποβάλατε. Οι αναπάντητες ερωτήσεις δεν συνυπολογίζονται.') : L('No answers yet. Try your first challenge quiz to see your results here.','Δεν υπάρχουν ακόμη απαντήσεις. Δοκιμάστε το κουίζ της πρώτης πρόκλησης για να δείτε εδώ τα αποτελέσματά σας.')}</p></div></section>
      <p class="account-next-step">${next ? L(`Keep going with challenge ${next.number}: ${window.COOKPATH_PLAN?.[next.number-1]?.theme || ''}. Complete its five tasks and ten quiz answers to unlock the next.`,`Συνεχίστε με την πρόκληση ${next.number}: ${window.COOKPATH_PLAN?.[next.number-1]?.theme || ''}. Ολοκληρώστε τις πέντε ασκήσεις και τις δέκα απαντήσεις για να ανοίξει η επόμενη.`) : L('All 30 challenges complete. Keep putting your skills into practice in the kitchen.','Ολοκληρώσατε και τις 30 προκλήσεις. Συνεχίστε να εξασκείτε τις δεξιότητές σας στην κουζίνα.')}</p>
      <details class="account-breakdown"><summary>${L('Challenge-by-challenge results','Αποτελέσματα ανά πρόκληση')}</summary><p class="account-small">${L('Each completed challenge includes five practiced tasks and ten submitted quiz answers. Your first quiz choices stay final.','Κάθε ολοκληρωμένη πρόκληση περιλαμβάνει πέντε ασκήσεις και δέκα απαντήσεις κουίζ. Οι πρώτες επιλογές σας παραμένουν οριστικές.')}</p><ol>${s.challenges.map(c => `<li class="account-challenge"><div><span class="eyebrow">${L('Challenge','Πρόκληση')} ${String(c.number).padStart(2,'0')}</span><h4>${esc(window.COOKPATH_PLAN?.[c.number-1]?.theme || '')}</h4><span class="account-challenge-status">${c.complete ? L('Complete','Ολοκληρώθηκε') : c.tasks || c.answered ? L('In progress','Σε εξέλιξη') : c.available ? L('Ready to start','Έτοιμη για έναρξη') : L('Not unlocked yet','Δεν έχει ανοίξει ακόμη')}</span></div><dl><div><dt>${L('Tasks','Ασκήσεις')}</dt><dd>${c.tasks}/5</dd></div><div><dt>${L('Answered','Απαντήσεις')}</dt><dd>${c.answered}/10</dd></div><div><dt>${L('Correct / wrong','Σωστές / λάθος')}</dt><dd>${c.correct} / ${c.wrong}</dd></div><div><dt>${L('Accuracy','Επιτυχία')}</dt><dd>${c.accuracy===null?'—':pct(c.accuracy)}</dd></div></dl></li>`).join('')}</ol></details>`;
  }
  async function sendCode(email) {
    if(busy||!client)return;
    authBusy(true);
    const redirect=new URL(/^https?:$/.test(location.protocol)?location.href:'https://cookpath.onrender.com/');redirect.hash='';redirect.search='';
    try{
      const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:redirect.href,shouldCreateUser:true}});
      if(error)throw error;
      setPending(email);renderDialog();
      notice(L('Enter the 8-digit code from your newest email. Check Spam if it’s missing.','Εισαγάγετε τον 8ψήφιο κωδικό από το πιο πρόσφατο email. Αν δεν το βρίσκετε, ελέγξτε τα ανεπιθύμητα.'));
      dialog.querySelector('#account-code')?.focus();
    }catch{notice(L('The email could not be sent. Wait a minute, then try again.','Το email δεν στάλθηκε. Περιμένετε ένα λεπτό και δοκιμάστε ξανά.'),true);}
    finally{authBusy(false);}
  }
  function showCodeForm(email) {
    dialog.querySelector('#account-code-form')?.remove();
    const form = document.createElement('form'); form.id = 'account-code-form'; form.className = 'account-form';
    form.innerHTML = `<p class="muted">${L('Enter the code sent to','Εισαγάγετε τον κωδικό που στάλθηκε στο')} <strong class="account-email">${esc(email)}</strong></p><label for="account-code">${L('8-digit sign-in code','8ψήφιος κωδικός σύνδεσης')}</label><input id="account-code" name="code" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{8}" minlength="8" maxlength="8" required><button class="btn" type="submit" data-auth-action>${L('Verify and enter CookPath','Επιβεβαίωση και είσοδος στο CookPath')}</button><div class="account-code-actions"><button class="btn outline" type="button" id="account-resend" data-auth-action>${L('Resend code','Νέος κωδικός')}</button><button class="btn outline" type="button" id="account-change-email" data-auth-action>${L('Change email','Αλλαγή email')}</button></div>`;
    dialog.append(form);
    form.querySelector('#account-resend').onclick=()=>sendCode(email);
    form.querySelector('#account-change-email').onclick=()=>{if(busy)return;setPending('');renderDialog();const field=dialog.querySelector('#account-email');field.value=email;field.focus();};
    form.onsubmit = async event => {
      event.preventDefault(); if (busy) return;
      authBusy(true);
      try {
        const {data,error} = await client.auth.verifyOtp({email,token:form.elements.code.value.trim(),type:'email'});
        if (error || !data?.session?.user) throw error || new Error('No session');
        setPending(''); await acceptSession(data.session);
      } catch { notice(L('This code is invalid or expired. Use the newest email, or request a new code above.','Ο κωδικός δεν είναι έγκυρος ή έχει λήξει. Χρησιμοποιήστε το πιο πρόσφατο email ή ζητήστε νέο κωδικό παραπάνω.'),true); }
      finally { authBusy(false); }
    };
  }
  function open() { if (!enabled) return; if(!user){showEntry();return;}progressView = false; renderDialog(); if (!dialog.open) dialog.showModal(); }
  async function rpc(name,args = {}) {
    const id = user?.id, stamp = generation;
    if (!id) { open(); throw new Error('Sign in required'); }
    paintStatus(L('Saving your progress…','Αποθήκευση της προόδου σας…'));
    const {data,error} = await client.rpc(name,args);
    if (stamp !== generation || user?.id !== id) throw new Error('Account changed');
    if (error) { syncError = true; renderProgress(); paintStatus(L('Not saved · open your account to retry','Δεν αποθηκεύτηκε · ανοίξτε τον λογαριασμό για νέα προσπάθεια')); throw error; }
    const received = P.normalize(data);
    const next = P.normalize({completed:[...canonical.completed,...received.completed],qnaAnswers:{...canonical.qnaAnswers,...received.qnaAnswers}});
    canonical = next;
    ready = true; syncError = false; publish(next);
    try { localStorage.setItem(`cookpath-account:${id}`,JSON.stringify(next)); } catch {}
    paintStatus(); renderProgress(); return next;
  }
  async function refresh() { return rpc('cookpath_get_progress'); }
  async function acceptSession(session) {
    const nextUser = session?.user || null;
    if (nextUser?.id && nextUser.id === user?.id) return;
    const fromEntry=entryVisible;
    generation++; user = nextUser; ready = false; syncError = false; progressView = false; canonical = P.fresh(); publish(P.fresh()); paintStatus();
    if (!user) {showEntry();return;}
    setPending('');entry(false);entryVisible=false;
    if(fromEntry&&dialog.open)dialog.close();
    else if(dialog.open)renderDialog();
    try {
      await refresh();
      let imported = false; try { imported = localStorage.getItem(`cookpath-imported:${user.id}`) === 'yes'; } catch {}
      if (!fromEntry && !imported && (legacy.completed.length || Object.keys(legacy.qnaAnswers).length)) open();
      else if (dialog?.open) renderDialog();
    } catch {
      try { publish(P.normalize(JSON.parse(localStorage.getItem(`cookpath-account:${user.id}`)||'null'))); } catch {}
      paintStatus(L('Could not load account progress · open your account to retry','Δεν φορτώθηκε η πρόοδος · ανοίξτε τον λογαριασμό για νέα προσπάθεια'));
    }
  }
  async function start({onState,legacyProgress}) {
    if (!enabled) {entry(false);return;}
    publish = onState; legacy = P.normalize(legacyProgress);
    try{const saved=sessionStorage.getItem(pendingKey);if(saved&&saved.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(saved))pendingEmail=saved;}catch{}
    dialog = document.createElement('dialog'); dialog.className = 'account-dialog'; dialog.setAttribute('aria-labelledby','account-title'); document.body.append(dialog);
    dialog.addEventListener('cancel',event=>{if(!user)event.preventDefault();});
    const host = document.createElement('div'); host.className = 'account-controls';
    status = document.createElement('span'); status.className = 'account-save-status'; status.setAttribute('role','status');
    button = document.createElement('button'); button.className = 'btn account-button'; button.onclick = open;
    host.append(status,button); document.querySelector('.status').prepend(host); paintStatus();
    try {
    const url = new URL(config.supabaseUrl);
    if (url.protocol !== 'https:' || !config.publishableKey || config.publishableKey.startsWith('sb_secret_')) throw new Error('Invalid public account configuration');
    if (config.publishableKey.startsWith('eyJ')) {
      const payload = JSON.parse(atob(config.publishableKey.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
      if (payload.role !== 'anon') throw new Error('Only public Supabase keys are allowed');
    }
    if (!window.supabase) await new Promise((resolve,reject) => {
      const script = document.createElement('script'); script.src = 'vendor/supabase.js'; script.onload = resolve; script.onerror = reject; document.head.append(script);
    });
    const callbackError = /(?:error=|error_code=)/.test(location.hash);
    client = window.supabase.createClient(config.supabaseUrl,config.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    client.auth.onAuthStateChange((_event,session) => { setTimeout(()=>acceptSession(session).catch(()=>{}),0); });
    const {data,error} = await client.auth.getSession();
    if (error && !callbackError) throw error;
    await acceptSession(data?.session);
    if (callbackError && !user) { open(); notice(L('This sign-in link is invalid or expired. Request a fresh code here to sign in.','Ο σύνδεσμος δεν είναι έγκυρος ή έχει λήξει. Ζητήστε νέο κωδικό εδώ για να συνδεθείτε.'),true); }
    } catch {
      client=null;showEntry();
      notice(L('We couldn’t connect. Check your connection and try again.','Δεν ήταν δυνατή η σύνδεση. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.'),true);
      const retry=document.createElement('button');retry.className='btn secondary';retry.textContent=L('Try again','Δοκιμάστε ξανά');retry.onclick=()=>location.reload();dialog.append(retry);
    }
    window.addEventListener('focus',()=>{if(user)refresh().catch(()=>{});});
    window.addEventListener('online',()=>{if(user)refresh().catch(()=>{});});
  }
  window.COOKPATH_ACCOUNTS = {enabled,start,open,refresh,
    get canWrite(){return !enabled || !!(user && ready);},
    get signedIn(){return !!user;},
    completeTask:id=>rpc('cookpath_complete_task',{p_task_id:id}),
    answer:(id,choice)=>rpc('cookpath_submit_answer',{p_question_id:id,p_selected_index:choice})
  };
})();
