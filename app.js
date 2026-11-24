  (()=>{
    const {choose:L,translate:T,changeLanguage}=window.COOKPATH_I18N;
    const TASKS=window.COOKPATH_TASKS||[], QUESTIONS=window.COOKPATH_QUESTIONS||[], DAYS=window.COOKPATH_PLAN||[], CHEF_QUOTES=window.COOKPATH_QUOTES||[], KEY='cookpath-monthly-v5';
    const P=window.COOKPATH_PROGRESS,A=window.COOKPATH_ACCOUNTS;
    let state=P.fresh(),legacyProgress=P.fresh(),busy=false,pendingChoice=null;
    let selectedLessonDay=1,selectedQADay=1,currentPage='welcome',selectionTouched=false;
    const openTasks=new Map(),questionPositions=new Map();
    const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)');
    let foodIndex=0,foodTimer,foodPaused=false;
    const openedRecipes=new Set();
    const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
    const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const dayTasks=n=>TASKS.filter(t=>t.day===n);
    const dayQuestions=n=>QUESTIONS.filter(q=>q.day===n);
    function readLocal(){try{return P.normalize(JSON.parse(localStorage.getItem(KEY)||localStorage.getItem('cookpath-monthly-v4')||'null'))}catch{return P.normalize(state)}}
    function load(){legacyProgress=readLocal();state=A.enabled?P.fresh():legacyProgress}
    function save(next){localStorage.setItem(KEY,JSON.stringify(next));state=next;return next}
    function applyProgress(next){
      state=P.normalize(next);
      if(!selectionTouched){selectedLessonDay=availableOrCurrentDay();selectedQADay=selectedLessonDay;openTasks.delete(selectedLessonDay);questionPositions.delete(selectedQADay);}
      $('#progress-storage-note').textContent=!A.enabled?L('Progress is saved on this device.','Η πρόοδος αποθηκεύεται σε αυτή τη συσκευή.'):A.signedIn?L('Progress is saved to your personal account.','Η πρόοδος αποθηκεύεται στον προσωπικό σας λογαριασμό.'):L('Sign in to save your progress across devices.','Συνδεθείτε για να αποθηκεύετε την πρόοδό σας σε κάθε συσκευή.');
      renderHome();renderLessons();if(currentPage==='qa')renderQA();
    }
    function toast(msg){const t=$('#toast');t.textContent=msg;t.style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.style.display='none',3200)}
    function dayDone(day){return !!state.dayCompletions[day]}
    function firstIncompleteDay(){for(let d=1;d<=30;d++)if(!dayDone(d))return d;return 31}
    function dayIsAvailable(day){return P.available(state,day)}
    function availableOrCurrentDay(){const d=firstIncompleteDay();return d>30?30:d}
    function taskComplete(id){return state.completed.includes(id)}
    function dayProgress(day){const ts=dayTasks(day),qs=dayQuestions(day),done=ts.filter(t=>taskComplete(t.id)).length,qa=qs.filter(q=>state.qnaAnswers[q.id]!==undefined).length,correct=qs.filter(q=>state.qnaAnswers[q.id]?.correct).length;return {done,qa,correct,total:ts.length,questions:qs.length}}
    function notifyComplete(day,wasComplete){if(!wasComplete&&dayDone(day))toast(day===30?L('All 30 challenges complete — wonderful work.','Ολοκληρώσατε και τις 30 προκλήσεις. Μπράβο!'):L('Challenge complete. Your next five tasks are ready.','Η πρόκληση ολοκληρώθηκε. Οι επόμενες πέντε ασκήσεις είναι έτοιμες.'))}
    function showNextQuote(){if(!CHEF_QUOTES.length)return;let previous=-1;try{previous=Number(sessionStorage.getItem('cookpath-quote-index')??-1)}catch(e){}let index=Math.floor(Math.random()*CHEF_QUOTES.length);if(CHEF_QUOTES.length>1&&index===previous)index=(previous+1+Math.floor(Math.random()*(CHEF_QUOTES.length-1)))%CHEF_QUOTES.length;const q=CHEF_QUOTES[index];window.COOKPATH_SHOW_PORTRAIT?.(q);try{sessionStorage.setItem('cookpath-quote-index',String(index))}catch(e){}$('#quote-text').textContent=`${L(`“${q.quote}”`,`«${T(q.quote)}»`)}`;$('#quote-credit').textContent=`— ${T(q.chef)} · ${T(q.origin)}`;const source=$('#quote-source');const sourceName=q.source.replace("translated from Spanish",L("translated from Spanish","μετάφραση από τα ισπανικά"));source.textContent=`${L("Source","Πηγή")}: ${sourceName}`;source.href=q.url;source.setAttribute('aria-label',L(`Read the source for this quote from ${q.chef}`,`Δείτε την πηγή για το απόσπασμα του/της ${T(q.chef)} στο ${sourceName}`))}
    const views=['welcome','lessons','qa','explore','cuisines','knives','about'];
    const viewHash={welcome:'home',lessons:'learn',qa:'quiz',explore:'explore',cuisines:'cuisines',knives:'knives',about:'about'};
    function page(name,{scroll=true,remember=true}={}){
      if(!views.includes(name))return;
      currentPage=name;document.documentElement.dataset.view=name;
      const navName=['cuisines','knives','about'].includes(name)?'explore':name;
      $$('.nav button').forEach(b=>{const active=b.dataset.page===navName;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
      $$('.page').forEach(p=>p.classList.toggle('active',p.id===`page-${name}`));
      if(name==='lessons')renderLessons();if(name==='qa')renderQA();
      syncFoodMotion();
      if(remember&&location.hash!==`#${viewHash[name]}`)history.pushState(null,'',`#${viewHash[name]}`);
      if(scroll){window.scrollTo({top:0,behavior:reducedMotion?.matches?'instant':'smooth'});const heading=$(`#page-${name} h1`);heading?.setAttribute('tabindex','-1');heading?.focus({preventScroll:true});}
    }
    document.querySelector('.shell').addEventListener('click',event=>{
      const go=event.target.closest('[data-page],[data-go],[data-quiz-challenge]');if(!go)return;
      if(go.hasAttribute('data-quiz-challenge')){selectedQADay=+go.dataset.quizChallenge;selectionTouched=true;page('qa');return;}
      const target=go.dataset.page||go.dataset.go;if(['lessons','qa'].includes(target))selectionTouched=true;page(target);
    });
    window.addEventListener('popstate',()=>{const name=Object.keys(viewHash).find(key=>viewHash[key]===location.hash.slice(1));page(name||'welcome',{remember:false});});
    $('#language-select').onchange=event=>{
      try{sessionStorage.setItem('cookpath-language-return',JSON.stringify({view:currentPage,lesson:selectedLessonDay,qa:selectedQADay,question:questionPositions.get(selectedQADay)}));}catch{}
      changeLanguage(event.target.value);
    };
    function renderHome(){
      const day=availableOrCurrentDay(),p=dayProgress(day),finished=firstIncompleteDay()>30;
      $('#home-challenge-label').textContent=finished?L('ALL 30 CHALLENGES COMPLETE','ΟΛΟΚΛΗΡΩΣΑΤΕ ΚΑΙ ΤΙΣ 30 ΠΡΟΚΛΗΣΕΙΣ'):L(`YOUR NEXT STEP · CHALLENGE ${String(day).padStart(2,'0')}`,`ΤΟ ΕΠΟΜΕΝΟ ΒΗΜΑ · ΠΡΟΚΛΗΣΗ ${String(day).padStart(2,'0')}`);
      $('#home-challenge-title').textContent=finished?L('Look how far you’ve come.','Δείτε πόσο έχετε προχωρήσει.'):DAYS[day-1]?.theme||'';
      $('#home-next-copy').textContent=finished?L('Revisit your favourite techniques and keep cooking with confidence.','Επιστρέψτε στις αγαπημένες σας τεχνικές και συνεχίστε με αυτοπεποίθηση.'):p.done===5?L('Your five tasks are done. Finish the ten questions to unlock your next challenge.','Οι πέντε ασκήσεις ολοκληρώθηκαν. Απαντήστε στις δέκα ερωτήσεις για να ανοίξει η επόμενη πρόκληση.'):L('Start with one practical task. Read the steps, try it in your kitchen, then mark it complete.','Ξεκινήστε με μία πρακτική άσκηση. Διαβάστε τα βήματα, δοκιμάστε την στην κουζίνα και επιβεβαιώστε την ολοκλήρωση.');
      const button=$('#home-continue');button.disabled=A.enabled&&!A.canWrite;$('#home-next').setAttribute('aria-busy',String(button.disabled));button.dataset.target=!finished&&p.done===5?'qa':'lessons';
      button.innerHTML=`${finished?L('Revisit your lessons','Επιστροφή στα μαθήματα'):p.done===5?L('Continue to the quiz','Συνέχεια στο κουίζ'):p.done?L('Continue practising','Συνεχίστε την εξάσκηση'):L('Start this challenge','Ξεκινήστε την πρόκληση')} <span aria-hidden="true">↗</span>`;
      if(button.disabled)button.textContent=L('Loading your progress…','Φόρτωση της προόδου σας…');
      $('#home-progress-text').textContent=L(`${p.done}/5 tasks · ${p.qa}/10 questions`,`${p.done}/5 ασκήσεις · ${p.qa}/10 ερωτήσεις`);
      $('#home-progress').style.width=`${(p.done+p.qa)/15*100}%`;
      $('#home-challenges-done').textContent=`${Object.keys(state.dayCompletions).length} / 30`;
      $('#home-tasks-done').textContent=`${state.completed.length} / 150`;
      $('#home-answers-done').textContent=`${Object.keys(state.qnaAnswers).length} / 300`;
    }
    $('#home-continue').onclick=()=>{const day=availableOrCurrentDay();selectedLessonDay=day;selectedQADay=day;selectionTouched=true;openTasks.set(day,dayTasks(day).find(t=>!taskComplete(t.id))?.id||dayTasks(day)[0]?.id);const first=dayQuestions(day).findIndex(q=>!state.qnaAnswers[q.id]);questionPositions.set(day,Math.max(first,0));page($('#home-continue').dataset.target);};
    $('#home-account-progress').onclick=()=>A.openProgress?A.openProgress():A.open();
    function showFood(index){
      foodIndex=index;$$('.food-slide').forEach((slide,i)=>{slide.classList.toggle('active',i===index);slide.setAttribute('aria-hidden',String(i!==index));});
      $$('[data-food-slide]').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
    }
    function syncFoodMotion(){
      clearInterval(foodTimer);
      const paused=foodPaused||reducedMotion?.matches||document.hidden||currentPage!=='welcome';
      $('.food-story').classList.toggle('is-paused',!!paused);
      const button=$('#food-pause');button.hidden=!!reducedMotion?.matches;button.textContent=foodPaused?'▶':'Ⅱ';button.setAttribute('aria-label',foodPaused?L('Play animation','Έναρξη κίνησης'):L('Pause animation','Παύση κίνησης'));
      if(!paused)foodTimer=setInterval(()=>showFood((foodIndex+1)%$$('.food-slide').length),6500);
    }
    $$('[data-food-slide]').forEach(button=>button.onclick=()=>{showFood(+button.dataset.foodSlide);syncFoodMotion();});
    $('#food-pause').onclick=()=>{foodPaused=!foodPaused;syncFoodMotion();};
    document.addEventListener('visibilitychange',syncFoodMotion);reducedMotion?.addEventListener?.('change',syncFoodMotion);
    function focusTask(){if(currentPage!=='lessons')return;const detail=$(`#lesson-content details.task[open]`);detail?.querySelector('summary')?.focus({preventScroll:true});detail?.scrollIntoView?.({block:'nearest',behavior:reducedMotion?.matches?'instant':'smooth'});}
    function renderLessons(){
      const done=state.completed.length,day=availableOrCurrentDay();selectedLessonDay=Math.min(selectedLessonDay,30);
      $('#lesson-selection').textContent=L(`Challenge ${String(selectedLessonDay).padStart(2,'0')} / 30`,`Πρόκληση ${String(selectedLessonDay).padStart(2,'0')} / 30`);
      if(!openTasks.has(selectedLessonDay))openTasks.set(selectedLessonDay,dayTasks(selectedLessonDay).find(t=>!taskComplete(t.id))?.id||dayTasks(selectedLessonDay)[0]?.id);
      $('#total-done').textContent=done;$('#all-progress-label').textContent=`${done} / 150`;
      $('#all-progress').style.width=`${done/150*100}%`;
      $('#lesson-days').innerHTML=DAYS.map((d,i)=>{const n=i+1,p=dayProgress(n),available=dayIsAvailable(n),isDone=dayDone(n),cls=isDone?'done':n===selectedLessonDay?'active':!available?'locked':'';return `<button class="day-chip ${cls}" data-day="${n}">${L("Challenge","Πρόκληση")} ${String(n).padStart(2,'0')}<small>${isDone?L("Complete","Ολοκληρώθηκε"):available?`${p.done}/5 ${L("tasks","ασκήσεις")}`:L("Preview","Προεπισκόπηση")}</small></button>`}).join('');
      $$('#lesson-days .day-chip').forEach(b=>b.onclick=()=>{selectedLessonDay=+b.dataset.day;selectionTouched=true;$('#lesson-picker').open=false;renderLessons();focusTask()});
      const host=$('#lesson-content'),theme=DAYS[selectedLessonDay-1].theme,p=dayProgress(selectedLessonDay),isDone=dayDone(selectedLessonDay),available=dayIsAvailable(selectedLessonDay),preview=selectedLessonDay>day&&!isDone,canComplete=selectedLessonDay===day&&available&&!isDone;
      const waitingForQuiz=p.done===5&&p.qa<10;
      host.innerHTML=`<div class="day-banner"><div><div class="eyebrow">${L("Challenge","Πρόκληση")} ${String(selectedLessonDay).padStart(2,'0')} ${L("of","από")} 30 ${preview?L("· preview","· προεπισκόπηση"):""}</div><h2>${esc(theme)}</h2><p>${L('Five practical tasks · ten untimed multiple-choice questions','Πέντε πρακτικές ασκήσεις · δέκα ερωτήσεις πολλαπλής επιλογής χωρίς χρονικό όριο')}</p></div><div class="day-count">${p.done}/5 ${L("tasks","ασκήσεις")} · ${p.qa}/10 ${L("questions answered","απαντημένες ερωτήσεις")}</div></div>${preview?L('<div class="notice">Preview this challenge’s teaching. Complete the previous challenges to unlock its tasks.</div>','<div class="notice">Προεπισκόπηση του μαθήματος. Ολοκληρώστε τις προηγούμενες προκλήσεις για να ανοίξουν οι ασκήσεις.</div>'):''}${waitingForQuiz&&canComplete?L('<div class="notice">All five tasks are complete. Answer this challenge’s ten quiz questions to finish the set.</div>','<div class="notice">Ολοκληρώσατε και τις πέντε ασκήσεις. Απαντήστε στις δέκα ερωτήσεις για να ολοκληρώσετε την πρόκληση.</div>'):''}<div class="lesson-flow"><span class="active">01 ${L('Practise','Εξάσκηση')}</span><span>02 ${L('Try the recipe','Δοκιμάστε τη συνταγή')}</span><span>03 ${L('Take the quiz','Απαντήστε στο κουίζ')}</span></div><div class="task-list">${dayTasks(selectedLessonDay).map(t=>renderTask(t,canComplete,preview)).join('')}</div>${isDone?L('<div class="notice green">Challenge complete. The next set is ready when you are.</div>','<div class="notice green">Η πρόκληση ολοκληρώθηκε. Η επόμενη ενότητα είναι έτοιμη όταν είστε κι εσείς.</div>'):''}`;
      const recipe=window.COOKPATH_RECIPES?.[selectedLessonDay-1];
      if(recipe){
        host.insertAdjacentHTML('beforeend',renderRecipe(recipe,available||isDone));
        const details=host.querySelector('.day-recipe');
        if(details instanceof HTMLDetailsElement)details.addEventListener('toggle',()=>details.open?openedRecipes.add(recipe.day):openedRecipes.delete(recipe.day));
      }
      host.insertAdjacentHTML('beforeend',`<div class="challenge-next"><span>${L('Ready to test what you learned?','Έτοιμοι να δοκιμάσετε όσα μάθατε;')}</span><button class="btn secondary" type="button" data-quiz-challenge="${selectedLessonDay}">${L('Open this quiz','Άνοιγμα αυτού του κουίζ')} <span aria-hidden="true">→</span></button></div>`);
      host.querySelectorAll('details.task').forEach(details=>details.addEventListener('toggle',()=>{
        if(!details.isConnected)return;
        if(details.open){openTasks.set(selectedLessonDay,+details.dataset.task);host.querySelectorAll('details.task[open]').forEach(other=>{if(other!==details)other.open=false;});}
        else if(openTasks.get(selectedLessonDay)===+details.dataset.task)openTasks.set(selectedLessonDay,null);
      }));
      host.querySelectorAll('[data-complete]').forEach(button=>button.onclick=async()=>{
        if(busy)return;
        if(A.enabled&&!A.canWrite){A.open();return}
        const id=+button.dataset.complete,challenge=Math.ceil(id/5),wasComplete=dayDone(challenge);
        busy=true;renderLessons();
        try{state=A.enabled?await A.completeTask(id):save(P.completeTask(readLocal(),id));openTasks.set(challenge,dayTasks(challenge).find(t=>!taskComplete(t.id))?.id||id);notifyComplete(challenge,wasComplete)}
        catch{toast(L('Could not save this task. Check your connection and try again.','Η άσκηση δεν αποθηκεύτηκε. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.'))}
        finally{busy=false;renderLessons();renderHome();focusTask()}
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
      return `<details class="task ${done?'complete':''}" data-task="${t.id}" ${openTasks.get(t.day)===t.id?'open':''}><summary><span class="task-num">${done?'✓':String(t.slot).padStart(2,'0')}</span><span class="task-heading"><h3>${esc(t.title)}</h3><small>${done?L('Completed · tap to revisit','Ολοκληρώθηκε · δείτε ξανά'):L('Read, practise, understand why','Διαβάστε, εξασκηθείτε, κατανοήστε το γιατί')}</small></span><span class="task-chevron" aria-hidden="true">＋</span></summary><div class="task-body"><p><b>${L('Do:','Εκτέλεση:')}</b> ${esc(t.how)}</p><div class="why"><b>${L('Why it matters','Γιατί έχει σημασία')}</b><p>${esc(t.why)}</p></div><p class="proof"><b>${L('Practice check:','Έλεγχος εξάσκησης:')}</b> ${esc(t.proof)}</p>${status}</div></details>`;
    }
    function hostFocusQuestion(){if(currentPage==='qa')$('#qa-content .question')?.focus({preventScroll:true});}
    function renderQA(){
      const current=availableOrCurrentDay();
      $('#qa-selection').textContent=L(`Challenge ${String(selectedQADay).padStart(2,'0')} / 30`,`Πρόκληση ${String(selectedQADay).padStart(2,'0')} / 30`);
      $('#qa-days').innerHTML=DAYS.map((d,i)=>{const n=i+1;return `<button data-qday="${n}" class="${n===selectedQADay?'active':''}">${L('Challenge','Πρόκληση')} ${String(n).padStart(2,'0')} · ${esc(d.theme)}${dayDone(n)?' ✓':n>current?L(' · preview',' · προεπισκόπηση'):''}</button>`}).join('');
      $$('[data-qday]').forEach(b=>b.onclick=()=>{selectedQADay=+b.dataset.qday;selectionTouched=true;$('#qa-picker').open=false;renderQA();hostFocusQuestion();});
      const qs=dayQuestions(selectedQADay),host=$('#qa-content'),prog=dayProgress(selectedQADay),canAnswer=dayIsAvailable(selectedQADay)||dayDone(selectedQADay);
      if(!questionPositions.has(selectedQADay))questionPositions.set(selectedQADay,Math.max(0,qs.findIndex(q=>!state.qnaAnswers[q.id])));
      const position=Math.min(9,Math.max(0,questionPositions.get(selectedQADay))),q=qs[position];
      const answer=state.qnaAnswers[q.id],correct=answer?.correct,selected=answer?.selectedIndex??(pendingChoice?.id===q.id?pendingChoice.choice:undefined);
      $('#qa-progress-label').textContent=canAnswer?`${prog.qa} / 10`:L('Preview','Προεπισκόπηση');$('#qa-progress').style.width=canAnswer?`${prog.qa*10}%`:'0%';updateLevel();
      const unanswered=qs.findIndex(question=>!state.qnaAnswers[question.id]);
      host.innerHTML=`<div class="day-banner"><div><div class="eyebrow">${selectedQADay===current?L('Current quiz','Τρέχον κουίζ'):dayDone(selectedQADay)?L('Review set','Κουίζ επανάληψης'):L('Preview set','Προεπισκόπηση κουίζ')}</div><h2>${L('Challenge','Πρόκληση')} ${String(selectedQADay).padStart(2,'0')} · ${esc(DAYS[selectedQADay-1].theme)}</h2><p>${L('One question at a time. No clock. Your first answer is final.','Μία ερώτηση τη φορά. Χωρίς χρονόμετρο. Η πρώτη απάντηση είναι οριστική.')}</p></div><div class="day-count">${canAnswer?`${prog.qa}/10 ${L('answered','απαντήσεις')}`:L('Preview only','Μόνο προεπισκόπηση')}</div></div>
      ${!canAnswer?`<div class="notice">${L('Complete the earlier challenges to submit answers here. You can read the questions in advance.','Ολοκληρώστε τις προηγούμενες προκλήσεις για να υποβάλετε απαντήσεις εδώ. Μπορείτε να διαβάσετε τις ερωτήσεις από πριν.')}</div>`:A.enabled&&!A.canWrite?`<div class="notice">${L('Open your account to load your saved progress before continuing.','Ανοίξτε τον λογαριασμό για να φορτώσετε την αποθηκευμένη πρόοδο πριν συνεχίσετε.')} <button class="btn outline" data-account-open>${L('Open my account','Άνοιγμα λογαριασμού')}</button></div>`:''}
      <div class="quiz-wrap"><div class="quiz-stepper" aria-label="${L('Question navigation','Πλοήγηση ερωτήσεων')}">${qs.map((question,i)=>`<button type="button" class="question-step ${i===position?'active':''} ${state.qnaAnswers[question.id]?'answered':''}" data-question-position="${i}" aria-label="${L(`Question ${i+1}${state.qnaAnswers[question.id]?', answered':''}`,`Ερώτηση ${i+1}${state.qnaAnswers[question.id]?', απαντημένη':''}`)}" ${i===position?'aria-current="step"':''}>${i+1}${state.qnaAnswers[question.id]?'<span aria-hidden="true">✓</span>':''}</button>`).join('')}</div>
      <div class="quiz-stage"><article class="qa-card"><div class="qa-head"><small>${L('QUESTION','ΕΡΩΤΗΣΗ')} ${String(q.number).padStart(2,'0')} / 10</small><small>${esc(q.kind)}</small></div><div class="question-task">${esc(q.taskTitle)}</div><h3 class="question" id="prompt-${q.id}" tabindex="-1">${esc(q.prompt)}</h3><fieldset class="choice-list" aria-labelledby="prompt-${q.id}" ${answer||busy||!canAnswer||(A.enabled&&!A.canWrite)?'disabled':''} ${pendingChoice?.id===q.id?'aria-busy="true"':''}>${q.choices.map((choice,i)=>`<label class="choice-button ${answer&&i===q.correctIndex?'correct':''} ${answer&&i===answer.selectedIndex&&!correct?'incorrect':''}"><input type="radio" name="question-${q.id}" value="${i}" data-question="${q.id}" data-choice="${i}" ${i===selected?'checked':''}><span>${L('ABC'[i],'ΑΒΓ'[i])}. ${esc(choice)}</span></label>`).join('')}</fieldset>${answer?`<div class="choice-feedback ${correct?'correct':'incorrect'}" role="status"><b>${correct?L('Correct.','Σωστά.'):L('Not quite. The best answer is highlighted.','Όχι ακριβώς. Η σωστή απάντηση έχει επισημανθεί.')}</b> ${esc(q.explanation)}</div><p class="answer-final">${L('Answer saved. Your first choice is final.','Η απάντηση αποθηκεύτηκε. Η πρώτη επιλογή είναι οριστική.')}</p>`:''}</article></div>
      <div class="quiz-navigation"><button class="btn outline" type="button" data-question-position="${position-1}" ${position===0||busy?'disabled':''}>${L('← Previous','← Προηγούμενη')}</button><span class="quiz-position">${position+1} / 10</span>${position<9?`<button class="btn" type="button" data-question-position="${position+1}" ${busy?'disabled':''}>${L('Next question →','Επόμενη ερώτηση →')}</button>`:unanswered>=0?`<button class="btn" type="button" data-question-position="${unanswered}" ${busy?'disabled':''}>${L('Go to unanswered →','Στις αναπάντητες →')}</button>`:`<button class="btn" type="button" data-quiz-finish>${L('Back to your path →','Επιστροφή στην πορεία σας →')}</button>`}</div></div>`;
      host.querySelector('[data-account-open]')?.addEventListener('click',()=>A.open());
      host.querySelector('[data-quiz-finish]')?.addEventListener('click',()=>page('welcome'));
      host.querySelectorAll('[data-question-position]').forEach(button=>button.onclick=()=>{questionPositions.set(selectedQADay,+button.dataset.questionPosition);renderQA();host.querySelector('.question')?.focus({preventScroll:true});});
      host.querySelectorAll('input[data-question]').forEach(input=>input.onchange=async()=>{
        const question=QUESTIONS.find(q=>q.id===+input.dataset.question),choice=+input.dataset.choice;
        if(busy||!canAnswer||state.qnaAnswers[question.id]!==undefined)return;
        if(A.enabled&&!A.canWrite){A.open();return}
        const challenge=question.day,wasComplete=dayDone(challenge);busy=true;pendingChoice={id:question.id,choice};renderQA();
        try{state=A.enabled?await A.answer(question.id,choice):save(P.answer(readLocal(),question.id,choice));notifyComplete(challenge,wasComplete)}
        catch{toast(L('Could not confirm your answer. Check your connection and try again.','Η απάντηση δεν επιβεβαιώθηκε. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.'))}
        finally{busy=false;pendingChoice=null;renderQA();renderLessons();renderHome();host.querySelector('.choice-feedback')?.setAttribute('tabindex','-1');if(currentPage==='qa')host.querySelector('.choice-feedback')?.focus({preventScroll:true});}
      });
    }
    function updateLevel(){const answers=Object.values(state.qnaAnswers),correct=answers.filter(x=>x.correct).length,total=answers.length;let title=L('Let’s find your starting point','Ας βρούμε το σημείο εκκίνησής σας'),copy=L('Answer the ten questions in each challenge. Your snapshot updates as you work through all 300 choices.','Απαντήστε στις δέκα ερωτήσεις κάθε πρόκλησης. Η εικόνα της προόδου σας ενημερώνεται καθώς προχωράτε στο σύνολο των 300 ερωτήσεων.');if(total){const ratio=correct/total;if(total<10){title=L('Curious beginner','Αρχάριος με περιέργεια');copy=L(`You have answered ${total} question${total===1?'':'s'} so far. Keep exploring; this first snapshot is still taking shape.`,`Μέχρι στιγμής έχετε απαντήσει σε ${total} ${total===1?'ερώτηση':'ερωτήσεις'}. Συνεχίστε την εξάσκηση για μια πιο ολοκληρωμένη εικόνα.`)}else if(ratio<.4){title=L('Building the foundations','Χτίζετε τις βάσεις');copy=L(`You chose the best answer on ${correct} of ${total} questions. Keep learning technique by technique.`,`Επιλέξατε τη σωστή απάντηση σε ${correct} από ${total} ερωτήσεις. Συνεχίστε μία τεχνική τη φορά.`)}else if(ratio<.75){title=L('Growing cook','Εξελίσσεστε στην κουζίνα');copy=L(`You chose the best answer on ${correct} of ${total} questions. Keep practicing the ideas that need another round.`,`Επιλέξατε τη σωστή απάντηση σε ${correct} από ${total} ερωτήσεις. Εξασκηθείτε ξανά στα σημεία που σας δυσκόλεψαν.`)}else{title=L('Confident kitchen learner','Μαθαίνετε με αυτοπεποίθηση');copy=L(`You chose the best answer on ${correct} of ${total} questions. Keep sharpening your judgment with each set of tasks.`,`Επιλέξατε τη σωστή απάντηση σε ${correct} από ${total} ερωτήσεις. Συνεχίστε να καλλιεργείτε την κρίση σας με τις ασκήσεις κάθε πρόκλησης.`)}}$('#level-title').textContent=title;$('#level-copy').textContent=copy}
    function init(){load();showNextQuote();$('#quote-next').onclick=showNextQuote;if(!TASKS.length)return;const today=availableOrCurrentDay();selectedLessonDay=today;selectedQADay=today;
      let resume;
      try{resume=JSON.parse(sessionStorage.getItem('cookpath-language-return')||'null');sessionStorage.removeItem('cookpath-language-return');}catch{}
      if(resume){
        if(Number.isInteger(resume.lesson)&&resume.lesson>=1&&resume.lesson<=30)selectedLessonDay=resume.lesson;
        if(Number.isInteger(resume.qa)&&resume.qa>=1&&resume.qa<=30)selectedQADay=resume.qa;
        if(Number.isInteger(resume.question)&&resume.question>=0&&resume.question<10)questionPositions.set(selectedQADay,resume.question);
        selectionTouched=true;
      }
      const knives=$('#page-knives');if(knives&&!knives.querySelector('.back-link'))knives.insertAdjacentHTML('afterbegin',`<button class="back-link" type="button" data-go="explore">${L('← Back to Explore','← Επιστροφή στην Εξερεύνηση')}</button>`);
      renderHome();renderLessons();showFood(0);
      const requested=Object.keys(viewHash).find(key=>viewHash[key]===location.hash.slice(1));
      page(resume&&views.includes(resume.view)?resume.view:requested||'welcome',{scroll:false,remember:false});
      if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js?v=33').catch(()=>{});
      A.start({legacyProgress,onState:applyProgress}).catch(()=>toast(L('Account connection is unavailable. Please try again.','Η σύνδεση λογαριασμού δεν είναι διαθέσιμη. Δοκιμάστε ξανά.')));
      if(!A.enabled)window.addEventListener('storage',event=>{if(event.key===KEY)applyProgress(readLocal())});
    }

    init();
  })();
