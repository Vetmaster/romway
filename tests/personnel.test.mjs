import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {hash,randomSecret} from '../supabase/functions/romway-auth/security.js';
import {createHandler} from '../supabase/functions/romway-auth/handler.js';
const db=new PGlite(), TR='00000000-0000-4000-8000-000000000001',RO='00000000-0000-4000-8000-000000000002';
const allowed=new Set(['romway_personnel','romway_session','romway_consume_attempt','romway_open_session']);
before(async()=>{
 await db.exec('create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);');
 for(const file of ['202610100001_auth_foundation.sql','202610110002_personnel.sql','202610110003_personnel_list_created_at.sql'])await db.exec(await readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
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
 return {id,number,digest,call,backend,rpc:(action,data={})=>rpc('romway_personnel',{p_hash:digest,p_action:action,p_data:data})};
}
const create=(role='receiver',locations=[TR])=>({action:'personnel-create',employee_number:'CREATED'+(++serial),display_name:'<img onerror=alert(1)>',role,location_ids:locations});
test('super admin provisions with one-time temporary password and forced change, no audit secrets',async()=>{
 const f=await fixture();const body=create();const result=await f.call(body);assert.equal(result.status,200);assert.match(result.body.temporary_password,/^[a-f0-9]{64}$/);
 const s=(await db.query('select * from romway_private.staff where employee_number=$1',[body.employee_number])).rows[0];assert(s.active&&s.password_change_required);assert(s.temporary_password_expires_at);
 const list=await f.call({action:'personnel-list'});assert.equal(list.status,200);assert(!JSON.stringify(list.body).includes('auth_email'));assert(!JSON.stringify(list.body).includes(result.body.temporary_password));
 assert(!JSON.stringify((await db.query('select * from romway_private.personnel_audit')).rows).includes(result.body.temporary_password));
 assert.equal((await f.call(body)).body.error,'conflict');
});
test('receiver, purchaser and forced-change administrator cannot use direct admin endpoint or RPC',async()=>{
 for(const [role,required] of [['receiver',false],['purchasing',false],['admin',true]]){
  const f=await fixture(role,[TR],required);assert.equal((await f.call({action:'personnel-list'})).status,403);assert.equal((await f.rpc('list')).error,'permission_denied');assert.equal((await f.call(create())).status,403);
 }
});
test('admin can manage only lower roles wholly inside their assigned scope',async()=>{
 const f=await fixture('admin',[TR]);
 for(const [role,locs]of [['admin',[TR]],['super_admin',[TR]],['receiver',[RO]],['receiver',[TR,RO]]]) assert.equal((await f.call(create(role,locs))).status,403);
 const body=create();assert.equal((await f.call(body)).status,200);
 const own=(await f.call({action:'personnel-list'})).body;assert.deepEqual(own.locations.map(x=>x.id),[TR]);assert(own.staff.every(x=>['receiver','purchasing'].includes(x.role)&&x.location_ids.every(id=>id===TR)));
 const external=await fixture('receiver',[TR,RO]);assert(!own.staff.some(x=>x.id===external.id));
 assert.equal((await f.call({action:'personnel-update',id:external.id,display_name:'Test',role:'receiver',location_ids:[TR],active:false})).status,403);
 const s=own.staff.find(x=>x.employee_number===body.employee_number);
 assert.equal((await f.call({action:'personnel-update',id:s.id,display_name:'Test',role:'purchasing',location_ids:[TR],active:false})).status,200);
 assert.equal((await f.call({action:'location-create',code:'FORBIDDEN',name:'Test',country:'TR'})).status,403);
});
test('role/location/status changes revoke old sessions; no assignment or audit row deleted',async()=>{
 const f=await fixture(),target=await fixture('receiver',[TR]);
 assert.equal((await f.call({action:'personnel-update',id:target.id,display_name:'New name',role:'purchasing',location_ids:[RO],active:true})).status,200);
 assert.equal((await target.call({action:'me'})).status,401);
 const rows=(await db.query('select * from romway_private.staff_locations where staff_id=$1 order by location_id',[target.id])).rows;
 assert.equal(rows.length,2);assert.equal(rows[0].assigned,false);assert.equal(rows[1].assigned,true);
});
test('self deactivation/demotion is blocked and database validates fields',async()=>{
 const f=await fixture();
 for(const change of [{role:'receiver',active:true},{role:'super_admin',active:false}])assert.equal((await f.call({action:'personnel-update',id:f.id,display_name:'Test',location_ids:[TR],...change})).body.error,'self_protected');
 for(const props of [{location_ids:[]},{location_ids:[crypto.randomUUID()]},{location_ids:'bad'},{display_name:''},{role:'owner'}])assert.equal((await f.call({...create(),...props})).body.error,'invalid_request');
});
test('Auth failure keeps reservation but creates no accessible staff; duplicate never retried',async()=>{
 const f=await fixture();let attempts=0;f.backend.createUser=async()=>{attempts++;throw Error('secret detail');};const body=create();
 assert.deepEqual(await f.call(body),{status:503,body:{error:'provisioning_incomplete'}});assert.equal((await f.call(body)).body.error,'conflict');assert.equal(attempts,1);
 assert.equal((await db.query('select * from romway_private.staff where employee_number=$1',[body.employee_number])).rows.length,0);
});
test('activation rechecks administrator scope after external Auth request',async()=>{
 const f=await fixture('admin',[TR]);const original=f.backend.createUser;
 f.backend.createUser=async(...args)=>{const user=await original(...args);await db.query('update romway_private.staff_locations set assigned=false where staff_id=$1',[f.id]);return user;};
 const body=create();assert.equal((await f.call(body)).body.error,'provisioning_incomplete');assert.equal((await db.query('select * from romway_private.staff where employee_number=$1',[body.employee_number])).rows.length,0);
});
test('direct client roles cannot execute management RPC or select new tables, RLS is enabled',async()=>{
 for(const role of ['anon','authenticated']){await db.exec(`set role ${role};`);try{await assert.rejects(()=>db.query("select public.romway_personnel('x','list')"),/permission denied/);await assert.rejects(()=>db.query('select * from romway_private.personnel_audit'),/permission denied/);}finally{await db.exec('reset role;');}}
 const rows=(await db.query("select relname,relrowsecurity from pg_class where relnamespace='romway_private'::regnamespace and relname in ('locations','staff_locations','personnel_requests','personnel_audit')")).rows;assert.equal(rows.length,4);assert(rows.every(x=>x.relrowsecurity));
});

test('duplicate simultaneous create requests activate one staff and Auth is called once',async()=>{
 const f=await fixture();let calls=0;const original=f.backend.createUser;f.backend.createUser=async(...args)=>{calls++;return original(...args);};
 const body=create();const results=await Promise.all([f.call(body),f.call(body)]);
 assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);assert.equal(calls,1);
 assert.equal((await db.query('select * from romway_private.staff where employee_number=$1',[body.employee_number])).rows.length,1);
});
test('wrong Auth ID or revoked creator session never activates the reserved account',async()=>{
 for(const mode of ['wrong-id','revoked']){
  const f=await fixture(),body=create(),original=f.backend.createUser;
  f.backend.createUser=async(...args)=>{const user=await original(...args);if(mode==='wrong-id')return {id:crypto.randomUUID()};await db.query('update romway_private.staff set active=false where id=$1',[f.id]);return user;};
  assert.equal((await f.call(body)).body.error,'provisioning_incomplete');
  assert.equal((await db.query('select * from romway_private.staff where employee_number=$1',[body.employee_number])).rows.length,0);
 }
});

test('super admin location codes are generated uniquely on the server',async()=>{
 const f=await fixture();const body={action:'location-create',name:'Example depot',country:'TR'};
 assert.equal((await f.call(body)).status,200);assert.equal((await f.call({...body,code:'CLIENT_CODE'})).status,200);
 assert.equal((await f.call({...body,country:'XX'})).body.error,'invalid_request');
 const list=(await f.call({action:'personnel-list'})).body,added=list.locations.filter(l=>l.name==='Example depot');assert.equal(added.length,2);assert.notEqual(added[0].code,added[1].code);assert(added.every(l=>/^LOC_[A-F0-9]{32}$/.test(l.code)));
});

test('personnel list exposes creation time and orders active/newest before inactive',async()=>{
 const f=await fixture(),ids=[];
 for(const [active,date] of [[true,'2020-01-01'],[true,'2021-01-01'],[false,'2022-01-01']]){
  const payload=create();const result=await f.call(payload);assert.equal(result.status,200);
  const id=(await db.query('select id from romway_private.staff where employee_number=$1',[payload.employee_number])).rows[0].id;ids.push(id);
  await db.query('update romway_private.staff set active=$2,created_at=$3 where id=$1',[id,active,date]);
 }
 const response=await f.call({action:'personnel-list'});assert.equal(response.status,200);
 const rows=response.body.staff.filter(s=>ids.includes(s.id));assert.deepEqual(rows.map(s=>s.id),[ids[1],ids[0],ids[2]]);assert(rows.every(s=>Number.isFinite(Date.parse(s.created_at))));
});
