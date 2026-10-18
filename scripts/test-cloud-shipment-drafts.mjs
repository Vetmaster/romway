// Opt-in smoke test. Creates one clearly marked synthetic draft; never deletes records.
import assert from 'node:assert/strict';import {readFile,readdir,stat} from 'node:fs/promises';import {homedir} from 'node:os';import {join} from 'node:path';
const ref='ifnjvdjhfhzfxyuorqvz';assert.equal(process.env.ROMWAY_TEST_PROJECT,ref);
const folder=join(homedir(),'.supabase/romway-test'),url=`https://${ref}.supabase.co/functions/v1/romway-auth`,origin='https://vetmaster.github.io';
const token=(await readFile(join(homedir(),'.supabase/access-token'),'utf8')).trim();
async function management(path,body){const r=await fetch(`https://api.supabase.com/v1/projects/${ref}${path}`,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(30000)});assert(r.ok,'Test management request failed; private details suppressed');return r.json();}
const project=await management('');assert.equal(project.name,'romway-auth-test');assert(project.created_at.startsWith('2026-10-11'));
const query=sql=>management('/database/query',{query:sql});
const staff=await query('select employee_number,role,active from romway_private.staff');
const snapshotSql="select md5(coalesce(jsonb_agg(to_jsonb(d) order by d.id)::text,'[]')) as snapshot from romway_private.shipment_drafts d";
const before=await query(snapshotSql);
async function call(body,cookie,requestOrigin=origin){return fetch(url,{method:'POST',headers:{Origin:requestOrigin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(30000)});}
assert.equal((await call({action:'shipment-list'})).status,401);
assert.equal((await call({action:'shipment-list'},null,'https://untrusted.invalid')).status,403);
let cookie;
for(const name of await readdir(folder)){
 if(!name.startsWith('IT_')||!name.endsWith('.json'))continue;
 const path=join(folder,name);assert.equal((await stat(path)).mode&0o077,0,'Synthetic credentials must remain private');
 const c=JSON.parse(await readFile(path,'utf8')),number=c.employee_number||c.number;
 if(!c.new_password||!staff.some(s=>s.active&&s.role==='receiver'&&s.employee_number===number))continue;
 const r=await call({action:'login',employee_number:number,password:c.new_password});if(r.status!==200)continue;
 assert.equal((await r.json()).password_change_required,false);cookie=r.headers.get('set-cookie')?.split(';')[0];break;
}
assert(cookie,'No reusable synthetic transport credential; no account changes attempted');
try{
 const me=await (await call({action:'me'},cookie)).json();assert.equal(me.profile.role,'receiver');
 const read=await call({action:'shipment-list'},cookie);assert.equal(read.status,200);assert.equal(read.headers.get('cache-control'),'no-store');
 const list=await read.json();assert(list.sources.length>=2&&list.destinations.length>=2);assert.equal(list.carriers.length,1);
 const carrier=list.carriers[0].id,source=list.sources[0].id,destination=list.destinations.find(l=>l.id!==source).id;
 const payload={action:'shipment-create',request_id:crypto.randomUUID(),source_id:source,destination_id:destination,carrier_id:carrier,notes:'INTEGRATION TEST — synthetic draft; no goods or inventory movement.'};
 const r=await call(payload,cookie);assert.equal(r.status,200);const created=await r.json();assert.equal(created.status,'draft');
 const duplicate=await call(payload,cookie);assert.equal(duplicate.status,200);assert.deepEqual(await duplicate.json(),created);
 assert.equal((await call({...payload,notes:'Changed retry'},cookie)).status,409);
 assert.equal((await call({...payload,request_id:crypto.randomUUID(),destination_id:source},cookie)).status,400);
 const after=await (await call({action:'shipment-list'},cookie)).json();const record=after.shipments.find(s=>s.id===created.id);assert(record);assert.equal(record.status,'draft');assert.equal(record.notes,payload.notes);assert(!JSON.stringify(after).includes('auth_email'));assert(!JSON.stringify(after).includes('price'));
 assert.equal((await call({action:'personnel-list'},cookie)).status,403);
 const escaped=created.id.replaceAll("'","''");
 const unchanged=await query(snapshotSql.replace('shipment_drafts d',`shipment_drafts d where id<>'${escaped}'::uuid`));assert.deepEqual(unchanged,before,'Existing drafts changed unexpectedly');
 console.log('Deployed transport endpoint: list/create/idempotent retry/conflict/invalid route/Origin/session/personnel denial passed. One synthetic draft retained; previous drafts unchanged.');
}finally{assert.equal((await call({action:'logout'},cookie)).status,200);}
