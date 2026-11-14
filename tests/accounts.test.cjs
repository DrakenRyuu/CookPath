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
    verifyOtp:async args=>{calls.push({name:'verify',args});session=initial||{user:{id:'otp',email:args.email},progress:{}};return {data:{session},error:null};},
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
  assert.match(x.w.document.querySelector('#account-message').textContent,/8-digit code/);x.dom.window.close();
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

test('gated legacy history stays available until every earlier completion is imported',async()=>{
  const x=await setup(a,{completed:[1,2,6],qnaAnswers:{1:{selectedIndex:2}}});
  x.handle(()=>({data:{completed:[1,2],qnaAnswers:{1:{selectedIndex:0}}},error:null}));
  x.w.document.querySelector('#account-import').click();await tick();
  assert.equal(x.w.localStorage.getItem('cookpath-imported:a'),null);
  assert.equal(x.w.document.querySelector('#account-import').disabled,false);
  assert.match(x.w.document.querySelector('#account-message').textContent,/remaining history/);
  x.handle(()=>({data:{completed:[1,2,6],qnaAnswers:{1:{selectedIndex:0}}},error:null}));
  x.w.document.querySelector('#account-import').click();await tick();
  assert.equal(x.w.localStorage.getItem('cookpath-imported:a'),'yes');
  assert.equal(x.w.document.querySelector('#account-import'),null);
  assert.equal(x.states.at(-1).qnaAnswers['1'].selectedIndex,0);x.dom.window.close();
});

test('email code verifies in the app without an email redirect',async()=>{
  const x=await setup();x.api.open();
  x.w.document.querySelector('#account-email').value='reader@example.test';
  x.w.document.querySelector('.account-form').dispatchEvent(new x.w.Event('submit',{bubbles:true,cancelable:true}));await tick();
  x.w.document.querySelector('#account-code').value='12345678';
  x.w.document.querySelector('#account-code-form').dispatchEvent(new x.w.Event('submit',{bubbles:true,cancelable:true}));await tick();
  const call=x.calls.find(c=>c.name==='verify');assert.equal(call.args.token,'12345678');assert.equal(call.args.type,'email');
  assert.equal(call.args.email,'reader@example.test');assert.equal(x.api.signedIn,true);x.dom.window.close();
});
test('account analytics show only saved account results, refresh, and clear on account changes',async()=>{
  const x=await setup(a,{completed:[1,2,3,4,5],qnaAnswers:{}});x.api.open();
  assert.equal(x.w.document.querySelector('#account-progress').textContent,'Check my progress');
  x.w.document.querySelector('#account-progress').click();
  let analytics=x.w.document.querySelector('#account-analytics');
  assert.match(analytics.textContent,/299 still to explore/);
  assert.equal(analytics.querySelector('progress').value,1);
  assert.equal(analytics.querySelectorAll('.account-challenge').length,30);
  x.handle(()=>({data:{completed:[1,2],qnaAnswers:{}},error:null}));
  x.w.document.querySelector('#account-refresh').click();await tick();
  assert.equal(x.w.document.querySelector('#account-analytics progress').value,2);
  await x.emit(b);
  assert.equal(x.w.document.querySelector('#account-analytics'),null);
  assert.match(x.w.document.querySelector('.account-email').textContent,/b@example.test/);
  x.w.document.querySelector('#account-progress').click();
  assert.ok(x.w.document.querySelector('#account-analytics'));
  await x.emit(null);assert.equal(x.w.document.querySelector('#account-analytics'),null);
  assert.ok(x.w.document.querySelector('#account-email'));x.dom.window.close();
});
