  (()=>{
    const {choose:L,translate:T,changeLanguage}=window.COOKPATH_I18N;
    const TASKS=window.COOKPATH_TASKS||[], QUESTIONS=window.COOKPATH_QUESTIONS||[], DAYS=window.COOKPATH_PLAN||[], CHEF_QUOTES=window.COOKPATH_QUOTES||[], KEY='cookpath-monthly-v5';
    const P=window.COOKPATH_PROGRESS,A=window.COOKPATH_ACCOUNTS;
    let state=P.fresh(),legacyProgress=P.fresh(),busy=false,pendingChoice=null;
    let selectedLessonDay=1,selectedQADay=1;
    const openedRecipes=new Set();
    const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
    const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const dayTasks=n=>TASKS.filter(t=>t.day===n);
    const dayQuestions=n=>QUESTIONS.filter(q=>q.day===n);
    function readLocal(){try{return P.normalize(JSON.parse(localStorage.getItem(KEY)||localStorage.getItem('cookpath-monthly-v4')||'null'))}catch{return P.normalize(state)}}
    function load(){legacyProgress=readLocal();state=A.enabled?P.fresh():legacyProgress}
    function save(next){localStorage.setItem(KEY,JSON.stringify(next));state=next;return next}
    function applyProgress(next){state=P.normalize(next);$('#progress-storage-note').textContent=!A.enabled?L('Progress is saved on this device.','Η πρόοδος αποθηκεύεται σε αυτή τη συσκευή.'):A.signedIn?L('Progress is saved to your personal account.','Η πρόοδος αποθηκεύεται στον προσωπικό σας λογαριασμό.'):L('Sign in to save your progress across devices.','Συνδεθείτε για να αποθηκεύετε την πρόοδό σας σε κάθε συσκευή.');renderLessons();if($('#page-qa').classList.contains('active'))renderQA()}
    function toast(msg){const t=$('#toast');t.textContent=msg;t.style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.style.display='none',3200)}
    function dayDone(day){return !!state.dayCompletions[day]}
    function firstIncompleteDay(){for(let d=1;d<=30;d++)if(!dayDone(d))return d;return 31}
    function dayIsAvailable(day){return P.available(state,day)}
    function availableOrCurrentDay(){const d=firstIncompleteDay();return d>30?30:d}
    function taskComplete(id){return state.completed.includes(id)}
    function dayProgress(day){const ts=dayTasks(day),qs=dayQuestions(day),done=ts.filter(t=>taskComplete(t.id)).length,qa=qs.filter(q=>state.qnaAnswers[q.id]!==undefined).length,correct=qs.filter(q=>state.qnaAnswers[q.id]?.correct).length;return {done,qa,correct,total:ts.length,questions:qs.length}}
    function notifyComplete(day,wasComplete){if(!wasComplete&&dayDone(day))toast(day===30?L('All 30 challenges complete — wonderful work.','Ολοκληρώσατε και τις 30 προκλήσεις. Μπράβο!'):L('Challenge complete. Your next five tasks are ready.','Η πρόκληση ολοκληρώθηκε. Οι επόμενες πέντε ασκήσεις είναι έτοιμες.'))}
    function showNextQuote(){if(!CHEF_QUOTES.length)return;let previous=-1;try{previous=Number(sessionStorage.getItem('cookpath-quote-index')??-1)}catch(e){}let index=Math.floor(Math.random()*CHEF_QUOTES.length);if(CHEF_QUOTES.length>1&&index===previous)index=(previous+1+Math.floor(Math.random()*(CHEF_QUOTES.length-1)))%CHEF_QUOTES.length;const q=CHEF_QUOTES[index];window.COOKPATH_SHOW_PORTRAIT?.(q);try{sessionStorage.setItem('cookpath-quote-index',String(index))}catch(e){}$('#quote-text').textContent=`${L(`“${q.quote}”`,`«${T(q.quote)}»`)}`;$('#quote-credit').textContent=`— ${T(q.chef)} · ${T(q.origin)}`;const source=$('#quote-source');const sourceName=q.source.replace("translated from Spanish",L("translated from Spanish","μετάφραση από τα ισπανικά"));source.textContent=`${L("Source","Πηγή")}: ${sourceName}`;source.href=q.url;source.setAttribute('aria-label',L(`Read the source for this quote from ${q.chef}`,`Δείτε την πηγή για το απόσπασμα του/της ${T(q.chef)} στο ${sourceName}`))}
    function page(name){$$('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===name));$$('.page').forEach(p=>p.classList.toggle('active',p.id===`page-${name}`));if(name==='lessons')renderLessons();if(name==='qa')renderQA();window.scrollTo({top:0,behavior:'smooth'})}
    $$('.nav button').forEach(b=>b.onclick=()=>page(b.dataset.page));
    $$('[data-go]').forEach(b=>b.onclick=()=>page(b.dataset.go));
    $('#language-select').onchange=event=>{
      try{sessionStorage.setItem('cookpath-language-return',JSON.stringify({view:$('.nav button.active').dataset.page,lesson:selectedLessonDay,qa:selectedQADay}));}catch{}
      changeLanguage(event.target.value);
    };
    function renderLessons(){
      const done=state.completed.length,day=availableOrCurrentDay();selectedLessonDay=Math.min(selectedLessonDay,30);
      $('#total-done').textContent=done;$('#all-progress-label').textContent=`${done} / 150`;
      $('#all-progress').style.width=`${done/150*100}%`;
      $('#lesson-days').innerHTML=DAYS.map((d,i)=>{const n=i+1,p=dayProgress(n),available=dayIsAvailable(n),isDone=dayDone(n),cls=isDone?'done':n===selectedLessonDay?'active':!available?'locked':'';return `<button class="day-chip ${cls}" data-day="${n}">${L("Challenge","Πρόκληση")} ${String(n).padStart(2,'0')}<small>${isDone?L("Complete","Ολοκληρώθηκε"):available?`${p.done}/5 ${L("tasks","ασκήσεις")}`:L("Preview","Προεπισκόπηση")}</small></button>`}).join('');
      $$('#lesson-days .day-chip').forEach(b=>b.onclick=()=>{selectedLessonDay=+b.dataset.day;renderLessons()});
      const host=$('#lesson-content'),theme=DAYS[selectedLessonDay-1].theme,p=dayProgress(selectedLessonDay),isDone=dayDone(selectedLessonDay),available=dayIsAvailable(selectedLessonDay),preview=selectedLessonDay>day&&!isDone,canComplete=selectedLessonDay===day&&available&&!isDone;
      const waitingForQuiz=p.done===5&&p.qa<10;
      host.innerHTML=`<div class="day-banner"><div><div class="eyebrow">${L("Challenge","Πρόκληση")} ${String(selectedLessonDay).padStart(2,'0')} ${L("of","από")} 30 ${preview?L("· preview","· προεπισκόπηση"):""}</div><h2>${esc(theme)}</h2><p>${L('Five practical tasks · ten untimed multiple-choice questions','Πέντε πρακτικές ασκήσεις · δέκα ερωτήσεις πολλαπλής επιλογής χωρίς χρονικό όριο')}</p></div><div class="day-count">${p.done}/5 ${L("tasks","ασκήσεις")} · ${p.qa}/10 ${L("questions answered","απαντημένες ερωτήσεις")}</div></div>${preview?L('<div class="notice">Preview this challenge’s teaching. Complete the previous challenges to unlock its tasks.</div>','<div class="notice">Προεπισκόπηση του μαθήματος. Ολοκληρώστε τις προηγούμενες προκλήσεις για να ανοίξουν οι ασκήσεις.</div>'):''}${waitingForQuiz&&canComplete?L('<div class="notice">All five tasks are complete. Answer this challenge’s ten quiz questions to finish the set.</div>','<div class="notice">Ολοκληρώσατε και τις πέντε ασκήσεις. Απαντήστε στις δέκα ερωτήσεις για να ολοκληρώσετε την πρόκληση.</div>'):''}<div class="task-list">${dayTasks(selectedLessonDay).map(t=>renderTask(t,canComplete,preview)).join('')}</div>${isDone?L('<div class="notice green">Challenge complete. The next set is ready when you are.</div>','<div class="notice green">Η πρόκληση ολοκληρώθηκε. Η επόμενη ενότητα είναι έτοιμη όταν είστε κι εσείς.</div>'):''}`;
      const recipe=window.COOKPATH_RECIPES?.[selectedLessonDay-1];
      if(recipe){
        host.querySelector('.day-banner').insertAdjacentHTML('afterend',renderRecipe(recipe,available||isDone));
        const details=host.querySelector('.day-recipe');
        if(details instanceof HTMLDetailsElement)details.addEventListener('toggle',()=>details.open?openedRecipes.add(recipe.day):openedRecipes.delete(recipe.day));
      }
      host.querySelectorAll('[data-complete]').forEach(button=>button.onclick=async()=>{
        if(busy)return;
        if(A.enabled&&!A.canWrite){A.open();return}
        const id=+button.dataset.complete,challenge=Math.ceil(id/5),wasComplete=dayDone(challenge);
        busy=true;renderLessons();
        try{state=A.enabled?await A.completeTask(id):save(P.completeTask(readLocal(),id));notifyComplete(challenge,wasComplete)}
        catch{toast(L('Could not save this task. Check your connection and try again.','Η άσκηση δεν αποθηκεύτηκε. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.'))}
        finally{busy=false;renderLessons()}
      });

    }
    function renderRecipe(r,available){
      const heading=`<img src="${esc(r.image)}" alt="" width="720" height="480" loading="lazy" decoding="async"><span class="recipe-heading"><span class="eyebrow">${L('Put this challenge into practice','Εφαρμόστε την τεχνική της πρόκλησης')}</span><strong class="recipe-title">${esc(r.title)}</strong><span class="recipe-skill">${esc(r.skill)}</span><span class="recipe-meta"><span>${esc(r.time)}</span><span>${esc(r.servings)}</span></span></span>`;
      if(!available)return `<article class="day-recipe"><div class="recipe-summary">${heading}<span class="recipe-toggle">${L("Opens with challenge","Ανοίγει με την πρόκληση")} ${r.day}</span></div></article>`;
      return `<details class="day-recipe" ${openedRecipes.has(r.day)?'open':''}><summary class="recipe-summary">${heading}<span class="recipe-toggle"><span class="recipe-expand">${L('View recipe','Προβολή συνταγής')}</span><span class="recipe-collapse">${L('Hide recipe','Απόκρυψη συνταγής')}</span></span></summary><div class="recipe-body"><div class="recipe-method"><section><h4>${L('Ingredients','Υλικά')}</h4><ul>${r.ingredients.map(item=>`<li>${esc(item)}</li>`).join('')}</ul></section><section><h4>${L('Step by step','Βήμα προς βήμα')}</h4><ol>${r.steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol></section></div><figure class="recipe-photo"><img src="${esc(r.image)}" alt="${L("Serving illustration for","Ενδεικτική παρουσίαση:")} ${esc(r.title)}" width="720" height="480" loading="lazy" decoding="async"><figcaption class="recipe-image-note">${L('AI generated serving illustration','Ενδεικτική εικόνα από τεχνητή νοημοσύνη')}</figcaption></figure></div></details>`;
    }
    function renderTask(t,canComplete,preview){
      const done=taskComplete(t.id);
      let status='';
      if(done)status=L('<div class="eval-result pass"><b>Completed ✓</b> · self-confirmed practice</div>','<div class="eval-result pass"><b>Ολοκληρώθηκε ✓</b> · επιβεβαιώσατε την εξάσκηση</div>');
      else if(canComplete)status=`<div class="photo-row"><button class="btn" data-complete="${t.id}" ${busy?'disabled':''}>${L('Mark task complete','Ολοκλήρωση άσκησης')}</button></div>`;
      else if(preview)status=L('<div class="locked-text">Preview only · complete the previous challenges to unlock this task.</div>','<div class="locked-text">Μόνο προεπισκόπηση · ολοκληρώστε τις προηγούμενες προκλήσεις για να ανοίξει αυτή η άσκηση.</div>');
      return `<article class="task ${done?'complete':''}"><div class="task-num">${done?'✓':String(t.slot).padStart(2,'0')}</div><div><h3>${esc(t.title)}</h3><p><b>${L('Do:','Εκτέλεση:')}</b> ${esc(t.how)}</p><div class="why"><b>${L('Why it matters','Γιατί έχει σημασία')}</b><p>${esc(t.why)}</p></div><p class="proof"><b>${L('Practice check:','Έλεγχος εξάσκησης:')}</b> ${esc(t.proof)}</p>${status}</div></article>`;
    }
    function renderQA(){
      const current=availableOrCurrentDay();
      $('#qa-days').innerHTML=DAYS.map((d,i)=>{const n=i+1;return `<button data-qday="${n}" class="${n===selectedQADay?'active':''}">${L('Challenge','Πρόκληση')} ${String(n).padStart(2,'0')} · ${esc(d.theme)}${dayDone(n)?' ✓':n>current?L(' · preview',' · προεπισκόπηση'):''}</button>`}).join('');
      $$('[data-qday]').forEach(b=>b.onclick=()=>{selectedQADay=+b.dataset.qday;renderQA()});
      const qs=dayQuestions(selectedQADay),host=$('#qa-content'),prog=dayProgress(selectedQADay),canAnswer=dayIsAvailable(selectedQADay)||dayDone(selectedQADay);
      $('#qa-progress-label').textContent=canAnswer?`${prog.qa} / 10`:L('Preview','Προεπισκόπηση');$('#qa-progress').style.width=canAnswer?`${prog.qa*10}%`:'0%';updateLevel();
      host.innerHTML=`<div class="day-banner"><div><div class="eyebrow">${selectedQADay===current?L('Current Q&A set','Τρέχον κουίζ'):dayDone(selectedQADay)?L('Review set','Κουίζ επανάληψης'):L('Preview set','Προεπισκόπηση κουίζ')}</div><h2>${L('Challenge','Πρόκληση')} ${String(selectedQADay).padStart(2,'0')} · ${esc(DAYS[selectedQADay-1].theme)}</h2><p>${L('Ten questions. Three choices each. Your first answer is final.','Δέκα ερωτήσεις με τρεις επιλογές. Η πρώτη απάντηση είναι οριστική.')}</p></div><div class="day-count">${canAnswer?`${prog.qa}/10 ${L('answered','απαντήσεις')} · ${prog.correct} ${L('correct','σωστές')}`:L('Preview only','Μόνο προεπισκόπηση')}</div></div>
      ${!canAnswer?`<div class="notice">${L('Complete the earlier challenges to submit answers here. You can read the questions in advance.','Ολοκληρώστε τις προηγούμενες προκλήσεις για να υποβάλετε απαντήσεις εδώ. Μπορείτε να διαβάσετε τις ερωτήσεις από πριν.')}</div>`:A.enabled&&!A.canWrite?`<div class="notice">${A.signedIn?L('Open your account to reload your saved progress before continuing.','Ανοίξτε τον λογαριασμό για να φορτώσετε την αποθηκευμένη πρόοδο πριν συνεχίσετε.'):L('Sign in to save your tasks and permanent quiz answers.','Συνδεθείτε για να αποθηκεύσετε τις ασκήσεις και τις οριστικές απαντήσεις σας.')} <button class="btn outline" data-account-open>${L('Open my account','Άνοιγμα λογαριασμού')}</button></div>`:''}
      <div class="qa-list">${qs.map(q=>{
        const answer=state.qnaAnswers[q.id],correct=answer&&answer.correct,selected=answer?.selectedIndex??(pendingChoice?.id===q.id?pendingChoice.choice:undefined);
        return `<article class="qa-card"><div class="qa-head"><small>${L('QUESTION','ΕΡΩΤΗΣΗ')} ${String(q.number).padStart(2,'0')} / 10 · ${L('TASK','ΑΣΚΗΣΗ')} ${q.taskId} / 150</small><small>${esc(q.kind)}</small></div><div class="question-task">${esc(q.taskTitle)}</div><div class="question" id="prompt-${q.id}">${esc(q.prompt)}</div><fieldset class="choice-list" aria-labelledby="prompt-${q.id}" ${answer||busy||!canAnswer||(A.enabled&&!A.canWrite)?'disabled':''} ${pendingChoice?.id===q.id?'aria-busy="true"':''}>${q.choices.map((choice,i)=>`<label class="choice-button ${answer&&i===q.correctIndex?'correct':''} ${answer&&i===answer.selectedIndex&&!correct?'incorrect':''}"><input type="radio" name="question-${q.id}" value="${i}" data-question="${q.id}" data-choice="${i}" ${i===selected?'checked':''}><span>${L('ABC'[i],'ΑΒΓ'[i])}. ${esc(choice)}</span></label>`).join('')}</fieldset>${answer?`<div class="choice-feedback ${correct?'correct':'incorrect'}" role="status"><b>${correct?L('Correct.','Σωστά.'):L('Not quite. The best answer is highlighted.','Όχι ακριβώς. Η σωστή απάντηση έχει επισημανθεί.')}</b> ${esc(q.explanation)}</div><p class="answer-final">${L('Answer saved. Your first choice is final.','Η απάντηση αποθηκεύτηκε. Η πρώτη επιλογή είναι οριστική.')}</p>`:''}</article>`;
      }).join('')}</div>`;
      host.querySelector('[data-account-open]')?.addEventListener('click',()=>A.open());
      host.querySelectorAll('input[data-question]').forEach(input=>input.onchange=async()=>{
        const question=QUESTIONS.find(q=>q.id===+input.dataset.question),choice=+input.dataset.choice;
        if(busy||!canAnswer||state.qnaAnswers[question.id]!==undefined)return;
        if(A.enabled&&!A.canWrite){A.open();return}
        const challenge=question.day,wasComplete=dayDone(challenge);busy=true;pendingChoice={id:question.id,choice};renderQA();
        try{state=A.enabled?await A.answer(question.id,choice):save(P.answer(readLocal(),question.id,choice));notifyComplete(challenge,wasComplete)}
        catch{toast(L('Could not confirm your answer. Check your connection and try again.','Η απάντηση δεν επιβεβαιώθηκε. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.'))}
        finally{busy=false;pendingChoice=null;renderQA();renderLessons()}
      });
    }
    function updateLevel(){const answers=Object.values(state.qnaAnswers),correct=answers.filter(x=>x.correct).length,total=answers.length;let title=L('Let’s find your starting point','Ας βρούμε το σημείο εκκίνησής σας'),copy=L('Answer the ten questions in each challenge. Your snapshot updates as you work through all 300 choices.','Απαντήστε στις δέκα ερωτήσεις κάθε πρόκλησης. Η εικόνα της προόδου σας ενημερώνεται καθώς προχωράτε στο σύνολο των 300 ερωτήσεων.');if(total){const ratio=correct/total;if(total<10){title=L('Curious beginner','Αρχάριος με περιέργεια');copy=L(`You have answered ${total} question${total===1?'':'s'} so far. Keep exploring; this first snapshot is still taking shape.`,`Μέχρι στιγμής έχετε απαντήσει σε ${total} ${total===1?'ερώτηση':'ερωτήσεις'}. Συνεχίστε την εξάσκηση για μια πιο ολοκληρωμένη εικόνα.`)}else if(ratio<.4){title=L('Building the foundations','Χτίζετε τις βάσεις');copy=L(`You chose the best answer on ${correct} of ${total} questions. Keep learning technique by technique.`,`Επιλέξατε τη σωστή απάντηση σε ${correct} από ${total} ερωτήσεις. Συνεχίστε μία τεχνική τη φορά.`)}else if(ratio<.75){title=L('Growing cook','Εξελίσσεστε στην κουζίνα');copy=L(`You chose the best answer on ${correct} of ${total} questions. Keep practicing the ideas that need another round.`,`Επιλέξατε τη σωστή απάντηση σε ${correct} από ${total} ερωτήσεις. Εξασκηθείτε ξανά στα σημεία που σας δυσκόλεψαν.`)}else{title=L('Confident kitchen learner','Μαθαίνετε με αυτοπεποίθηση');copy=L(`You chose the best answer on ${correct} of ${total} questions. Keep sharpening your judgment with each set of tasks.`,`Επιλέξατε τη σωστή απάντηση σε ${correct} από ${total} ερωτήσεις. Συνεχίστε να καλλιεργείτε την κρίση σας με τις ασκήσεις κάθε πρόκλησης.`)}}$('#level-title').textContent=title;$('#level-copy').textContent=copy}
    function init(){load();showNextQuote();$('#quote-next').onclick=showNextQuote;if(!TASKS.length)return;const today=availableOrCurrentDay();selectedLessonDay=today;selectedQADay=today;
      let resume;
      try{resume=JSON.parse(sessionStorage.getItem('cookpath-language-return')||'null');sessionStorage.removeItem('cookpath-language-return');}catch{}
      if(resume){
        if(Number.isInteger(resume.lesson)&&resume.lesson>=1&&resume.lesson<=30)selectedLessonDay=resume.lesson;
        if(Number.isInteger(resume.qa)&&resume.qa>=1&&resume.qa<=30)selectedQADay=resume.qa;
      }
      renderLessons();
      if(resume&&['welcome','lessons','qa','knives','about'].includes(resume.view))page(resume.view);
      if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js?v=26').catch(()=>{});
      if(A.enabled)A.start({legacyProgress,onState:applyProgress}).catch(()=>toast(L('Account connection is unavailable. Please try again.','Η σύνδεση λογαριασμού δεν είναι διαθέσιμη. Δοκιμάστε ξανά.')));
      else window.addEventListener('storage',event=>{if(event.key===KEY)applyProgress(readLocal())});
    }

    init();
  })();
