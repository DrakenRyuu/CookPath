const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require((process.env.COOKPATH_TEST_RUNTIME||'/tmp/cookpath-test-runtime')+'/node_modules/jsdom');
function setup(){
  const dom=new JSDOM('<main></main>',{url:'https://cookpath.test/',runScripts:'outside-only'}),w=dom.window;
  w.COOKPATH_I18N={choose:en=>en,language:'en'};let authOpened=false;
  w.COOKPATH_ACCOUNTS={canWrite:true,open:()=>{authOpened=true;}};
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
  w.URL.revokeObjectURL=()=>{};
  for(const f of ['lessons.js','evidence-data.js','evidence.js'])w.eval(fs.readFileSync(path.join(__dirname,'..',f),'utf8'));
  return {dom,w,E:w.COOKPATH_EVIDENCE,get authOpened(){return authOpened;}};
}
test('file selection accepts camera image files and refuses PDFs even when renamed',()=>{
  const x=setup(),file=(name,type,size=1000)=>({name,type,size});
  for(const f of [file('onion.jpg','image/jpeg'),file('onion.png','image/png'),file('onion.webp','image/webp')])assert.doesNotThrow(()=>x.E.validateFile(f,'photo'));
  assert.throws(()=>x.E.validateFile(file('onion.pdf','application/pdf'),'photo'),/wrong_type/);
  assert.throws(()=>x.E.validateFile(file('onion.jpg','application/pdf'),'photo'),/wrong_type/);
  assert.throws(()=>x.E.validateFile(file('onion.jpg','image/jpeg',16*1024*1024),'photo'),/file_too_large/);
  assert.throws(()=>x.E.validateFile(file('clip.mp4','video/mp4'),'photo'),/wrong_type/);x.dom.window.close();
});
test('photo task offers camera capture and image upload; account changes clear the modal',()=>{
  const x=setup();x.E.open(x.w.COOKPATH_TASKS[0]);
  const inputs=[...x.w.document.querySelectorAll('input[type=file]')];assert.equal(inputs.length,2);
  assert.equal(inputs[0].getAttribute('capture'),'environment');
  assert.match(inputs[1].accept,/image\/jpeg/);assert.doesNotMatch(inputs[1].accept,/pdf/);
  assert.equal(x.w.document.querySelector('#evidence-submit').disabled,true);
  x.w.dispatchEvent(new x.w.CustomEvent('cookpath-account-changed'));assert.equal(x.w.document.querySelector('dialog').open,false);x.dom.window.close();
});
test('video tasks request a short clip and simple tasks keep their existing confirmation',()=>{
  const x=setup();x.E.open(x.w.COOKPATH_TASKS[20]);assert.equal(x.w.document.querySelector('dialog'),null);
  x.E.open(x.w.COOKPATH_TASKS[3]);assert.match(x.w.document.querySelector('input[type=file]').accept,/video\/mp4/);
  assert.match(x.w.document.querySelector('.evidence-intro').textContent,/five snapshots/);x.dom.window.close();
});
