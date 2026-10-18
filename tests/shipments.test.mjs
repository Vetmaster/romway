import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {hash,randomSecret} from '../supabase/functions/romway-auth/security.js';
import {createHandler} from '../supabase/functions/romway-auth/handler.js';
const db=new PGlite(), TR='00000000-0000-4000-8000-000000000001',RO='00000000-0000-4000-8000-000000000002';
const allowed=new Set(['romway_shipments','romway_personnel','romway_session','romway_consume_attempt','romway_open_session']);
before(async()=>{
 await db.exec('create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);');
 for(const file of ['202610100001_auth_foundation.sql','202610110002_personnel.sql','202610110003_personnel_list_created_at.sql','202610110004_location_optional_country.sql','202610160005_single_personnel_location.sql','202610180006_shipment_drafts.sql'])await db.exec(await readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
});
after(()=>db.close());
async function rpc(name,args){assert(allowed.has(name));const entries=Object.entries(args);return (await db.query(`select public.${name}(${entries.map(([k],i)=>{assert(/^p_[a-z_]+$/.test(k));return `${k}=>$${i+1}`;}).join(',')}) value`,entries.map(([,v])=>v))).rows[0].value;}
let serial=0;
async function fixture(role='super_admin',locations=[],required=false){
 const id=crypto.randomUUID(),number='PTEST'+(++serial),secret=randomSecret(),digest=await hash(secret);
 await db.query('insert into auth.users values($1)',[id]);
 await db.query("insert into romway_private.staff(id,employee_number,auth_email,display_name,role,active,password_change_required,temporary_password_expires_at) values($1,$2,$3,'Test',$4,true,$5,case when $5 then now()+interval '24 hours' else null end)",[id,number,`staff-${id}@identity.invalid`,role,required]);
 for(const loc of locations)await db.query('insert into romway_private.staff_locations values($1,$2,true)',[id,loc]);
 await rpc('romway_open_session',{p_hash:digest,p_staff_id:id,p_version:1});
 const backend={rpc,async createUser(email,password,uid){assert.match(password,/^[a-f0-9]{64}$/);await db.query('insert into auth.users values($1)',[uid]);return {id:uid};}};
 const handler=createHandler({backend,appOrigin:'http://localhost:8000',local:true});
 const call=async(body)=>{const r=await handler(new Request('http://localhost:54321',{method:'POST',headers:{origin:'http://localhost:8000','content-type':'application/json',cookie:'romway_dev_session='+secret},body:JSON.stringify(body)}));return {status:r.status,body:await r.json()};};
 return {id,number,digest,call,backend,rpc:(action,data={})=>rpc('romway_shipments',{p_hash:digest,p_action:action,p_data:data})};
}

const draft=carrier=>({action:'shipment-create',request_id:crypto.randomUUID(),source_id:TR,destination_id:RO,carrier_id:carrier,notes:'Synthetic draft'});
test('draft creation is idempotent and records no inventory movement, pricing or transport position',async()=>{
 const f=await fixture(),carrier=await fixture('receiver',[RO]);const body=draft(carrier.id);
 const one=await f.call({...body,price:900,status:'in_transit'});assert.equal(one.status,200);assert.equal(one.body.status,'draft');
 assert.deepEqual(await f.call(body),one);assert.equal((await f.call({...body,notes:'changed'})).status,409);
 const list=await f.call({action:'shipment-list'});assert.equal(list.status,200);const row=list.body.shipments.find(s=>s.id===one.body.id);assert(row);assert.equal(row.status,'draft');assert(!JSON.stringify(row).includes('price'));assert(!JSON.stringify(row).includes('auth_email'));
 assert.equal((await db.query('select count(*)::int as n from romway_private.shipment_drafts where creator_id=$1',[f.id])).rows[0].n,1);
});
test('purchasing/admin source scope enforced by HTTP and direct RPC; destination can be another depot',async()=>{
 const carrier=await fixture('receiver',[RO]);
 for(const role of ['admin','purchasing']){
  const f=await fixture(role,[TR]);const list=(await f.call({action:'shipment-list'})).body;assert.deepEqual(list.sources.map(l=>l.id),[TR]);assert.equal(list.destinations.length,2);
  assert.equal((await f.call(draft(carrier.id))).status,200);
  const forbidden={...draft(carrier.id),source_id:RO,destination_id:TR};assert.equal((await f.call(forbidden)).status,403);assert.equal((await f.rpc('create',forbidden)).error,'permission_denied');
  const unassigned=await fixture(role);assert.equal((await unassigned.call(draft(carrier.id))).status,403);
 }
});
test('transport can plan across all depots regardless of affiliation but cannot assign another transport worker',async()=>{
 const f=await fixture('receiver',[RO]),other=await fixture('receiver',[TR]);
 const list=(await f.call({action:'shipment-list'})).body;assert.equal(list.sources.length,2);assert.deepEqual(list.carriers.map(s=>s.id),[f.id]);
 const created=await f.call(draft(f.id));assert.equal(created.status,200);assert.equal((await f.call(draft(other.id))).status,403);
 assert(!(await other.call({action:'shipment-list'})).body.shipments.some(s=>s.id===created.body.id));
 assert.equal((await f.call({action:'personnel-list'})).status,403);
});
test('forced password change, disabled/revoked sessions and invalid depots/carriers cannot create drafts',async()=>{
 const f=await fixture(),carrier=await fixture('receiver',[TR]),admin=await fixture('admin',[TR]);
 for(const change of [{destination_id:TR},{carrier_id:admin.id},{source_id:crypto.randomUUID()},{notes:'x'.repeat(1001)},{request_id:'bad'}])assert.equal((await f.call({...draft(carrier.id),...change})).status,400);
 const forced=await fixture('super_admin',[],true);assert.equal((await forced.call(draft(carrier.id))).status,403);assert.equal((await forced.rpc('create',draft(carrier.id))).error,'permission_denied');
 await db.query('update romway_private.staff set active=false where id=$1',[f.id]);assert.equal((await f.call({action:'shipment-list'})).status,401);assert.equal((await f.rpc('list')).error,'session_expired');
 await db.query('update romway_private.staff set active=false where id=$1',[carrier.id]);const owner=await fixture();assert.equal((await owner.call(draft(carrier.id))).status,400);
});
test('SQL tables stay private and client roles cannot call shipment RPC even with accidental SELECT grants',async()=>{
 for(const role of ['anon','authenticated']){
  assert.equal((await db.query("select has_function_privilege($1,'public.romway_shipments(text,text,jsonb)','execute') as ok",[role])).rows[0].ok,false);
  await db.exec(`grant usage on schema romway_private to ${role};grant select on romway_private.shipment_drafts to ${role};set role ${role};`);
  assert.equal((await db.query('select * from romway_private.shipment_drafts')).rows.length,0);await db.exec('reset role');
 }
 assert.equal((await db.query("select has_function_privilege('service_role','public.romway_shipments(text,text,jsonb)','execute') as ok")).rows[0].ok,true);
});
