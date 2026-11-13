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
