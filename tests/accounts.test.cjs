const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require((process.env.COOKPATH_TEST_RUNTIME||'/tmp/cookpath-test-runtime')+'/node_modules/jsdom');
const root=path.join(__dirname,'..');
const tick=()=>new Promise(resolve=>setTimeout(resolve,15));
async function setup(initial=null,legacy={}){
  const dom=new JSDOM('<div class="status"></div>',{url:'https://cookpath.test/?lang=en',runScripts:'outside-only'}),w=dom.window;
  w.COOKPATH_I18N={choose:en=>en};
  for(const f of ['lessons.js','questions.js','progress.js'])w.eval(fs.readFileSync(path.join(root,f),'utf8'));
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  w.HTMLDialogElement.prototype.close=function(){this.open=false;};
  w.COOKPATH_ACCOUNT_CONFIG={enabled:true,supabaseUrl:'https://example.supabase.co',publishableKey:'sb_publishable_test_only'};
  let session=initial,callback,handler;
  const states=[],calls=[];
  const client={auth:{
    onAuthStateChange:cb=>{callback=cb;},
    getSession:async()=>({data:{session},error:null}),
    signInWithOtp:async args=>{calls.push({name:'email',args});return {error:null};},
    signOut:async()=>{session=null;callback('SIGNED_OUT',null);return {error:null};}
  },rpc:async(name,args)=>{calls.push({name,args});return handler?handler(name,args):{data:session?.progress||{},error:null};}};
  w.supabase={createClient:()=>client};w.eval(fs.readFileSync(path.join(root,'accounts.js'),'utf8'));
  const api=w.COOKPATH_ACCOUNTS;
  await api.start({onState:s=>states.push(JSON.parse(JSON.stringify(s))),legacyProgress:legacy});
  return {dom,w,api,states,calls,handle:fn=>{handler=fn;},emit:async next=>{session=next;callback(next?'SIGNED_IN':'SIGNED_OUT',next);await tick();}};
}
const a={user:{id:'a',email:'a@example.test'},progress:{completed:[1],qnaAnswers:{1:{selectedIndex:0}}}};
const b={user:{id:'b',email:'b@example.test'},progress:{completed:[2],qnaAnswers:{1:{selectedIndex:2}}}};
test('email sign-in uses Supabase and a clean return URL',async()=>{
  const x=await setup();assert.equal(x.api.canWrite,false);x.api.open();
  x.w.document.querySelector('#account-email').value='reader@example.test';
  x.w.document.querySelector('form').dispatchEvent(new x.w.Event('submit',{bubbles:true,cancelable:true}));await tick();
  const call=x.calls.find(c=>c.name==='email');assert.equal(call.args.email,'reader@example.test');
  assert.equal(call.args.options.emailRedirectTo,'https://cookpath.test/');
  assert.match(x.w.document.querySelector('#account-message').textContent,/Check your email/);x.dom.window.close();
});
test('sign-out clears displayed account progress',async()=>{
  const x=await setup(a);assert.equal(x.api.canWrite,true);x.api.open();
  x.w.document.querySelector('#account-signout').click();await tick();
  assert.equal(x.api.canWrite,false);assert.deepEqual(x.states.at(-1).completed,[]);assert.deepEqual(x.states.at(-1).qnaAnswers,{});x.dom.window.close();
});
test('a late response from account A cannot overwrite account B',async()=>{
  const x=await setup(a);let finish;
  x.handle(()=>new Promise(resolve=>{finish=resolve;}));
  const pending=x.api.refresh();const rejected=assert.rejects(pending,/Account changed/);
  x.handle(()=>({data:b.progress,error:null}));await x.emit(b);
  finish({data:a.progress,error:null});await rejected;
  assert.equal(x.states.at(-1).qnaAnswers['1'].selectedIndex,2);
  assert.deepEqual(x.states.at(-1).completed,[2]);x.dom.window.close();
});
test('an older read cannot remove a newer saved task or answer',async()=>{
  const x=await setup(a);let finish;
  x.handle(()=>new Promise(resolve=>{finish=resolve;}));const pending=x.api.refresh();
  x.handle(()=>({data:{completed:[1,2],qnaAnswers:{1:{selectedIndex:0},2:{selectedIndex:1}}},error:null}));
  await x.api.completeTask(2);finish({data:a.progress,error:null});await pending;
  assert.deepEqual(x.states.at(-1).completed,[1,2]);assert.equal(x.states.at(-1).qnaAnswers['2'].selectedIndex,1);x.dom.window.close();
});
test('failed writes do not claim new progress was saved',async()=>{
  const x=await setup(a);x.handle(()=>({error:new Error('offline'),data:null}));
  await assert.rejects(x.api.completeTask(2),/offline/);
  assert.deepEqual(x.states.at(-1).completed,[1]);assert.match(x.w.document.querySelector('.account-save-status').textContent,/Not saved/);x.dom.window.close();
});
test('legacy progress requires an explicit import and is not silently assigned',async()=>{
  const x=await setup(a,{completed:[1,2,3],qnaAnswers:{}});
  assert.ok(x.w.document.querySelector('#account-import'));
  assert.equal(x.calls.some(c=>c.name==='cookpath_import_progress'),false);
  assert.deepEqual(x.states.at(-1).completed,[1]);x.dom.window.close();
});
