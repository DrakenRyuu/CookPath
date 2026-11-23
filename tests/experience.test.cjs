const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require((process.env.COOKPATH_TEST_RUNTIME||'/tmp/cookpath-test-runtime')+'/node_modules/jsdom');
const root=path.join(__dirname,'..');
const tick=()=>new Promise(resolve=>setTimeout(resolve,15));

async function setup(t,{greek=false,reducedMotion=true,canWrite=true}={}) {
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
  const dom=new JSDOM(html,{url:`https://cookpath.test/?lang=${greek?'el':'en'}`,runScripts:'outside-only',pretendToBeVisual:true});
  t.after(()=>dom.window.close());
  const w=dom.window,doc=w.document;
  w.scrollTo=()=>{};
  const animations=new Map();let animationId=0;
  w.setInterval=fn=>{animations.set(++animationId,fn);return animationId;};w.clearInterval=id=>animations.delete(id);
  w.matchMedia=()=>({matches:reducedMotion,addEventListener:()=>{}});
  for(const file of ['greek.js','experience-i18n.js','language.js','lessons.js','questions.js','recipes.js','progress.js'])w.eval(fs.readFileSync(path.join(root,file),'utf8'));
  const P=w.COOKPATH_PROGRESS;
  let canonical=P.fresh(),publish,writable=canWrite;
  const writes=[];
  w.COOKPATH_ACCOUNTS={enabled:true,signedIn:true,get canWrite(){return writable;},open:()=>{},
    start:async({onState})=>{publish=onState;publish(canonical);},
    completeTask:async id=>{writes.push({task:id});canonical=P.completeTask(canonical,id);publish(canonical);return canonical;},
    answer:async(id,choice)=>{writes.push({question:id,choice});canonical=P.answer(canonical,id,choice);publish(canonical);return canonical;}
  };
  w.eval(fs.readFileSync(path.join(root,'app.js'),'utf8'));
  await tick();
  return {w,doc,P,writes,advanceAnimation(){[...animations.values()].forEach(fn=>fn());},setWritable(value){writable=value;},emit(value){canonical=P.normalize(value);publish(canonical);},get state(){return canonical;},
    completeChallenge(number=1){return {completed:Array.from({length:number*5},(_,i)=>i+1),qnaAnswers:Object.fromEntries(w.COOKPATH_QUESTIONS.filter(q=>q.day<=number).map(q=>[q.id,{selectedIndex:q.correctIndex}]))};}};
}

test('home follows delayed saved progress and returns to the next unfinished challenge',async t=>{
  const x=await setup(t),d=x.doc;
  assert.match(d.querySelector('#home-challenge-label').textContent,/CHALLENGE 01/);
  x.emit(x.completeChallenge());await tick();
  assert.match(d.querySelector('#home-challenge-label').textContent,/CHALLENGE 02/);
  assert.equal(d.querySelector('#home-tasks-done').textContent,'5 / 150');
  d.querySelector('#home-continue').click();
  assert.ok(d.querySelector('#page-lessons').classList.contains('active'));
  assert.match(d.querySelector('#lesson-selection').textContent,/02 \/ 30/);
  assert.equal(d.querySelector('details.task[open]').dataset.task,'6');
  assert.equal(d.querySelector('#lesson-picker').open,false);
});

test('Continue resumes the first unfinished task after partial saved progress and later review',async t=>{
  const x=await setup(t),d=x.doc;
  x.emit({completed:[1,2],qnaAnswers:{}});await tick();
  d.querySelector('#home-continue').click();await tick();
  assert.equal(d.querySelector('details.task[open]').dataset.task,'3');
  d.querySelector('[data-task="1"]>summary').click();await tick();
  assert.equal(d.querySelector('details.task[open]').dataset.task,'1');
  d.querySelector('[data-page="welcome"]').click();d.querySelector('#home-continue').click();await tick();
  assert.equal(d.querySelector('details.task[open]').dataset.task,'3');
  assert.equal(d.querySelector('#home-tasks-done').textContent,'2 / 150');
  assert.equal(x.writes.length,0);
});

test('Continue waits for account progress instead of navigating from a placeholder challenge',async t=>{
  const x=await setup(t,{canWrite:false}),d=x.doc,button=d.querySelector('#home-continue');
  assert.equal(button.disabled,true);
  button.click();
  assert.ok(d.querySelector('#page-welcome').classList.contains('active'));
  assert.equal(x.writes.length,0);
  x.setWritable(true);x.emit({...x.completeChallenge(),completed:[1,2,3,4,5,6]});await tick();
  assert.equal(button.disabled,false);
  button.click();await tick();
  assert.match(d.querySelector('#lesson-selection').textContent,/02 \/ 30/);
  assert.equal(d.querySelector('details.task[open]').dataset.task,'7');
});

test('finishing all challenges offers review without reopening completed tasks or quiz answers',async t=>{
  const x=await setup(t),d=x.doc;
  x.emit(x.completeChallenge(30));await tick();
  assert.match(d.querySelector('#home-challenge-label').textContent,/ALL 30 CHALLENGES COMPLETE/);
  assert.equal(d.querySelector('#home-challenges-done').textContent,'30 / 30');
  assert.equal(d.querySelector('#home-answers-done').textContent,'300 / 300');
  assert.match(d.querySelector('#home-continue').textContent,/Revisit/);
  d.querySelector('#home-continue').click();await tick();
  assert.match(d.querySelector('#lesson-selection').textContent,/30 \/ 30/);
  assert.equal(d.querySelectorAll('details.task.complete').length,5);
  assert.equal(d.querySelectorAll('[data-complete]').length,0);
  d.querySelector('[data-quiz-challenge="30"]').click();
  assert.equal(d.querySelector('.choice-list').disabled,true);
  assert.ok(d.querySelector('.choice-feedback'));
  assert.equal(x.writes.length,0);
});

test('background saves preserve a deliberately selected earlier challenge',async t=>{
  const x=await setup(t),d=x.doc;
  x.emit(x.completeChallenge());await tick();
  d.querySelector('[data-page="lessons"]').click();
  d.querySelector('[data-day="1"]').click();
  x.emit({...x.completeChallenge(),completed:[1,2,3,4,5,6]});await tick();
  assert.match(d.querySelector('#lesson-selection').textContent,/01 \/ 30/);
  assert.match(d.querySelector('#home-challenge-label').textContent,/CHALLENGE 02/);
  assert.equal(d.querySelector('#home-tasks-done').textContent,'6 / 150');
});

test('completing a task opens the next task and keeps the recipe available separately',async t=>{
  const x=await setup(t),d=x.doc;
  d.querySelector('#home-continue').click();
  assert.equal(d.querySelectorAll('details.task').length,5);
  assert.equal(d.querySelectorAll('details.task[open]').length,1);
  assert.equal(d.querySelector('details.task[open]').dataset.task,'1');
  assert.equal(d.querySelector('.day-recipe').open,false);
  d.querySelector('[data-complete="1"]').click();await tick();
  assert.deepEqual(x.writes,[{task:1}]);
  assert.equal(d.querySelector('details.task[open]').dataset.task,'2');
  assert.equal(d.querySelectorAll('details.task[open]').length,1);
  assert.ok(d.querySelector('[data-task="1"]').classList.contains('complete'));
  assert.equal(d.querySelector('#home-tasks-done').textContent,'1 / 150');
  assert.ok(d.querySelector('.day-recipe .recipe-method ol li'));
});

test('after five tasks home points to the quiz until all ten answers unlock the next set',async t=>{
  const x=await setup(t),d=x.doc;
  x.emit({completed:[1,2,3,4,5],qnaAnswers:{}});await tick();
  assert.equal(d.querySelector('#home-continue').dataset.target,'qa');
  d.querySelector('#home-continue').click();
  assert.ok(d.querySelector('#page-qa').classList.contains('active'));
  assert.equal(d.querySelector('#qa-picker').open,false);
  assert.equal(d.querySelectorAll('.qa-card').length,1);
  assert.equal(d.querySelectorAll('.question-step').length,10);
  x.emit(x.completeChallenge());await tick();
  assert.equal(d.querySelector('#home-continue').dataset.target,'lessons');
  assert.match(d.querySelector('#home-challenge-label').textContent,/CHALLENGE 02/);
});

test('quiz feedback stays visible and the first answer is locked through question and page navigation',async t=>{
  const x=await setup(t),d=x.doc;
  d.querySelector('[data-page="qa"]').click();
  d.querySelector('input[data-question="1"][data-choice="0"]').click();await tick();
  assert.equal(x.state.qnaAnswers[1].selectedIndex,0);
  assert.equal(d.querySelector('.choice-list').disabled,true);
  assert.ok(d.querySelector('.choice-feedback'));
  assert.equal(d.querySelector('.question-step.active').dataset.questionPosition,'0');
  d.querySelector('.question-step[data-question-position="1"]').click();
  assert.equal(d.querySelectorAll('.qa-card').length,1);
  assert.ok(d.querySelector('#prompt-2'));
  d.querySelector('[data-page="explore"]').click();d.querySelector('[data-page="qa"]').click();
  assert.ok(d.querySelector('#prompt-2'));
  d.querySelector('.question-step[data-question-position="0"]').click();
  d.querySelector('input[data-question="1"][data-choice="2"]').click();await tick();
  assert.equal(x.state.qnaAnswers[1].selectedIndex,0);
  assert.equal(x.writes.filter(write=>write.question===1).length,1);
  assert.equal(d.querySelector('input[data-question="1"][data-choice="0"]').checked,true);
});

test('future challenge teaching can be browsed while tasks and quiz submissions stay locked',async t=>{
  const x=await setup(t),d=x.doc;
  d.querySelector('[data-page="lessons"]').click();d.querySelector('[data-day="2"]').click();
  assert.equal(d.querySelectorAll('details.task').length,5);
  assert.equal(d.querySelectorAll('[data-complete]').length,0);
  assert.equal(d.querySelector('.day-recipe').tagName,'ARTICLE');
  d.querySelector('[data-quiz-challenge="2"]').click();
  assert.equal(d.querySelector('.choice-list').disabled,true);
  d.querySelector('input[data-question]').click();await tick();
  assert.equal(x.writes.length,0);
  assert.equal(Object.keys(x.state.qnaAnswers).length,0);
});

test('Explore owns reference content and main navigation keeps the current location clear',async t=>{
  const x=await setup(t),d=x.doc;
  assert.equal(d.querySelector('#page-welcome .cuisine-grid'),null);
  assert.equal(d.querySelector('#page-welcome .quote-panel'),null);
  d.querySelector('[data-page="explore"]').click();d.querySelector('[data-go="cuisines"]').click();
  assert.ok(d.querySelector('#page-cuisines').classList.contains('active'));
  assert.equal(d.querySelectorAll('#page-cuisines .cuisine').length,10);
  assert.equal(d.querySelector('.nav [aria-current="page"]').dataset.page,'explore');
  d.querySelector('#page-cuisines .back-link').click();
  assert.ok(d.querySelector('#page-explore').classList.contains('active'));
});

test('food animation can be paused and reduced-motion keeps images manually selectable',async t=>{
  const x=await setup(t,{reducedMotion:false}),d=x.doc;
  assert.equal(d.querySelector('.food-story').classList.contains('is-paused'),false);
  const slides=[...d.querySelectorAll('.food-slide')];assert.ok(slides.length>3);
  for(let i=1;i<=slides.length;i++){x.advanceAnimation();assert.equal(slides.indexOf(d.querySelector('.food-slide.active')),i%slides.length);}
  d.querySelector('#food-pause').click();
  assert.ok(d.querySelector('.food-story').classList.contains('is-paused'));
  assert.equal(d.querySelector('#food-pause').getAttribute('aria-label'),'Play animation');
  d.querySelector('[data-food-slide="2"]').click();
  assert.equal(d.querySelector('[data-food-slide="2"]').getAttribute('aria-pressed'),'true');
  d.querySelector('[data-page="explore"]').click();
  assert.ok(d.querySelector('.food-story').classList.contains('is-paused'));
  const quiet=await setup(t,{reducedMotion:true});
  assert.ok(quiet.doc.querySelector('.food-story').classList.contains('is-paused'));
  assert.equal(quiet.doc.querySelector('#food-pause').hidden,true);
  const last=quiet.doc.querySelector('.food-dots button:last-child');last.click();
  assert.equal(last.getAttribute('aria-pressed'),'true');
  assert.equal(quiet.doc.querySelector('.food-slide:last-child').classList.contains('active'),true);
});

test('Greek visitors get translated navigation, home guidance, Explore and quiz controls',async t=>{
  const x=await setup(t,{greek:true}),d=x.doc;
  assert.equal(d.documentElement.lang,'el');
  assert.doesNotMatch(d.querySelector('#home-title').textContent,/A little practice|A better cook/);
  assert.match(d.querySelector('#home-challenge-label').textContent,/ΠΡΟΚΛΗΣΗ 01/);
  for(const button of d.querySelectorAll('.nav button'))assert.doesNotMatch(button.textContent,/Home|Learn|Quiz|Explore/);
  d.querySelector('[data-page="explore"]').click();
  assert.doesNotMatch(d.querySelector('#explore-title').textContent,/A world beyond/);
  assert.doesNotMatch(d.querySelector('[data-go="cuisines"] strong').textContent,/World cuisines/);
  d.querySelector('[data-page="qa"]').click();
  assert.match(d.querySelector('.question-step').getAttribute('aria-label'),/Ερώτηση/);
  assert.match(d.querySelector('.quiz-navigation').textContent,/Επόμενη ερώτηση/);
});
