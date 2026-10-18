// Explicit operator action, limited to the isolated test project and four named test logins.
import assert from 'node:assert/strict';import {readFile,open,stat} from 'node:fs/promises';import {homedir} from 'node:os';import {join} from 'node:path';
import {createBackend} from '../supabase/functions/romway-auth/backend.js';import {managePersonnel} from '../supabase/functions/romway-auth/personnel.js';import {randomSecret,hash} from '../supabase/functions/romway-auth/security.js';
const ref='ifnjvdjhfhzfxyuorqvz';assert.equal(process.env.ROMWAY_TEST_PROJECT,ref);assert.equal(process.env.ROMWAY_APPROVED_CHANGE,'test-role-accounts-20261018');
const folder=join(homedir(),'.supabase/romway-test'),runtime=join(folder,'runtime-20261011.json');assert.equal((await stat(runtime)).mode&0o077,0);
const config=JSON.parse(await readFile(runtime,'utf8'));assert.equal(config.project_ref,ref);assert.equal(config.url,`https://${ref}.supabase.co`);
const token=(await readFile(join(homedir(),'.supabase/access-token'),'utf8')).trim();
async function api(path,body){const r=await fetch(`https://api.supabase.com/v1/projects/${ref}${path}`,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(30000)});assert(r.ok,'Test-management action failed; private details suppressed');return r.json();}
const project=await api('');assert.equal(project.name,'romway-auth-test');assert(project.created_at.startsWith('2026-10-11'));
const query=query=>api('/database/query',{query});
const names=['TEST_S_ADMIN','TEST_ADMIN','TEST_SATINALMA','TEST_PERSONEL'];
assert.equal((await query("select count(*)::int n from romway_private.staff where employee_number in ('TEST_S_ADMIN','TEST_ADMIN','TEST_SATINALMA','TEST_PERSONEL')"))[0].n,0,'A target login already exists; no replacement or password reset allowed');
const owner=(await query("select s.id,s.role,s.active,s.password_change_required,s.session_version,md5(a.encrypted_password) password_fingerprint from romway_private.staff s join auth.users a on a.id=s.id where s.employee_number='TESTADMIN'"))[0];
assert(owner&&owner.role==='super_admin'&&owner.active&&!owner.password_change_required,'Original completed-password test super admin not found');
const [location]=await query("select id,name from romway_private.locations order by case when code='TR_TEST' then 0 else 1 end,code limit 1");assert(location,'A test location is required');
const snapshotSql=`select md5(coalesce(jsonb_agg(to_jsonb(s) order by s.id)::text,'[]')) snapshot from romway_private.staff s where id<>'${owner.id}'::uuid and employee_number not in ('TEST_ADMIN','TEST_SATINALMA','TEST_PERSONEL')`;
const before=await query(snapshotSql);
const output=join(folder,'test-role-accounts-20261018.json'),file=await open(output,'wx',0o600);
const report={test_only:true,created_at:new Date().toISOString(),super_admin:{employee_number:'TEST_S_ADMIN',password_note:'Mevcut şifre değişmedi.'},affiliated_location:location.name,accounts:[]};
async function save(){await file.truncate(0);await file.write(JSON.stringify(report,null,2)+'\n',0,'utf8');await file.sync();}
const backend=createBackend({url:config.url,serviceKey:config.service_key,publicKey:config.public_key});let digest;
try{
 await save();
 await query("begin; update romway_private.staff set employee_number='TEST_S_ADMIN' where employee_number='TESTADMIN' and role='super_admin'; insert into romway_private.personnel_audit(actor,action,target,details) select id,'test_login_rename',id,jsonb_build_object('old_employee_number','TESTADMIN','new_employee_number','TEST_S_ADMIN') from romway_private.staff where employee_number='TEST_S_ADMIN'; commit;");
 const renamed=(await query("select s.id,s.session_version,md5(a.encrypted_password) password_fingerprint from romway_private.staff s join auth.users a on a.id=s.id where s.employee_number='TEST_S_ADMIN'"))[0];assert.equal(renamed.id,owner.id);assert.equal(renamed.password_fingerprint,owner.password_fingerprint);assert.equal(renamed.session_version,owner.session_version);
 // Trusted operator provisioning through the same reserve/create/complete path as the admin UI.
 digest=await hash(randomSecret());assert(await backend.rpc('romway_open_session',{p_hash:digest,p_staff_id:owner.id,p_version:owner.session_version}));
 const staff=await backend.rpc('romway_session',{p_hash:digest});
 for(const account of [{employee_number:'TEST_ADMIN',display_name:'Test Admin',role:'admin'},{employee_number:'TEST_SATINALMA',display_name:'Test Satın Alma',role:'purchasing'},{employee_number:'TEST_PERSONEL',display_name:'Test Personel',role:'receiver'}]){
  const result=await managePersonnel({backend,staff,sessionHash:digest,body:{action:'personnel-create',...account,location_ids:[location.id]}});
  report.accounts.push({...account,temporary_password:result.temporary_password,valid_hours:result.valid_hours,first_login_password_change:true});await save();
 }
 const actual=await query("select s.employee_number,s.role,s.active,s.password_change_required,(select count(*)::int from romway_private.staff_locations l where l.staff_id=s.id and l.assigned) locations from romway_private.staff s where s.employee_number in ('TEST_ADMIN','TEST_SATINALMA','TEST_PERSONEL') order by s.employee_number");assert.equal(actual.length,3);for(const row of actual){assert(row.active&&row.password_change_required&&row.locations===1);assert.equal(row.role,report.accounts.find(a=>a.employee_number===row.employee_number).role);}
 assert.deepEqual(await query(snapshotSql),before,'Another existing staff record changed');
 assert.equal((await query("select md5(encrypted_password) fingerprint from auth.users where id='"+owner.id+"'::uuid"))[0].fingerprint,owner.password_fingerprint);
 console.log('Only romway-auth-test: original super-admin login renamed, Auth ID/password/session version preserved; three requested role accounts created with one affiliation and mandatory first password change. Credentials saved only in a private 0600 file outside Git.');
}finally{if(digest)await backend.rpc('romway_revoke_session',{p_hash:digest});await file.close();}
