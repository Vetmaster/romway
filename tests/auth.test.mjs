import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {createHandler} from '../supabase/functions/romway-auth/handler.js';
import {hash,randomSecret,employeeNumber,cookieValue} from '../supabase/functions/romway-auth/security.js';
const db = new PGlite();
before(async () => {
  await db.exec('create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key);');
  await db.exec(await readFile(new URL('../supabase/migrations/202610100001_auth_foundation.sql',import.meta.url),'utf8'));
});
after(() => db.close());
const allowedRpc = new Set(['romway_staff_for_login','romway_register_staff','romway_activate_staff','romway_consume_attempt','romway_session','romway_open_session','romway_revoke_session','romway_begin_password','romway_finish_password']);
async function rpc(name,args) {
  assert(allowedRpc.has(name));
  const entries = Object.entries(args);
  const placeholders = entries.map(([key],i) => { assert(/^p_[a-z_]+$/.test(key)); return `${key} => $${i+1}`; });
  return (await db.query(`select public.${name}(${placeholders.join(',')}) as value`,entries.map(([,v]) => v))).rows[0].value;
}
let count = 0;
async function fixture({role='receiver',required=true,active=true}={}) {
  const id = crypto.randomUUID(), number = `TEST${++count}`, email = `staff-${id}@identity.invalid`;
  let actualPassword = 'Synthetic-old-password-1'; let updateFails = false;
  await db.query('insert into auth.users values($1)',[id]);
  await rpc('romway_register_staff',{p_id:id,p_employee_number:number,p_email:email,p_name:'<script>Test</script>',p_role:role});
  if (active) await rpc('romway_activate_staff',{p_id:id});
  if (!required) await db.query('update romway_private.staff set password_change_required=false,temporary_password_expires_at=null where id=$1',[id]);
  const backend = {rpc,verifyPassword:async (e,p) => e === email && p === actualPassword ? id : null,
    updatePassword:async (target,p) => { assert.equal(target,id); if (updateFails) throw new Error('Secret details must not leak'); actualPassword=p; }};
  const handler = createHandler({backend,appOrigin:'http://localhost:8000',local:true});
  const call = (body,cookie,origin='http://localhost:8000',extra={}) => handler(new Request('http://localhost:54321/functions/v1/romway-auth',{
    method:'POST',headers:{'Content-Type':'application/json',origin,...(cookie?{cookie}:{}),...extra},body:JSON.stringify(body),
  }));
  async function login() {
    const response = await call({action:'login',employee_number:number.toLowerCase(),password:actualPassword});
    assert.equal(response.status,200);
    return response.headers.get('set-cookie').split(';')[0];
  }
  return {id,number,email,call,login,handler,backend,failUpdate:() => {updateFails=true;}};
}

test('sicil normalization and cookie parsing reject invalid/duplicate inputs',() => {
  assert.equal(employeeNumber(' ab_12 '),'AB_12');
  for (const v of ['ş12','a b','<script>',null,'x'.repeat(41)]) assert.throws(() => employeeNumber(v));
  assert.equal(cookieValue('s='+randomSecret()+'; s='+randomSecret(),'s'),null);
});
test('temporary login uses HttpOnly session, never returns Auth tokens or profile',async () => {
  const f = await fixture();
  const response = await f.call({action:'login',employee_number:f.number,password:'Synthetic-old-password-1'});
  assert.deepEqual(await response.json(),{password_change_required:true});
  const cookie = response.headers.get('set-cookie');
  assert.match(cookie,/HttpOnly/); assert.match(cookie,/SameSite=Strict/);
  assert.equal(response.headers.get('cache-control'),'no-store');
  const me = await f.call({action:'me'},cookie.split(';')[0]);
  assert.deepEqual(await me.json(),{password_change_required:true});
});
test('normal profile strips email and internal session state for all four roles',async () => {
  for (const role of ['super_admin','admin','purchasing','receiver']) {
    const f = await fixture({required:false,role});
    const me = await f.call({action:'me'},await f.login());
    assert.deepEqual(await me.json(),{password_change_required:false,profile:{employee_number:f.number,display_name:'<script>Test</script>',role}});
  }
});
test('wrong password, missing account, disabled and expired temporary account fail identically',async () => {
  const f = await fixture({active:false});
  for (const [number,password] of [[f.number,'wrong'],['DOESNOTEXIST','Synthetic-old-password-1'],[f.number,'Synthetic-old-password-1']]) {
    const response = await f.call({action:'login',employee_number:number,password});
    assert.equal(response.status,401); assert.deepEqual(await response.json(),{error:'invalid_credentials'});
  }
  await db.query("update romway_private.staff set active=true,temporary_password_expires_at=now()-interval '1 hour' where id=$1",[f.id]);
  assert.equal((await f.call({action:'login',employee_number:f.number,password:'Synthetic-old-password-1'})).status,401);
});
test('new password must differ and current password is revalidated on server',async () => {
  const f = await fixture(), cookie = await f.login();
  for (const [newPassword,current,code] of [['Synthetic-old-password-1','Synthetic-old-password-1','password_unchanged'],['short','Synthetic-old-password-1','password_rules'],['Synthetic-new-password-2','wrong','invalid_credentials']]) {
    const response = await f.call({action:'change-password',password:newPassword,current_password:current},cookie);
    assert.equal((await response.json()).error,code);
  }
  assert.equal((await f.call({action:'me'},cookie)).status,200);
});
test('password change revokes every previous app session and requires new login',async () => {
  const f = await fixture(), first = await f.login(), second = await f.login();
  const response = await f.call({action:'change-password',current_password:'Synthetic-old-password-1',password:'Synthetic-new-password-2'},first);
  assert.deepEqual(await response.json(),{ok:true,reauthenticate:true});
  for (const cookie of [first,second]) assert.equal((await f.call({action:'me'},cookie)).status,401);
  assert.equal((await f.call({action:'login',employee_number:f.number,password:'Synthetic-old-password-1'})).status,401);
  const me = await f.call({action:'me'},await f.login());
  assert.equal((await me.json()).password_change_required,false);
});
test('partial Auth failure leaves lock and old sessions unusable without exposing details',async () => {
  const f = await fixture(), cookie = await f.login(); f.failUpdate();
  const response = await f.call({action:'change-password',current_password:'Synthetic-old-password-1',password:'Synthetic-new-password-2'},cookie);
  assert.equal(response.status,503); assert.deepEqual(await response.json(),{error:'recovery_required'});
  assert.equal((await f.call({action:'me'},cookie)).status,401);
  assert.equal((await f.call({action:'login',employee_number:f.number,password:'Synthetic-old-password-1'})).status,401);
  assert((await db.query('select password_operation from romway_private.staff where id=$1',[f.id])).rows[0].password_operation);
});
test('concurrent password requests can lock the account only once',async () => {
  const f = await fixture(), cookie = await f.login();
  const responses = await Promise.all([1,2].map(n => f.call({action:'change-password',current_password:'Synthetic-old-password-1',password:`Synthetic-new-password-${n}`},cookie)));
  assert.deepEqual(responses.map(x => x.status).sort(),[200,401]);
});
test('logout revokes server session; account disable and version change also revoke access',async () => {
  const f = await fixture({required:false}), cookie = await f.login();
  assert.equal((await f.call({action:'logout'},cookie)).status,200);
  assert.equal((await f.call({action:'me'},cookie)).status,401);
  const next = await f.login();
  await db.query('update romway_private.staff set active=false where id=$1',[f.id]);
  assert.equal((await f.call({action:'me'},next)).status,401);
  await db.query('update romway_private.staff set active=true,session_version=session_version+1 where id=$1',[f.id]);
  assert.equal((await f.call({action:'me'},next)).status,401);
});
test('cookie lifetime is checked in database, not trusted from browser',async () => {
  const f = await fixture({required:false}), cookie = await f.login();
  await db.query("update romway_private.sessions set expires_at=now()-interval '1 second' where cookie_hash=$1",[await hash(cookie.split('=')[1])]);
  assert.equal((await f.call({action:'me'},cookie)).status,401);
});
test('CSRF origin, body size, malformed JSON, unknown action and method are rejected',async () => {
  const f = await fixture();
  assert.equal((await f.call({action:'login'},null,'https://evil.example')).status,403);
  assert.equal((await f.call({action:'login'},null,'null')).status,403);
  assert.equal((await f.call({action:'create-staff'})).status,400);
  assert.equal((await f.call({action:'me',padding:'x'.repeat(8192)})).status,413);
  for (const [method,body,status] of [['GET',undefined,405],['POST','{broken',400]]) {
    assert.equal((await f.handler(new Request('http://localhost:54321',{method,headers:{origin:'http://localhost:8000','Content-Type':'application/json'},body}))).status,status);
  }
  const missingOrigin = await f.handler(new Request('http://localhost:54321',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}));
  assert.equal(missingOrigin.status,403);
});
test('persistent account attempt limit blocks repeated requests',async () => {
  const f = await fixture();
  for (let i=0;i<10;i++) assert.equal((await f.call({action:'login',employee_number:f.number,password:'wrong'})).status,401);
  assert.equal((await f.call({action:'login',employee_number:f.number,password:'Synthetic-old-password-1'})).status,429);
});
test('production cookie has Secure host prefix; unsafe origin configurations fail',async () => {
  const f = await fixture();
  assert.throws(() => createHandler({backend:{},appOrigin:'http://example.com'}));
  assert.throws(() => createHandler({backend:{},appOrigin:'https://example.com/'}));
  const handler = createHandler({backend:{rpc:async () => null},appOrigin:'https://app.example.com'});
  const response = await handler(new Request('https://api.example.com',{method:'POST',headers:{origin:'https://app.example.com','Content-Type':'application/json'},body:JSON.stringify({action:'logout'})}));
  assert.match(response.headers.get('set-cookie'),/^__Host-romway_session=.*; Secure$/);
});
test('anon and authenticated cannot call RPCs or access tables; RLS stays closed under accidental SELECT grant',async () => {
  for (const role of ['anon','authenticated']) {
    await db.exec(`set role ${role};`);
    try {
      await assert.rejects(() => db.query('select * from romway_private.staff'),/permission denied/);
      await assert.rejects(() => db.query("select public.romway_staff_for_login('TEST1')"),/permission denied/);
      await assert.rejects(() => db.query("select public.romway_session($1)",[randomSecret()]),/permission denied/);
      await assert.rejects(() => db.query("select public.romway_activate_staff($1)",[crypto.randomUUID()]),/permission denied/);
    } finally { await db.exec('reset role;'); }
  }
  await db.exec('grant usage on schema romway_private to authenticated; grant select on romway_private.staff to authenticated; set role authenticated;');
  try { assert.equal((await db.query('select * from romway_private.staff')).rows.length,0); }
  finally { await db.exec('reset role; revoke usage on schema romway_private from authenticated; revoke select on romway_private.staff from authenticated;'); }
});
test('database role and canonical employee constraints reject invalid provisioning',async () => {
  const id = crypto.randomUUID(); await db.query('insert into auth.users values($1)',[id]);
  await assert.rejects(() => rpc('romway_register_staff',{p_id:id,p_employee_number:'bad spaces',p_email:`staff-${id}@identity.invalid`,p_name:'Test',p_role:'receiver'}),/check constraint/);
  await assert.rejects(() => rpc('romway_register_staff',{p_id:id,p_employee_number:'NEW123',p_email:`staff-${id}@identity.invalid`,p_name:'Test',p_role:'untrusted'}),/check constraint/);
});

test('service role can invoke RPC but an Auth Bearer alone cannot enter the cookie endpoint',async () => {
  const f=await fixture({required:false});
  await db.exec('set role service_role;');
  try { assert.equal((await rpc('romway_staff_for_login',{p_employee_number:f.number})).id,f.id); }
  finally { await db.exec('reset role;'); }
  const response=await f.call({action:'me'},null,'http://localhost:8000',{Authorization:'Bearer synthetic-auth-jwt'});
  assert.equal(response.status,401);
});

test('partitioned HTTPS cookie keeps Origin enforcement and identical logout attributes',async () => {
  const f=await fixture();
  const appOrigin='https://vetmaster.github.io';
  const handler=createHandler({backend:f.backend,appOrigin,cookieMode:'partitioned'});
  const call=(body,cookie,origin=appOrigin)=>handler(new Request('https://api.example.com/auth',{
    method:'POST',headers:{origin,'Content-Type':'application/json',...(cookie?{cookie}:{})},body:JSON.stringify(body)}));
  const response=await call({action:'login',employee_number:f.number,password:'Synthetic-old-password-1'});
  assert.equal(response.status,200);
  const header=response.headers.get('set-cookie');
  assert.match(header,/^__Host-romway_session=/);assert.match(header,/HttpOnly; Path=\//);
  assert.match(header,/SameSite=None; Max-Age=28800; Secure; Partitioned$/);
  assert(!header.includes('Domain='));const cookie=header.split(';')[0];
  assert.equal((await call({action:'me'},cookie,'https://untrusted.invalid')).status,403);
  assert.equal((await call({action:'me'},cookie,'null')).status,403);
  assert.equal((await call({action:'me'},cookie)).status,200);
  const logout=await call({action:'logout'},cookie);assert.equal(logout.status,200);
  assert.match(logout.headers.get('set-cookie'),/SameSite=None; Max-Age=0; Secure; Partitioned$/);
  assert.equal((await call({action:'me'},cookie)).status,401);
  for(const mode of ['none','invalid']) assert.throws(()=>createHandler({backend:{},appOrigin,cookieMode:mode}));
  assert.throws(()=>createHandler({backend:{},appOrigin:'http://localhost:8000',local:true,cookieMode:'partitioned'}));
});
