// Synthetic integration only, never part of npm test. Secrets stay in private files/memory.
import assert from 'node:assert/strict';
import {readFile,open,stat} from 'node:fs/promises';
import {homedir} from 'node:os';
import {join} from 'node:path';
import {chromium} from 'playwright';
import {createBackend} from '../supabase/functions/romway-auth/backend.js';
import {randomSecret} from '../supabase/functions/romway-auth/security.js';
const ref='ifnjvdjhfhzfxyuorqvz',origin='https://vetmaster.github.io',TR='00000000-0000-4000-8000-000000000001',RO='00000000-0000-4000-8000-000000000002';
assert.equal(process.env.ROMWAY_TEST_PROJECT,ref,'Exact authorized test-project opt-in required');
const folder=join(homedir(),'.supabase/romway-test'),path=join(folder,'runtime-20261011.json');
assert.equal((await stat(path)).mode&0o077,0,'Private credentials required');
const config=JSON.parse(await readFile(path,'utf8'));assert(config.project_ref===ref&&config.url===`https://${ref}.supabase.co`);
const pat=(await readFile(join(homedir(),'.supabase/access-token'),'utf8')).trim();
async function management(path,body){const r=await fetch(`https://api.supabase.com/v1/projects/${ref}${path}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${pat}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),redirect:'error',signal:AbortSignal.timeout(45000)});assert(r.ok,`Management status ${r.status}; details suppressed`);return r.json();}
const project=await management('');assert(project.name==='romway-auth-test'&&project.created_at.startsWith('2026-10-11'));
const permissions=(await management('/database/query',{query:"select count(*)::int as tables,bool_and(c.relrowsecurity) as rls,bool_and(not has_table_privilege('anon',c.oid,'SELECT') and not has_table_privilege('authenticated',c.oid,'SELECT')) as denied from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='romway_private' and c.relkind='r'"}))[0];
assert.equal(permissions.tables,7);assert(permissions.rls&&permissions.denied);
const backend=createBackend({url:config.url,serviceKey:config.service_key,publicKey:config.public_key}),endpoint=config.url+'/functions/v1/romway-auth';
const created=[],runTag=crypto.randomUUID().replaceAll('-','').slice(0,10).toUpperCase();let serial=0;
const number=()=>`IT_P_${runTag}_${++serial}`;
async function save(staff){assert(/^IT_P_[A-Z0-9_]+$/.test(staff.number));created.push(staff);const file=await open(join(folder,staff.number+'.json'),'wx',0o600);try{await file.writeFile(JSON.stringify(staff)+'\n');await file.sync();}finally{await file.close();}return staff;}
async function call(body,cookie){const r=await fetch(endpoint,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(body.action==='personnel-create'?45000:25000)});const raw=r.headers.get('set-cookie');return {status:r.status,body:await r.json(),cookie:raw?.split(';')[0]};}
const ok=r=>{assert.equal(r.status,200,JSON.stringify(r.body));return r.body;};
const denied=(r,error='permission_denied',status=403)=>{assert.equal(r.status,status);assert.deepEqual(r.body,{error});};
async function login(s,password=s.password){const r=await call({action:'login',employee_number:s.number,password});ok(r);assert(r.cookie?.startsWith('__Host-romway_session='));return r.cookie;}
async function change(s){const cookie=await login(s,s.temporary_password);assert.deepEqual(ok(await call({action:'me'},cookie)),{password_change_required:true});s.password=randomSecret();ok(await call({action:'change-password',current_password:s.temporary_password,password:s.password},cookie));denied(await call({action:'me'},cookie),'session_expired',401);return login(s);}
async function add(cookie,role,locations,name='Personnel Integration'){
 const n=number(),r=await call({action:'personnel-create',employee_number:n,display_name:name,role,location_ids:locations},cookie);const result=ok(r);
 assert.match(result.temporary_password,/^[a-f0-9]{64}$/);assert.equal(result.employee_number,n);assert.equal(result.valid_hours,24);
 const s=await save({number:n,temporary_password:result.temporary_password,role});
 const list=ok(await call({action:'personnel-list'},rootCookie));s.id=list.staff.find(x=>x.employee_number===n)?.id;assert(s.id);return s;
}
let rootCookie,browser;
try{
 const id=crypto.randomUUID(),root=await save({id,number:number(),temporary_password:randomSecret(),role:'super_admin'});
 const user=await backend.createUser(`staff-${id}@identity.invalid`,root.temporary_password,id);assert.equal(user.id,id);
 await backend.rpc('romway_register_staff',{p_id:id,p_employee_number:root.number,p_email:`staff-${id}@identity.invalid`,p_name:'Personnel Integration Admin',p_role:'super_admin'});assert(await backend.rpc('romway_activate_staff',{p_id:id}));
 const tempCookie=await login(root,root.temporary_password);denied(await call({action:'personnel-list'},tempCookie));rootCookie=await change(root);
 const baseline=ok(await call({action:'personnel-list'},rootCookie));assert(baseline.locations.some(l=>l.id===TR)&&baseline.locations.some(l=>l.id===RO));
 const admin=await add(rootCookie,'admin',[TR]),adminCookie=await change(admin);
 for(const props of [{role:'super_admin',location_ids:[TR]},{role:'admin',location_ids:[TR]},{role:'receiver',location_ids:[RO]},{role:'receiver',location_ids:[TR,RO]}])denied(await call({action:'personnel-create',employee_number:number(),display_name:'Denied Test',...props},adminCookie));
 const receiver=await add(adminCookie,'receiver',[TR]),receiverCookie=await change(receiver);
 const purchasing=await add(adminCookie,'purchasing',[TR]),purchasingCookie=await change(purchasing);
 denied(await call({action:'personnel-list'},receiverCookie));denied(await call({action:'personnel-list'},purchasingCookie));
 const roStaff=await add(rootCookie,'receiver',[RO]),dualStaff=await add(rootCookie,'receiver',[TR,RO]);
 const scoped=ok(await call({action:'personnel-list'},adminCookie));assert.deepEqual(scoped.locations.map(x=>x.id),[TR]);assert(!scoped.staff.some(x=>[admin.id,roStaff.id,dualStaff.id].includes(x.id)));
 const update=(s,role,ids,active=true)=>({action:'personnel-update',id:s.id,display_name:'Updated Integration',role,location_ids:ids,active});
 denied(await call(update(roStaff,'receiver',[TR],false),adminCookie));denied(await call(update(receiver,'admin',[TR]),adminCookie));
 ok(await call(update(receiver,'receiver',[RO]),rootCookie));denied(await call({action:'me'},receiverCookie),'session_expired',401);denied(await call(update(receiver,'receiver',[TR]),adminCookie));
 ok(await call(update(purchasing,'purchasing',[TR],false),adminCookie));denied(await call({action:'me'},purchasingCookie),'session_expired',401);denied(await call({action:'login',employee_number:purchasing.number,password:purchasing.password}),'invalid_credentials',401);
 denied(await call(update(root,'super_admin',[],false),rootCookie),'self_protected');
 const duplicateNumber=number(),payload={action:'personnel-create',employee_number:duplicateNumber,display_name:'Concurrent Test',role:'receiver',location_ids:[TR]};
 const concurrent=await Promise.all([call(payload,adminCookie),call(payload,adminCookie)]);assert.deepEqual(concurrent.map(r=>r.status).sort(),[200,409]);const success=concurrent.find(r=>r.status===200);await save({number:duplicateNumber,temporary_password:success.body.temporary_password,role:'receiver'});
 // Genuine JWT plus anon must both be rejected by the service-only management RPC.
 const auth=await fetch(config.url+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:config.public_key,'Content-Type':'application/json'},body:JSON.stringify({email:`staff-${root.id}@identity.invalid`,password:root.password}),redirect:'error',signal:AbortSignal.timeout(25000)});assert.equal(auth.status,200);const jwt=(await auth.json()).access_token;
 for(const bearer of [config.public_key,jwt]){const r=await fetch(config.url+'/rest/v1/rpc/romway_personnel',{method:'POST',headers:{apikey:config.public_key,Authorization:`Bearer ${bearer}`,'Content-Type':'application/json'},body:JSON.stringify({p_hash:'x',p_action:'list',p_data:{}}),redirect:'error',signal:AbortSignal.timeout(25000)});assert([401,403].includes(r.status));}
 const revoked=await fetch(config.url+'/auth/v1/logout?scope=local',{method:'POST',headers:{apikey:config.public_key,Authorization:`Bearer ${jwt}`},redirect:'error',signal:AbortSignal.timeout(25000)});assert(revoked.ok);
 const audit=(await management('/database/query',{query:`select count(*)::int as events from romway_private.personnel_audit where actor='${root.id}'::uuid or actor='${admin.id}'::uuid`}))[0];assert(audit.events>=10);
 console.log('Real test Edge/Auth/DB personnel checks passed: scoped roles, forced change, location revocation, inactive login, RPC/JWT denial, audit and concurrent same-sicil requests.');
 // Both preview mode and published mode use the real GitHub Pages origin and real Edge.
 const published=process.env.ROMWAY_TEST_PUBLISHED==='true';
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:390,height:1000}}),page=await context.newPage();const errors=[];page.on('pageerror',()=>errors.push('Browser error'));
 await context.route('https://fonts.googleapis.com/**',r=>r.fulfill({contentType:'text/css',body:''}));
 if(!published){await context.route('https://vetmaster.github.io/romway/styles.css',async r=>r.fulfill({contentType:'text/css',body:await readFile(new URL('../web/styles.css',import.meta.url),'utf8')}));await context.route('https://vetmaster.github.io/romway/',async r=>r.fulfill({contentType:'text/html',body:await readFile(new URL('../web/index.html',import.meta.url),'utf8')}));await context.route('**/romway/js/**',async r=>{const name=new URL(r.request().url()).pathname.split('/romway/js/')[1];assert(['config.js','app.js','api.js','personnel.js','locales/tr.js','locales/ro.js'].includes(name));await r.fulfill({contentType:'text/javascript',body:await readFile(new URL('../web/js/'+name,import.meta.url),'utf8')});});}
 await page.goto('https://vetmaster.github.io/romway/');await page.locator('#login').waitFor({state:'visible'});await page.locator('#employee').fill(root.number);await page.locator('#password').fill(root.password);await page.locator('#login button').click();await page.locator('#welcome').waitFor({state:'visible'});
 const cookie=(await context.cookies()).find(c=>c.name==='__Host-romway_session');assert(cookie?.httpOnly&&cookie.secure&&cookie.partitionKey===origin);assert.equal(await page.evaluate(()=>document.cookie),'');
 await page.locator('#personnel-open').click();await page.locator('#personnel-number').waitFor({state:'visible'});
 const browserNumber=number();await page.locator('#personnel-number').fill(browserNumber);await page.locator('#personnel-name').fill('Mobile Integration');await page.locator(`#personnel-locations input[value="${TR}"]`).check();await page.locator('#personnel-save').click();await page.locator('#temporary-credential').waitFor({state:'visible'});const temporary=await page.locator('#temporary-password').textContent();await save({number:browserNumber,temporary_password:temporary,role:'receiver'});
 await page.locator('#message').waitFor({state:'hidden'});await page.locator('#language').selectOption('ro');assert.equal(await page.locator('#personnel-heading').textContent(),'Administrarea personalului');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.locator('#credential-close').click();assert.equal(await page.locator('#temporary-password').textContent(),'');
 const card=page.locator('#personnel-list article').filter({hasText:browserNumber});await card.getByRole('button').click();await page.locator('#personnel-active').uncheck();await page.locator('#personnel-save').click();await card.getByText(/Inactiv/).waitFor();
 assert.deepEqual(await page.evaluate(()=>Object.keys(localStorage)),['romway.language']);assert.deepEqual(await page.evaluate(()=>Object.keys(sessionStorage)),[]);await page.locator('#logout').click();await page.locator('#login').waitFor({state:'visible'});assert(await page.locator('#personnel-section').isHidden());assert.deepEqual(errors,[]);
 await context.close();console.log(`Real ${published?'published':'preview'} GitHub Pages mobile personnel checks passed: create/deactivate, TR/RO, CHIPS, one-time password clearing and storage.`);
}finally{
 await browser?.close();
 // Disable ONLY this run's unique synthetic accounts and preserve all history.
 const numbers=created.map(s=>s.number);assert(numbers.every(n=>/^IT_P_[A-Z0-9_]+$/.test(n)));
 if(numbers.length)await management('/database/query',{query:`update romway_private.staff set active=false,session_version=session_version+1 where employee_number in (${numbers.map(n=>"'"+n+"'").join(',')}) returning employee_number`});
 console.log('Synthetic run accounts disabled; existing staff, TESTADMIN password and all history preserved.');
}
