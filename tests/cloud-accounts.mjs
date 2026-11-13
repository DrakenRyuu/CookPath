// Opt-in hosted smoke test. Uses disposable synthetic accounts and cleans them up.
// Never put a private API key in this file or in the public app.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {createClient}=require((process.env.COOKPATH_TEST_RUNTIME||'/tmp/cookpath-test-runtime')+'/node_modules/@supabase/supabase-js');
if(!process.env.COOKPATH_CLOUD_TEST_KEYS||!process.env.COOKPATH_CLOUD_TEST_URL)throw new Error('Set the private keys file and explicit test project URL.');
const stored=JSON.parse(fs.readFileSync(process.env.COOKPATH_CLOUD_TEST_KEYS,'utf8'));
const keys=Array.isArray(stored)?stored:stored.keys;
const value=k=>k?.api_key||k?.key;
const publicKey=value(keys.find(k=>k.type==='publishable'&&!k.disabled));
const privateKey=value(keys.find(k=>k.type==='secret'&&!k.disabled))||value(keys.find(k=>k.name==='service_role'));
assert.ok(publicKey?.startsWith('sb_publishable_')&&privateKey);
const url=process.env.COOKPATH_CLOUD_TEST_URL;
const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
const admin=createClient(url,privateKey,options), sessions=[], users=[];
const ok=result=>{if(result.error)throw new Error(result.error.message);return result.data;};
const rpc=async(client,name,args={})=>ok(await client.rpc(name,args));
async function syntheticUser(){
  const email=`cookpath-qa-${randomUUID()}@example.invalid`;
  const {user}=ok(await admin.auth.admin.createUser({email,email_confirm:true}));
  users.push(user);return user;
}
async function login(user){
  // Admin creates a test-only link without sending email. This does NOT verify SMTP.
  const link=ok(await admin.auth.admin.generateLink({type:'magiclink',email:user.email,options:{redirectTo:'https://cookpath.onrender.com/'}}));
  const client=createClient(url,publicKey,options);sessions.push(client);
  const data=ok(await client.auth.verifyOtp({token_hash:link.properties.hashed_token,type:'magiclink'}));
  assert.equal(data.user.id,user.id);return client;
}
try{
  const aUser=await syntheticUser(),bUser=await syntheticUser();
  const a=await login(aUser),b=await login(bUser);
  await rpc(a,'cookpath_complete_task',{p_task_id:1});
  await rpc(a,'cookpath_submit_answer',{p_question_id:1,p_selected_index:0});
  const aSecondDevice=await login(aUser);
  const reloaded=await rpc(aSecondDevice,'cookpath_get_progress');
  assert.deepEqual(reloaded.completed,[1]);assert.equal(reloaded.qnaAnswers['1'].selectedIndex,0);
  const repeated=await rpc(aSecondDevice,'cookpath_submit_answer',{p_question_id:1,p_selected_index:1});
  assert.equal(repeated.qnaAnswers['1'].selectedIndex,0);assert.equal(repeated.qnaAnswers['1'].correct,false);
  const update=await a.from('cookpath_quiz_answers').update({selected_index:2}).eq('question_id',1);
  assert.equal(update.error?.code,'42501');
  assert.deepEqual(await rpc(b,'cookpath_get_progress'),{completed:[],qnaAnswers:{}});
  assert.deepEqual(ok(await b.from('cookpath_quiz_answers').select('*')),[]);
  const future=await a.rpc('cookpath_complete_task',{p_task_id:6});assert.equal(future.error?.code,'42501');
  for(let id=2;id<=5;id++)await rpc(a,'cookpath_complete_task',{p_task_id:id});
  for(let id=2;id<=10;id++)await rpc(a,'cookpath_submit_answer',{p_question_id:id,p_selected_index:0});
  await rpc(a,'cookpath_complete_task',{p_task_id:6});
  assert.ok((await rpc(aSecondDevice,'cookpath_get_progress')).completed.includes(6));
  const anonymous=createClient(url,publicKey,options);
  assert.ok((await anonymous.rpc('cookpath_get_progress')).error);
  console.log('PASS: real passwordless Auth sessions, progress across two independent sessions, immutable first answers, RLS isolation, denied direct writes, challenge gates and anonymous denial. Email delivery is not tested.');
}finally{
  for(const client of sessions)await client.auth.signOut({scope:'global'});
  for(const user of users){const result=await admin.auth.admin.deleteUser(user.id);if(result.error)throw new Error('Could not clean up a synthetic test account.');}
  console.log('Synthetic test accounts and their progress removed.');
}
