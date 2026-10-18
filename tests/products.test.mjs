import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {hash,randomSecret} from '../supabase/functions/romway-auth/security.js';
import {createHandler} from '../supabase/functions/romway-auth/handler.js';
const db=new PGlite(), TR='00000000-0000-4000-8000-000000000001',RO='00000000-0000-4000-8000-000000000002';
const allowed=new Set(['romway_products','romway_shipments','romway_personnel','romway_session','romway_consume_attempt','romway_open_session']);
before(async()=>{
 await db.exec('create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);');
 for(const file of ['202610100001_auth_foundation.sql','202610110002_personnel.sql','202610110003_personnel_list_created_at.sql','202610110004_location_optional_country.sql','202610160005_single_personnel_location.sql','202610180006_shipment_drafts.sql','202610180007_product_catalog.sql'])await db.exec(await readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
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
 return {id,number,digest,call,backend,rpc:(action,data={})=>rpc('romway_products',{p_hash:digest,p_action:action,p_data:data})};
}


const product=(location=TR)=>({action:'product-create',request_id:crypto.randomUUID(),location_id:location,name:'Test filter',part_code:'FILTER-'+(++serial),unit:'piece'});
test('cards are shared without stock/cost; codes normalized and request retries idempotent',async()=>{
 const f=await fixture();const body={...product(),part_code:' ab-123 /  45 '};const one=await f.call({...body,quantity:20,price:70});assert.equal(one.status,200);assert.deepEqual(await f.call(body),one);
 assert.equal((await f.call({...body,name:'Different'})).status,409);
 const list=await f.call({action:'product-list'});const item=list.body.products.find(p=>p.id===one.body.id);assert.equal(item.part_code,'AB-123 / 45');assert.equal(item.unit,'piece');assert(!JSON.stringify(list.body).includes('quantity'));assert(!JSON.stringify(list.body).includes('price'));assert(!JSON.stringify(list.body).includes('auth_email'));
 const other=await fixture('purchasing',[RO]);assert((await other.call({action:'product-list'})).body.products.some(p=>p.id===one.body.id));
 assert.equal((await other.call({...product(RO),part_code:'ab-123 / 45'})).body.error,'product_code_exists');
});
test('admin and purchasing creation is restricted to assigned locations on HTTP and direct RPC',async()=>{
 for(const role of ['admin','purchasing']){
  const f=await fixture(role,[TR]);assert.deepEqual((await f.call({action:'product-list'})).body.locations.map(l=>l.id),[TR]);assert.equal((await f.call(product())).status,200);assert.equal((await f.call(product(RO))).status,403);assert.equal((await f.rpc('create',product(RO))).error,'permission_denied');
  const noLocation=await fixture(role);assert.equal((await noLocation.call(product())).status,403);
 }
});
test('transport, forced-change and invalid sessions cannot access catalog or create products',async()=>{
 const transport=await fixture('receiver',[TR]),forced=await fixture('super_admin',[],true);
 for(const f of [transport,forced]){assert.equal((await f.call({action:'product-list'})).status,403);assert.equal((await f.call(product())).status,403);assert.equal((await f.rpc('list')).error,'permission_denied');}
 const f=await fixture();await db.query('update romway_private.staff set active=false where id=$1',[f.id]);assert.equal((await f.call({action:'product-list'})).status,401);assert.equal((await f.rpc('list')).error,'session_expired');
});
test('invalid units, blank fields, missing locations and unsupported part codes fail without writes',async()=>{
 const f=await fixture();for(const patch of [{name:' '},{unit:'box'},{part_code:'<script>'},{location_id:crypto.randomUUID()},{name:'x'.repeat(101)},{part_code:'A'.repeat(81)},{request_id:'bad'}])assert.equal((await f.call({...product(),...patch})).status,400);
 for(const patch of [{name:''},{unit:'box'},{part_code:'<script>'}])assert.equal((await f.rpc('create',{...product(),...patch})).error,'invalid_request');
 assert.equal((await db.query('select count(*)::int n from romway_private.products where creator_id=$1',[f.id])).rows[0].n,0);
});
test('catalog tables have closed RLS and service-only RPC',async()=>{
 for(const role of ['anon','authenticated']){
  assert.equal((await db.query("select has_function_privilege($1,'public.romway_products(text,text,jsonb)','execute') ok",[role])).rows[0].ok,false);
  await db.exec(`grant usage on schema romway_private to ${role};grant select on romway_private.products to ${role};set role ${role};`);assert.equal((await db.query('select * from romway_private.products')).rows.length,0);await db.exec('reset role');
 }
 assert.equal((await db.query("select has_function_privilege('service_role','public.romway_products(text,text,jsonb)','execute') ok")).rows[0].ok,true);
});
