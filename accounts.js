/* Supabase Auth and account-owned progress. */
(() => {
  const config = window.COOKPATH_ACCOUNT_CONFIG || {};
  const P = window.COOKPATH_PROGRESS;
  const {choose:L} = window.COOKPATH_I18N;
  const enabled = config.enabled === true;
  let client, user = null, ready = false, generation = 0, publish = () => {}, legacy = P.fresh(), canonical = P.fresh();
  let dialog, status, button, busy = false, syncError = false;
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
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
    dialog.innerHTML = `<div class="account-heading"><div><span class="eyebrow">CookPath</span><h2 id="account-title">${user ? L('Your cooking progress','Η μαγειρική πρόοδός σας') : L('Your school. Your progress.','Η σχολή σας. Η πρόοδός σας.')}</h2></div><button class="btn outline" type="button" id="account-close" aria-label="${L('Close account window','Κλείσιμο παραθύρου λογαριασμού')}">×</button></div><p id="account-message" role="status" aria-live="polite"></p>`;
    dialog.querySelector('#account-close').onclick = () => dialog.close();
    if (user) {
      const account = document.createElement('div');
      account.innerHTML = `<p class="muted account-email">${esc(user.email || '')}</p><p class="muted">${L('Your completed tasks and first quiz answers belong to this account and follow you across devices.','Οι ολοκληρωμένες ασκήσεις και οι πρώτες απαντήσεις σας αποθηκεύονται στον λογαριασμό σας και σας ακολουθούν σε κάθε συσκευή.')}</p><div class="actions"><button class="btn secondary" id="account-refresh">${L('Refresh progress','Ανανέωση προόδου')}</button><button class="btn outline" id="account-signout">${L('Sign out','Αποσύνδεση')}</button></div>`;
      dialog.append(account);
      account.querySelector('#account-refresh').onclick = async () => {
        try { await refresh(); notice(L('Your progress is up to date.','Η πρόοδός σας είναι ενημερωμένη.')); } catch { notice(L('Could not load progress. Check your connection and try again.','Δεν φορτώθηκε η πρόοδος. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.'),true); }
      };
      account.querySelector('#account-signout').onclick = async event => {
        event.target.disabled = true;
        const {error} = await client.auth.signOut({scope:'local'});
        if (error) { event.target.disabled = false; notice(L('Could not sign out. Please try again.','Η αποσύνδεση απέτυχε. Δοκιμάστε ξανά.'),true); }
        else { await acceptSession(null); dialog.close(); }
      };
      if (legacy.completed.length || Object.keys(legacy.qnaAnswers).length) {
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
      const form = document.createElement('form'); form.className = 'account-form';
      form.innerHTML = `<p class="muted">${L('Sign in with a secure email link. New here? Your account is created when you confirm your email.','Συνδεθείτε με ασφαλή σύνδεσμο email. Αν είστε νέος χρήστης, ο λογαριασμός δημιουργείται με την επιβεβαίωση του email σας.')}</p><label for="account-email">${L('Email address','Διεύθυνση email')}</label><input id="account-email" name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"><button class="btn" type="submit">${L('Email me a sign-in link','Αποστολή συνδέσμου σύνδεσης')}</button><p class="account-small">${L('No password to remember. Your quiz choices are final after submission.','Δεν χρειάζεται κωδικός. Οι επιλογές στο κουίζ είναι οριστικές μετά την υποβολή.')}</p>`;
      dialog.append(form);
      form.onsubmit = async event => {
        event.preventDefault(); if (busy) return;
        busy = true; const submit = form.querySelector('button'); submit.disabled = true;
        const redirect = new URL(location.href); redirect.hash = ''; redirect.search = '';
        try {
          const {error} = await client.auth.signInWithOtp({email:form.elements.email.value.trim(),options:{emailRedirectTo:redirect.href,shouldCreateUser:true}});
          if (error) throw error;
          notice(L('Check your email for your sign-in link. You can open it on this device or another device.','Ελέγξτε το email σας για τον σύνδεσμο σύνδεσης. Μπορείτε να τον ανοίξετε σε αυτή ή σε άλλη συσκευή.'));
        } catch { notice(L('The sign-in email could not be sent. Please try again shortly.','Το email σύνδεσης δεν στάλθηκε. Δοκιμάστε ξανά σε λίγο.'),true); }
        finally { busy = false; submit.disabled = false; }
      };
    }
  }
  function open() { if (!enabled || !client) return; renderDialog(); if (!dialog.open) dialog.showModal(); }
  async function rpc(name,args = {}) {
    const id = user?.id, stamp = generation;
    if (!id) { open(); throw new Error('Sign in required'); }
    paintStatus(L('Saving your progress…','Αποθήκευση της προόδου σας…'));
    const {data,error} = await client.rpc(name,args);
    if (stamp !== generation || user?.id !== id) throw new Error('Account changed');
    if (error) { syncError = true; paintStatus(L('Not saved · open your account to retry','Δεν αποθηκεύτηκε · ανοίξτε τον λογαριασμό για νέα προσπάθεια')); throw error; }
    const received = P.normalize(data);
    const next = P.normalize({completed:[...canonical.completed,...received.completed],qnaAnswers:{...canonical.qnaAnswers,...received.qnaAnswers}});
    canonical = next;
    ready = true; syncError = false; publish(next);
    try { localStorage.setItem(`cookpath-account:${id}`,JSON.stringify(next)); } catch {}
    paintStatus(); return next;
  }
  async function refresh() { return rpc('cookpath_get_progress'); }
  async function acceptSession(session) {
    const nextUser = session?.user || null;
    if (nextUser?.id && nextUser.id === user?.id) return;
    generation++; user = nextUser; ready = false; syncError = false; canonical = P.fresh(); publish(P.fresh()); paintStatus();
    if (!user) return;
    try {
      await refresh();
      let imported = false; try { imported = localStorage.getItem(`cookpath-imported:${user.id}`) === 'yes'; } catch {}
      if (!imported && (legacy.completed.length || Object.keys(legacy.qnaAnswers).length)) open();
      else if (dialog?.open) renderDialog();
    } catch {
      try { publish(P.normalize(JSON.parse(localStorage.getItem(`cookpath-account:${user.id}`)||'null'))); } catch {}
      paintStatus(L('Could not load account progress · open your account to retry','Δεν φορτώθηκε η πρόοδος · ανοίξτε τον λογαριασμό για νέα προσπάθεια'));
    }
  }
  async function start({onState,legacyProgress}) {
    if (!enabled) return;
    publish = onState; legacy = P.normalize(legacyProgress);
    const url = new URL(config.supabaseUrl);
    if (url.protocol !== 'https:' || !config.publishableKey || config.publishableKey.startsWith('sb_secret_')) throw new Error('Invalid public account configuration');
    if (config.publishableKey.startsWith('eyJ')) {
      const payload = JSON.parse(atob(config.publishableKey.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
      if (payload.role !== 'anon') throw new Error('Only public Supabase keys are allowed');
    }
    if (!window.supabase) await new Promise((resolve,reject) => {
      const script = document.createElement('script'); script.src = 'vendor/supabase.js'; script.onload = resolve; script.onerror = reject; document.head.append(script);
    });
    client = window.supabase.createClient(config.supabaseUrl,config.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    dialog = document.createElement('dialog'); dialog.className = 'account-dialog'; dialog.setAttribute('aria-labelledby','account-title'); document.body.append(dialog);
    const host = document.createElement('div'); host.className = 'account-controls';
    status = document.createElement('span'); status.className = 'account-save-status'; status.setAttribute('role','status');
    button = document.createElement('button'); button.className = 'btn account-button'; button.onclick = open;
    host.append(status,button); document.querySelector('.status').prepend(host); paintStatus();
    client.auth.onAuthStateChange((_event,session) => { setTimeout(()=>acceptSession(session).catch(()=>{}),0); });
    const {data,error} = await client.auth.getSession();
    if (error) throw error;
    await acceptSession(data.session);
    if (location.hash.includes('error')) { open(); notice(L('This sign-in link has expired. Request a new one.','Ο σύνδεσμος σύνδεσης έχει λήξει. Ζητήστε νέο σύνδεσμο.'),true); }
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
