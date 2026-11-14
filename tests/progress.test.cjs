const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
function setup(){const c={window:{}};for(const f of ['lessons.js','questions.js','progress.js'])vm.runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),c);return {P:c.window.COOKPATH_PROGRESS,qs:c.window.COOKPATH_QUESTIONS};}
test('first answer stays final across repeat submissions and reload normalization',()=>{
  const {P,qs}=setup();let state=P.answer(P.fresh(),1,0);
  state=P.answer(state,1,2);assert.equal(state.qnaAnswers[1].selectedIndex,0);
  state=P.normalize(JSON.parse(JSON.stringify(state)));
  assert.equal(P.answer(state,1,1).qnaAnswers[1].selectedIndex,0);
  assert.equal(state.qnaAnswers[1].correct,qs[0].correctIndex===0);
});
test('next challenge unlocks only after five tasks AND ten answers, with no calendar wait',()=>{
  const {P,qs}=setup();let state=P.fresh();
  for(let id=1;id<=5;id++)state=P.completeTask(state,id);
  assert.equal(P.available(state,2),false);
  for(const q of qs.filter(q=>q.day===1))state=P.answer(state,q.id,0);
  assert.equal(P.available(state,2),true);
  assert.equal(P.available(state,3),false);
  assert.ok(P.completeTask(state,6).completed.includes(6));
});
test('locked tasks and future quiz submissions are rejected',()=>{
  const {P,qs}=setup();assert.throws(()=>P.completeTask(P.fresh(),6),/locked/);
  assert.throws(()=>P.answer(P.fresh(),qs.find(q=>q.day===2).id,0),/locked/);
});
test('legacy task and selected-answer progress is preserved, and scores are recomputed',()=>{
  const {P,qs}=setup();const state=P.normalize({completed:[1,1,2,151],qnaAnswers:{1:{selectedIndex:0,correct:qs[0].correctIndex!==0},999:{selectedIndex:0}}});
  assert.equal(JSON.stringify(state.completed),'[1,2]');assert.equal(Object.keys(state.qnaAnswers).length,1);
  assert.equal(state.qnaAnswers[1].correct,qs[0].correctIndex===0);
});
test('analytics exclude unanswered questions and derive correctness from the catalogue',()=>{
  const {P,qs}=setup(), answers={};
  const selected=qs.filter(q=>q.day===1 || q.day===2).slice(0,12);
  selected.forEach((q,i)=>{answers[q.id]={selectedIndex:i<7||i===10?q.correctIndex:(q.correctIndex+1)%3,correct:false};});
  const s=P.summarize({completed:[1,2,3,4,5,6,6,151],qnaAnswers:{...answers,999:{selectedIndex:0}}});
  assert.equal(s.tasks,6);assert.equal(s.answered,12);assert.equal(s.correct,8);assert.equal(s.wrong,4);
  assert.equal(s.unanswered,288);assert.equal(s.accuracy,8/12*100);assert.equal(s.completedChallenges,1);
  assert.equal(s.challenges[0].accuracy,70);assert.equal(s.challenges[1].accuracy,50);
  assert.equal(s.challenges[1].tasks,1);assert.equal(s.challenges[1].available,true);
  assert.equal(s.challenges[2].accuracy,null);assert.equal(s.challenges[2].available,false);
});
test('empty and fully completed analytics have meaningful denominators',()=>{
  const {P,qs}=setup(), empty=P.summarize(P.fresh());
  assert.equal(empty.accuracy,null);assert.equal(empty.wrong,0);assert.equal(empty.unanswered,300);
  const full=P.summarize({completed:Array.from({length:150},(_,i)=>i+1),qnaAnswers:Object.fromEntries(qs.map(q=>[q.id,{selectedIndex:q.correctIndex}]))});
  assert.equal(full.accuracy,100);assert.equal(full.correct,300);assert.equal(full.wrong,0);
  assert.equal(full.completedChallenges,30);assert.equal(full.tasks,150);assert.equal(full.unanswered,0);
});
