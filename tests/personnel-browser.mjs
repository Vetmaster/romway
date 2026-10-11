import {chromium} from 'playwright';
import {PGlite} from '@electric-sql/pglite';
import {readFile,mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
import {createHandler} from '../supabase/functions/romway-auth/handler.js';
const db=new PGlite(),users=new Map(),TR='00000000-0000-4000-8000-000000000001';
let browser,httpServer,staticServer;
try{
 await db.exec('create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);');
 for(const file of ['202610100001_auth_foundation.sql','202610110002_personnel.sql','202610110003_personnel_list_created_at.sql'])await db.exec(await readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
 const admin=crypto.randomUUID(),email=`staff-${admin}@identity.invalid`;
 users.set(email,{id:admin,password:'Synthetic-admin-password'});
 await db.query('insert into auth.users values($1)',[admin]);
 await db.query("insert into romway_private.staff(id,employee_number,auth_email,display_name,role,active,password_change_required) values($1,'BROWSERADMIN',$2,'Browser Admin','super_admin',true,false)",[admin,email]);
 const names=new Set(['romway_staff_for_login','romway_consume_attempt','romway_open_session','romway_session','romway_revoke_session','romway_begin_password','romway_finish_password','romway_personnel']);
 const backend={
  async rpc(name,args){assert(names.has(name));const entries=Object.entries(args);return (await db.query(`select public.${name}(${entries.map(([k],i)=>{assert(/^p_[a-z_]+$/.test(k));return `${k}=>$${i+1}`;}).join(',')}) value`,entries.map(([,v])=>v))).rows[0].value;},
  async verifyPassword(e,p){const u=users.get(e);return u?.password===p?u.id:null;},
  async createUser(e,p,id){await db.query('insert into auth.users values($1)',[id]);users.set(e,{id,password:p});return {id};},
  async updatePassword(id,p){for(const u of users.values())if(u.id===id)u.password=p;},
 };
 const handler=createHandler({backend,appOrigin:'http://localhost:8000',local:true});
 httpServer=createServer(async(req,res)=>{
  let body='';for await(const c of req)body+=c;
  const response=await handler(new Request('http://localhost:8001'+req.url,{method:req.method,headers:req.headers,...(body?{body}:{})}));
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());
 });
 await new Promise(resolve=>httpServer.listen(8001,'127.0.0.1',resolve));
 staticServer=spawn(process.execPath,['scripts/serve.mjs'],{stdio:['ignore','pipe','inherit']});
 await new Promise((resolve,reject)=>{staticServer.stdout.once('data',resolve);staticServer.once('exit',code=>reject(Error('Preview exit '+code)));});
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:1000}});await context.grantPermissions(['local-network-access'],{origin:'http://localhost:8000'});
  await context.route('https://fonts.googleapis.com/**',r=>r.fulfill({contentType:'text/css',body:''}));
  await context.route('http://localhost:8000/',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace("connect-src 'self'","connect-src 'self' http://localhost:8001")});});
  await context.route('**/js/config.js*',r=>r.fulfill({contentType:'text/javascript',body:"export const config={authEndpoint:'http://localhost:8001/auth'};"}));
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:8000');await page.locator('#login').waitFor({state:'visible'});
  const logout=async()=>{if(width<=820)await page.locator('#menu-toggle').click();assert.equal(await page.locator('#logout').evaluate(el=>el.parentElement.id),'drawer-profile');await page.locator('#logout').click();};
  const navigate=async id=>{if(width<=820)await page.locator('#menu-toggle').click();await page.locator('#'+id).click();};
  const login=async(number,password)=>{await page.locator('#employee').fill(number);await page.locator('#password').fill(password);await page.locator('#login button').click();};
  await login('BROWSERADMIN','Synthetic-admin-password');await page.locator('#welcome').waitFor({state:'visible'});
  assert(await page.locator('#auth-panel').isHidden());assert(await page.locator('.intro').isHidden());
  await mkdir('test-results',{recursive:true});await page.screenshot({path:`test-results/dashboard-${width}.png`,fullPage:true});
  if(width<=820){
    await page.locator('#menu-toggle').click();assert(await page.locator('#navigation-drawer').evaluate(el=>el.open));
    assert(await page.locator('.drawer-profile').evaluate(el=>{const panel=el.closest('dialog').getBoundingClientRect(),box=el.getBoundingClientRect();return panel.bottom-box.bottom<30;}));assert.equal(await page.locator('#menu-close').count(),0);await page.mouse.click(380,500);await page.locator('#navigation-drawer').waitFor({state:'hidden'});await page.locator('#menu-toggle').click();await page.keyboard.press('Escape');await page.locator('#navigation-drawer').waitFor({state:'hidden'});assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
    await page.locator('#menu-toggle').click();
  }else{assert(await page.locator('#navigation-drawer').isVisible());assert(await page.locator('.drawer-profile').evaluate(el=>{const panel=el.closest('dialog').getBoundingClientRect(),box=el.getBoundingClientRect();return panel.bottom-box.bottom<30;}));assert(await page.locator('#menu-toggle').isHidden());}
  await page.locator('#nav-personnel').click();await page.locator('#welcome').waitFor({state:'hidden'});
  if(width<=820){assert.equal(await page.locator('#navigation-drawer').evaluate(el=>el.open),false);await page.locator('#menu-toggle').click();}
  await page.locator('#nav-home').click();await page.locator('#welcome').waitFor({state:'visible'});
  await page.locator('#personnel-open').click();await page.locator('#personnel-new').waitFor({state:'visible'});
  await page.locator('#auth-panel').waitFor({state:'hidden'});assert(await page.locator('.intro').isHidden());assert.equal(await page.locator('#logout').evaluate(el=>el.parentElement.id),'drawer-profile');
  if(width<=820) await page.locator('#menu-toggle').click();await page.locator('#nav-home').click();assert(await page.locator('#welcome').isVisible());assert(await page.locator('#auth-panel').isHidden());assert(await page.locator('#personnel-section').isHidden());await page.locator('#personnel-open').click();await page.locator('#personnel-new').waitFor({state:'visible'});
  if(width<=820)await page.locator('#menu-toggle').click();await page.locator('#nav-add-personnel').click();await page.locator('#personnel-form').waitFor({state:'visible'});assert(await page.locator('#location-form').isHidden());assert.equal(await page.evaluate(()=>document.activeElement.id),'personnel-new');
  if(width<=820)await page.locator('#menu-toggle').click();await page.locator('#nav-add-location').click();await page.locator('#location-form').waitFor({state:'visible'});assert(await page.locator('#personnel-form').isHidden());assert.equal(await page.evaluate(()=>document.activeElement.id),'location-toggle');await page.locator('#location-toggle').click();assert(await page.locator('#personnel-section').isHidden());assert(await page.locator('#location-list li').count()>0);await navigate('nav-personnel');await page.locator('#personnel-new').waitFor({state:'visible'});
  assert(await page.locator('#personnel-form').isHidden());assert.equal(await page.locator('#personnel-new').textContent(),'Personel ekle');
  await page.locator('#personnel-new').click();await page.locator('#personnel-new').click();assert(await page.locator('#personnel-form').isHidden());assert.equal(await page.locator('#personnel-new').getAttribute('aria-expanded'),'false');
  await page.locator('#personnel-new').click();await page.locator('#personnel-number').fill('CANCEL'+width);await page.locator('#personnel-cancel').click();
  assert(await page.locator('#personnel-form').isHidden());assert.equal(await page.locator('#personnel-number').inputValue(),'');
  assert.equal((await db.query('select count(*)::int as n from romway_private.staff where employee_number=$1',['CANCEL'+width])).rows[0].n,0);
  await page.locator('#personnel-new').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'personnel-new');await page.locator('#personnel-number').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'personnel-number');
  await page.locator('#personnel-number').fill('MOBILE'+width);await page.locator('#personnel-name').fill('<img src=x onerror=alert(1)>');
  await page.locator('#personnel-save').click();await page.locator('#personnel-message').getByText('İstek tamamlanamadı.',{exact:true}).waitFor();assert(await page.locator('#auth-panel').isHidden());assert(await page.locator('#personnel-form').isVisible());
  await page.locator(`#personnel-locations input[value="${TR}"]`).check();await page.locator('#personnel-save').click();
  await page.locator('#temporary-credential').waitFor({state:'visible'});await page.locator('#personnel-message').waitFor({state:'hidden'});const temporary=await page.locator('#temporary-password').textContent();assert.match(temporary,/^[a-f0-9]{64}$/);
  await page.locator('#personnel-search').fill('MOBILE'+width);assert.equal(await page.locator('#personnel-list li').count(),1);await page.locator('#personnel-search').fill('NOT_FOUND_SEARCH');assert.equal(await page.locator('#personnel-list button').count(),0);assert.equal(await page.locator('#personnel-list li').count(),1);await page.locator('#personnel-search').fill('');
  assert.equal(await page.locator('#personnel-list img').count(),0);assert.equal(await page.locator('#personnel-number').inputValue(),'');assert(await page.locator('#personnel-form').isHidden());
  await page.locator('#language').selectOption('ro');assert.equal(await page.locator('#personnel-heading').textContent(),'Administrarea personalului');
  await page.locator('#personnel-search').fill('MOBILE'+width);assert.equal(await page.locator('#personnel-list li').count(),1);await page.locator('#personnel-search').fill('NOT_FOUND_SEARCH');assert.equal(await page.locator('#personnel-list button').count(),0);assert.equal(await page.locator('#personnel-list li').count(),1);await page.locator('#personnel-search').fill('');
  assert.equal(await page.locator('#personnel-list img').count(),0);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await mkdir('test-results',{recursive:true});await page.screenshot({path:`test-results/personnel-${width}.png`,fullPage:true});
  await page.locator('#credential-close').click();assert.equal(await page.locator('#temporary-password').textContent(),'');
  await navigate('nav-add-location');await page.locator('#location-form').waitFor({state:'visible'});assert(await page.locator('#personnel-section').isHidden());assert.equal(await page.evaluate(()=>document.activeElement.id),'location-toggle');
  await page.locator('#location-code').fill('BROWSER_'+width);await page.locator('#location-name').fill('Browser Test Depot '+width);await page.locator('#location-country').selectOption('RO');await page.locator('#location-form button').click();await page.locator('#location-list').getByText('Browser Test Depot '+width,{exact:true}).waitFor();assert(await page.locator('#location-form').isHidden());
  await navigate('nav-add-personnel');await page.locator('#personnel-form').waitFor({state:'visible'});assert(await page.locator('#location-section').isHidden());await page.locator('#personnel-locations').getByText('Browser Test Depot '+width+' (RO)',{exact:true}).waitFor();await page.locator('#personnel-cancel').click();
  const target=page.locator('#personnel-list li').filter({hasText:'MOBILE'+width});await target.getByRole('button').click();assert(await page.locator('#personnel-form').isVisible());assert.equal(await page.locator('#personnel-form-heading').textContent(),'Editează');
  await page.locator('#personnel-active').uncheck();await page.locator('#personnel-save').click();await target.getByText(/Inactiv/).waitFor();
  await logout();await page.locator('#login').waitFor({state:'visible'});assert(await page.locator('#personnel-section').isHidden());
  await login('MOBILE'+width,temporary);await page.getByText('Numărul de angajat sau parola este incorectă.',{exact:true}).waitFor();
  await login('BROWSERADMIN','Synthetic-admin-password');await page.locator('#welcome').waitFor({state:'visible'});
  await page.locator('#personnel-open').click();
  await page.locator('#personnel-list li').filter({hasText:'MOBILE'+width}).getByRole('button').click();await page.locator('#personnel-active').check();await page.locator('#personnel-save').click();
  await page.locator('#personnel-list li').filter({hasText:'MOBILE'+width}).getByText(/Activ/).waitFor();
  await logout();await page.locator('#login').waitFor({state:'visible'});await login('MOBILE'+width,temporary);await page.locator('#change').waitFor({state:'visible'});
  assert(await page.locator('#personnel-open').isHidden());
  await page.locator('#current').fill(temporary);await page.locator('#new').fill('Synthetic-new-personnel-password');await page.locator('#confirm').fill('Synthetic-new-personnel-password');await page.locator('#change button').click();
  await page.locator('#login').waitFor({state:'visible'});await login('MOBILE'+width,'Synthetic-new-personnel-password');await page.locator('#welcome').waitFor({state:'visible'});assert(await page.locator('#personnel-open').isHidden());
  assert.deepEqual(await page.evaluate(()=>Object.keys(localStorage)),['romway.language']);assert.deepEqual(await page.evaluate(()=>Object.keys(sessionStorage)),[]);assert.equal(await page.evaluate(()=>document.cookie),'');assert.deepEqual(errors,[]);
  await logout();await page.locator('#login').waitFor({state:'visible'});await login('BROWSERADMIN','Synthetic-admin-password');await page.locator('#welcome').waitFor({state:'visible'});
  await page.route('http://localhost:8001/auth',async route=>{
   if(route.request().postDataJSON().action!=='personnel-list')return route.continue();
   await route.fulfill({contentType:'application/json',body:JSON.stringify({locations:[],staff:Array.from({length:25},(_,i)=>({id:'fixture-'+i,display_name:'Fixture '+i,employee_number:'FIX'+i,role:'receiver',active:true,location_ids:[],created_at:new Date(2020,0,i+1).toISOString()}))})});
  });
  await page.locator('#personnel-open').click();await page.locator('#personnel-more').waitFor({state:'visible'});assert.equal(await page.locator('#personnel-list li').count(),10);
  await page.locator('#personnel-more').click();assert.equal(await page.locator('#personnel-list li').count(),20);
  await page.locator('#personnel-more').click();assert.equal(await page.locator('#personnel-list li').count(),25);assert(await page.locator('#personnel-more').isHidden());
  await page.locator('#personnel-search').fill('FIX24');assert.equal(await page.locator('#personnel-list li').count(),1);assert(await page.locator('#personnel-more').isHidden());
  await page.locator('#personnel-search').fill('');assert.equal(await page.locator('#personnel-list li').count(),10);assert(await page.locator('#personnel-more').isVisible());
  await context.close();
 }
 console.log('Personnel browser checks passed at 390/1440: actual SQL + HTTP handler, simulated Auth, TR/RO, create/edit/deactivate/reactivate, forced change, XSS, credential clearing and storage.');
}finally{await browser?.close();if(httpServer)await new Promise(r=>httpServer.close(r));staticServer?.kill();await db.close();}
