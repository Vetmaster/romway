// Opt-in integration against the separately authorized test project. Never runs in npm test.
import assert from 'node:assert/strict';
import {readFile,open,stat} from 'node:fs/promises';
import {homedir} from 'node:os';
import {join,resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
import {createBackend} from '../supabase/functions/romway-auth/backend.js';
import {createHandler} from '../supabase/functions/romway-auth/handler.js';
import {randomSecret} from '../supabase/functions/romway-auth/security.js';

const ref='ifnjvdjhfhzfxyuorqvz',origin='https://vetmaster.github.io';
const cookieMode=process.env.ROMWAY_COOKIE_TEST_MODE ?? 'strict';
assert(['strict','partitioned'].includes(cookieMode),'Unknown test cookie mode');
const published=process.env.ROMWAY_TEST_PUBLISHED==='true';
const folder=join(homedir(),'.supabase','romway-test');
if(process.env.ROMWAY_TEST_PROJECT!==ref) throw new Error('Explicit ROMWAY_TEST_PROJECT for the authorized test project is required');
const credentialsPath=join(folder,'runtime-20261011.json');
if((await stat(credentialsPath)).mode & 0o077) throw new Error('Private runtime file must have mode 0600');
const config=JSON.parse(await readFile(credentialsPath,'utf8'));
assert(config.project_ref===ref && config.url===`https://${ref}.supabase.co`,'Unexpected project: refusing integration writes');
const token=(await readFile(join(homedir(),'.supabase','access-token'),'utf8')).trim();
async function management(path,body) {
  const response=await fetch(`https://api.supabase.com/v1/projects/${ref}${path}`,{
    method:body?'POST':'GET',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
    ...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(45000),redirect:'error'});
  assert(response.ok,`Management request failed (${response.status}); details/credentials are not printed`);
  return response.json();
}
const project=await management('');
assert(project.name==='romway-auth-test' && project.created_at.startsWith('2026-10-11'),'Wrong test project identity');
const authConfig=await management('/config/auth');
assert(authConfig.disable_signup===true,'Signup must be disabled before tests');
const permissions=await management('/database/query',{query:"select bool_and(c.relrowsecurity) as rls, bool_and(not has_table_privilege('anon',c.oid,'SELECT') and not has_table_privilege('authenticated',c.oid,'SELECT')) as client_denied, count(*)::integer as tables from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='romway_private' and c.relkind='r'"});
assert(permissions[0].tables===3 && permissions[0].rls && permissions[0].client_denied,'Real database RLS/grants must deny client access');
const backend=createBackend({url:config.url,serviceKey:config.service_key,publicKey:config.public_key});
const endpoint=config.url+'/functions/v1/romway-auth';
async function call(body,cookie,requestOrigin=origin,extra={}) {
  return fetch(endpoint,{method:'POST',redirect:'error',signal:AbortSignal.timeout(25000),
    headers:{'Content-Type':'application/json',Origin:requestOrigin,...(cookie?{Cookie:cookie}:{}),...extra},body:JSON.stringify(body)});
}
function cookieOf(response) {
  const raw=response.headers.get('set-cookie');
  assert(raw?.includes('HttpOnly') && raw.includes('Secure') && raw.startsWith('__Host-romway_session='),'Expected secure opaque session cookie');
  assert(cookieMode==='strict'?raw.includes('SameSite=Strict'):raw.includes('SameSite=None')&&raw.includes('Partitioned'),'Wrong deployed cookie mode');
  return raw.split(';')[0];
}
async function expectError(response,status,error) {
  assert.equal(response.status,status);
  assert.deepEqual(await response.json(),{error});
}
async function fixture(role='super_admin') {
  const id=crypto.randomUUID(),number='IT_'+id.replaceAll('-','').slice(0,20).toUpperCase();
  const email=`staff-${id}@identity.invalid`,temporaryPassword=randomSecret(),newPassword=randomSecret();
  // Reserve and sync credentials outside Git before creating/activating the synthetic account.
  const file=await open(join(folder,`${number}.json`),'wx',0o600);
  try {
    await file.writeFile(JSON.stringify({employee_number:number,auth_email:email,temporary_password:temporaryPassword,new_password:newPassword,role})+'\n');
    await file.sync();
  } finally {await file.close();}
  const user=await backend.createUser(email,temporaryPassword);
  assert(user?.id,'Synthetic Auth user creation failed');
  await backend.rpc('romway_register_staff',{p_id:user.id,p_employee_number:number,p_email:email,p_name:'Integration Test',p_role:role});
  return {id:user.id,number,email,temporaryPassword,newPassword};
}

const f=await fixture();
await expectError(await call({action:'login',employee_number:f.number,password:f.temporaryPassword}),401,'invalid_credentials');
assert(await backend.rpc('romway_activate_staff',{p_id:f.id}),'Test account activation failed');
await expectError(await call({action:'login',employee_number:f.number,password:randomSecret()}),401,'invalid_credentials');
await expectError(await call({action:'me'},null,'https://untrusted.invalid'),403,'origin_denied');
const login=await call({action:'login',employee_number:f.number.toLowerCase(),password:f.temporaryPassword});
assert.equal(login.status,200);assert.deepEqual(await login.json(),{password_change_required:true});
const oldCookie=cookieOf(login);
const me=await call({action:'me'},oldCookie);
assert.equal(me.status,200);assert.deepEqual(await me.json(),{password_change_required:true});
const secondLogin=await call({action:'login',employee_number:f.number,password:f.temporaryPassword});
assert.equal(secondLogin.status,200);const secondCookie=cookieOf(secondLogin);
await expectError(await call({action:'change-password',current_password:f.temporaryPassword,password:f.temporaryPassword},oldCookie),400,'password_unchanged');
const changed=await call({action:'change-password',current_password:f.temporaryPassword,password:f.newPassword},oldCookie);
assert.equal(changed.status,200);assert.deepEqual(await changed.json(),{ok:true,reauthenticate:true});
await expectError(await call({action:'me'},oldCookie),401,'session_expired');
await expectError(await call({action:'me'},secondCookie),401,'session_expired');
await expectError(await call({action:'login',employee_number:f.number,password:f.temporaryPassword}),401,'invalid_credentials');
const newLogin=await call({action:'login',employee_number:f.number,password:f.newPassword});
assert.equal(newLogin.status,200);const activeCookie=cookieOf(newLogin);
const profile=await call({action:'me'},activeCookie);
assert.equal(profile.status,200);assert.deepEqual(await profile.json(),{password_change_required:false,profile:{employee_number:f.number,display_name:'Integration Test',role:'super_admin'}});

// A genuine Supabase JWT is not an application session and cannot invoke privileged RPCs.
const authResponse=await fetch(config.url+'/auth/v1/token?grant_type=password',{method:'POST',redirect:'error',signal:AbortSignal.timeout(25000),
  headers:{apikey:config.public_key,'Content-Type':'application/json'},body:JSON.stringify({email:f.email,password:f.newPassword})});
assert.equal(authResponse.status,200);const auth=await authResponse.json();assert(auth.access_token,'Real Auth token required');
await expectError(await call({action:'me'},null,origin,{Authorization:`Bearer ${auth.access_token}`}),401,'session_expired');
for (const bearer of [config.public_key,auth.access_token]) {
  const response=await fetch(config.url+'/rest/v1/rpc/romway_staff_for_login',{method:'POST',redirect:'error',signal:AbortSignal.timeout(25000),
    headers:{apikey:config.public_key,Authorization:`Bearer ${bearer}`,'Content-Type':'application/json'},body:JSON.stringify({p_employee_number:f.number})});
  assert([401,403].includes(response.status),'Client must not call service-only RPC');
  const tables=await fetch(config.url+'/rest/v1/staff?select=id',{redirect:'error',signal:AbortSignal.timeout(25000),
    headers:{apikey:config.public_key,Authorization:`Bearer ${bearer}`,'Accept-Profile':'romway_private'}});
  assert([401,403,406].includes(tables.status),'Private schema must not be exposed');
}
const revoke=await fetch(config.url+'/auth/v1/logout?scope=local',{method:'POST',redirect:'error',signal:AbortSignal.timeout(25000),
  headers:{apikey:config.public_key,Authorization:`Bearer ${auth.access_token}`}});assert(revoke.ok,'Verification Auth session must be revoked');
const signup=await fetch(config.url+'/auth/v1/signup',{method:'POST',redirect:'error',signal:AbortSignal.timeout(25000),
  headers:{apikey:config.public_key,'Content-Type':'application/json'},body:JSON.stringify({email:`staff-${crypto.randomUUID()}@identity.invalid`,password:randomSecret()})});
assert([400,403,422].includes(signup.status),'Public signup must be denied');
assert.equal((await call({action:'logout'},activeCookie)).status,200);
await expectError(await call({action:'me'},activeCookie),401,'session_expired');

// Browser cookies run on localhost against the REAL remote Auth/DB, through the same
// production JS handler. This does not claim GitHub Pages -> supabase.co cookie compatibility.
const browserStaff=await fixture('receiver');
assert(await backend.rpc('romway_activate_staff',{p_id:browserStaff.id}));
const localOrigin='http://localhost:18700';
const localHandler=createHandler({backend,appOrigin:localOrigin,local:true});
const root=fileURLToPath(new URL('../web/',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.png':'image/png'};
const server=createServer(async(req,res)=>{
  try {
    const path=new URL(req.url,localOrigin).pathname;
    if(path==='/test-auth') {
      const chunks=[];let size=0;
      for await(const chunk of req){size+=chunk.length;if(size>8192){res.writeHead(413);res.end();return;}chunks.push(chunk);}
      const response=await localHandler(new Request(localOrigin+path,{method:req.method,headers:req.headers,...(size?{body:Buffer.concat(chunks)}:{})}));
      res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());return;
    }
    if(path==='/js/config.js') {res.writeHead(200,{'Content-Type':mime['.js'],'Cache-Control':'no-store'});res.end(`export const config={authEndpoint:'${localOrigin}/test-auth'};`);return;}
    const file=resolve(root,'.'+(path==='/'?'/index.html':decodeURIComponent(path)));
    if(!file.startsWith(root.endsWith(sep)?root:root+sep)||!mime[extname(file)]||req.method!=='GET'){res.writeHead(404);res.end();return;}
    const content=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)],'Cache-Control':'no-store'});res.end(content);
  } catch {res.writeHead(503);res.end('Test server unavailable');}
});
let browser;
try {
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(18700,'127.0.0.1',resolve);});
  browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
  const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
  const pageErrors=[];page.on('pageerror',()=>pageErrors.push('Browser error'));
  await context.route('https://fonts.googleapis.com/**',r=>r.fulfill({contentType:'text/css',body:''}));
  await page.goto(localOrigin);
  await page.locator('#login').waitFor({state:'visible'});
  await page.locator('#language').selectOption('ro');await page.reload();
  assert.equal(await page.locator('html').getAttribute('lang'),'ro');
  await page.locator('#language').selectOption('tr');
  await page.locator('#employee').fill(browserStaff.number);await page.locator('#password').fill(randomSecret());await page.locator('#login button').click();
  await page.getByText('Sicil numarası veya şifre hatalı.',{exact:true}).waitFor();
  await page.locator('#password').fill(browserStaff.temporaryPassword);await page.locator('#login button').click();
  await page.locator('#change').waitFor({state:'visible',timeoutMs:30000});
  const cookies=await context.cookies();assert(cookies.some(c=>c.name==='romway_dev_session'&&c.httpOnly&&c.sameSite==='Strict'));
  assert.equal(await page.evaluate(()=>document.cookie),'');
  await page.locator('#current').fill(browserStaff.temporaryPassword);await page.locator('#new').fill(browserStaff.newPassword);await page.locator('#confirm').fill(browserStaff.newPassword);await page.locator('#change button').click();
  await page.locator('#login').waitFor({state:'visible',timeoutMs:30000});
  await page.locator('#employee').fill(browserStaff.number);await page.locator('#password').fill(browserStaff.newPassword);await page.locator('#login button').click();
  await page.locator('#welcome').waitFor({state:'visible',timeoutMs:30000});
  assert.equal(await page.locator('#staff-role').textContent(),'Teslim alma');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(await page.evaluate(()=>Object.keys(localStorage)),['romway.language']);
  await page.locator('#logout').click();await page.locator('#login').waitFor({state:'visible'});
  assert.deepEqual(pageErrors,[]);await context.close();
  console.log('Real remote Auth/DB mobile browser flow passed through localhost test handler: TR/RO, wrong password, forced change, receiver profile, HttpOnly cookie and logout.');

  // Negative test: the same strict cookie cannot authenticate across github.io -> supabase.co.
  // Only this test context changes endpoint/CSP; deployed web files stay connection-free.
  const crossSite=await browser.newContext({viewport:{width:390,height:844}}),crossPage=await crossSite.newPage();
  await crossSite.route('https://fonts.googleapis.com/**',r=>r.fulfill({contentType:'text/css',body:''}));
  if(!published) {
    await crossPage.route('https://vetmaster.github.io/romway/',async route=>{
    const response=await route.fetch();const html=await response.text();
    await route.fulfill({response,body:html.replace("connect-src 'self'",`connect-src 'self' ${config.url}`)});
  });
  await crossPage.route('**/romway/js/**',async r=>{
    const name=new URL(r.request().url()).pathname.split('/romway/js/')[1];
    assert(['config.js','app.js','api.js','locales/tr.js','locales/ro.js'].includes(name),'Unexpected web module');
    const body=name==='config.js'?`export const config={authEndpoint:'${endpoint}'};`:await readFile(join(root,'js',name),'utf8');
    await r.fulfill({contentType:'text/javascript',body});
  });
  }
  await crossPage.goto('https://vetmaster.github.io/romway/');
  await crossPage.locator('#login').waitFor({state:'visible',timeoutMs:30000});
  const loginStatuses=[];
  crossPage.on('response',r=>{if(r.url()===endpoint && r.request().postDataJSON()?.action==='login') loginStatuses.push(r.status());});
  await crossPage.locator('#employee').fill(browserStaff.number);await crossPage.locator('#password').fill(browserStaff.newPassword);await crossPage.locator('#login button').click();
  if(cookieMode==='strict') {
    await crossPage.getByText('Tarayıcı güvenli oturumu sürdüremedi. Güncel tarayıcı kullanın ve çerez izinlerini kontrol edin.',{exact:true}).waitFor({timeoutMs:30000});
    assert(loginStatuses.includes(200),'Password must authenticate before the cross-site cookie is rejected');
    assert(!(await crossSite.cookies()).some(c=>c.name==='__Host-romway_session'),'Strict cross-site cookie must not be accepted');
    assert(!(await crossPage.locator('#welcome').isVisible()));
    console.log('GitHub Pages cross-site negative test passed: Strict cookie rejected, welcome remains inaccessible.');
  } else {
    await crossPage.locator('#welcome').waitFor({state:'visible',timeoutMs:30000});
    assert(await crossPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Published mobile layout must fit');
    const cookie=(await crossSite.cookies()).find(c=>c.name==='__Host-romway_session');
    assert(cookie?.httpOnly&&cookie.secure&&cookie.sameSite==='None'&&cookie.partitionKey===origin,'CHIPS cookie must be partitioned to GitHub Pages');
    assert.equal(await crossPage.evaluate(()=>document.cookie),'');
    await crossPage.reload();await crossPage.locator('#welcome').waitFor({state:'visible',timeoutMs:30000});
    await crossPage.locator('#logout').click();await crossPage.locator('#login').waitFor({state:'visible',timeoutMs:30000});
    assert(!(await crossSite.cookies()).some(c=>c.name==='__Host-romway_session'),'Partitioned logout must clear cookie');
    console.log('GitHub Pages CHIPS browser test passed: real Edge/Auth/DB, partitioned HttpOnly cookie, restored session and logout.');
  }
  await crossSite.close();
} finally {await browser?.close();if(server.listening) await new Promise(resolve=>server.close(resolve));}

// Disable only the synthetic account created by this run, preserving Auth/staff/history.
for(const staff of [f,browserStaff]) {
  assert(/^[0-9a-f-]{36}$/.test(staff.id));
  await management('/database/query',{query:`update romway_private.staff set active=false where id='${staff.id}'::uuid returning id`});
}
await expectError(await call({action:'login',employee_number:f.number,password:f.newPassword}),401,'invalid_credentials');
console.log('Real test-project integration passed: inactive account, wrong password, forced change, old sessions/password rejected, safe profile, JWT/RPC/schema denial, signup disabled and logout. Synthetic records retained; no production project touched.');
