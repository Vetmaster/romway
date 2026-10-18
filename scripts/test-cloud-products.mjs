// Explicit isolated test integration: one retained synthetic card; operator session is always revoked.
import assert from 'node:assert/strict';import {readFile,stat} from 'node:fs/promises';import {homedir} from 'node:os';import {join} from 'node:path';import {createBackend} from '../supabase/functions/romway-auth/backend.js';import {randomSecret,hash} from '../supabase/functions/romway-auth/security.js';
const ref='ifnjvdjhfhzfxyuorqvz';assert.equal(process.env.ROMWAY_TEST_PROJECT,ref);
const folder=join(homedir(),'.supabase/romway-test'),path=join(folder,'runtime-20261011.json');assert.equal((await stat(path)).mode&0o077,0);const config=JSON.parse(await readFile(path,'utf8'));assert.equal(config.project_ref,ref);assert.equal(config.url,`https://${ref}.supabase.co`);
const token=(await readFile(join(homedir(),'.supabase/access-token'),'utf8')).trim();async function api(path,body){const r=await fetch(`https://api.supabase.com/v1/projects/${ref}${path}`,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(30000)});assert(r.ok,'Test-management request failed; private details suppressed');return r.json();}
const project=await api('');assert.equal(project.name,'romway-auth-test');assert(project.created_at.startsWith('2026-10-11'));const query=query=>api('/database/query',{query});
const backend=createBackend({url:config.url,serviceKey:config.service_key,publicKey:config.public_key});
const [owner]=await query("select id,session_version from romway_private.staff where employee_number='TEST_S_ADMIN' and role='super_admin' and active and not password_change_required");assert(owner);
const snapshots=await query("select (select md5(coalesce(jsonb_agg(to_jsonb(r) order by r.id)::text,'[]')) from romway_private.products r) products,(select md5(coalesce(jsonb_agg(to_jsonb(d) order by d.id)::text,'[]')) from romway_private.shipment_drafts d) shipments");
const endpoint=config.url+'/functions/v1/romway-auth',origin='https://vetmaster.github.io';async function call(body,cookie,requestOrigin=origin){return fetch(endpoint,{method:'POST',headers:{Origin:requestOrigin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(30000)});}
assert.equal((await call({action:'product-list'})).status,401);assert.equal((await call({action:'product-list'},null,'https://untrusted.invalid')).status,403);
const secret=randomSecret(),digest=await hash(secret);assert(await backend.rpc('romway_open_session',{p_hash:digest,p_staff_id:owner.id,p_version:owner.session_version}));const cookie='__Host-romway_session='+secret;
try{
 const r=await call({action:'product-list'},cookie);assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'no-store');const list=await r.json();assert(list.locations.length);
 const suffix=crypto.randomUUID().slice(0,8).toUpperCase(),body={action:'product-create',request_id:crypto.randomUUID(),location_id:list.locations[0].id,name:'Test Ürün Kartı (entegrasyon)',part_code:'TEST-KATALOG-'+suffix,unit:'piece'};
 const created=await call(body,cookie);assert.equal(created.status,200);const product=await created.json();const retry=await call(body,cookie);assert.equal(retry.status,200);assert.deepEqual(await retry.json(),product);
 const duplicate=await call({...body,request_id:crypto.randomUUID(),part_code:body.part_code.toLowerCase()},cookie);assert.equal(duplicate.status,409);assert.equal((await duplicate.json()).error,'product_code_exists');
 assert.equal((await call({...body,request_id:crypto.randomUUID(),unit:'invalid'},cookie)).status,400);
 const after=await (await call({action:'product-list'},cookie)).json();assert(after.products.some(p=>p.id===product.id));assert(!JSON.stringify(after).includes('price'));assert(!JSON.stringify(after).includes('quantity'));
 const remaining=await query(`select (select md5(coalesce(jsonb_agg(to_jsonb(r) order by r.id)::text,'[]')) from romway_private.products r where id<>'${product.id}'::uuid) products,(select md5(coalesce(jsonb_agg(to_jsonb(d) order by d.id)::text,'[]')) from romway_private.shipment_drafts d) shipments`);assert.deepEqual(remaining,snapshots);
 console.log('Deployed catalog: valid operator session list/create, normalized duplicate rejection, same-request retry, invalid unit, Origin/session rejection passed. One synthetic card retained; previous products and shipments unchanged.');
}finally{await backend.rpc('romway_revoke_session',{p_hash:digest});}
// Check the user-requested accounts with their actual temporary passwords, without changing them.
const accountsPath=join(folder,'test-role-accounts-20261018.json');assert.equal((await stat(accountsPath)).mode&0o077,0);const accounts=JSON.parse(await readFile(accountsPath,'utf8'));
for(const account of accounts.accounts){
 const login=await call({action:'login',employee_number:account.employee_number,password:account.temporary_password});assert.equal(login.status,200);assert.equal((await login.json()).password_change_required,true);const session=login.headers.get('set-cookie')?.split(';')[0];assert(session);
 try{assert.equal((await call({action:'product-list'},session)).status,403);assert.equal((await call({action:'shipment-list'},session)).status,403);}finally{assert.equal((await call({action:'logout'},session)).status,200);}
}
console.log('Three requested test-account logins passed; mandatory first password change preserved; passwords were not printed or reset.');
