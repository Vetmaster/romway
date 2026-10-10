import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {createHandler} from '../supabase/functions/romway-auth/handler.js';
import {hash} from '../supabase/functions/romway-auth/security.js';
import {mkdir,readFile} from 'node:fs/promises';
const server = spawn(process.execPath,['scripts/serve.mjs'],{stdio:['ignore','pipe','inherit']});
await new Promise((resolve,reject) => { server.stdout.once('data',resolve); server.once('exit',code => reject(new Error('Preview server exited: '+code))); });
let browser;
try {
  browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
  for (const viewport of [{width:1440,height:1000},{width:390,height:844}]) {
    const context=await browser.newContext({viewport});
    await context.route('https://fonts.googleapis.com/**',route=>route.fulfill({contentType:'text/css',body:''}));
    const page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto('http://localhost:8000');
    await page.getByRole('button',{name:'Giriş yap',exact:true}).waitFor();
    assert(await page.locator('#login button').isDisabled());
    assert.match(await page.locator('#message').textContent(),/henüz kurulmadı/);
    await page.locator('#language').selectOption('ro');
    assert.equal(await page.locator('html').getAttribute('lang'),'ro');
    assert.equal(await page.locator('#panel-title').textContent(),'Bine ați venit');
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('lang'),'ro');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await mkdir('test-results',{recursive:true});
    await page.screenshot({path:`test-results/login-${viewport.width}.png`,fullPage:true});
    assert.deepEqual(errors,[]); await context.close();
  }
  // Real HTTP cookie/CORS round trip through the production handler; Auth/DB are test doubles here.
  let storedHash=null,required=true,version=1;
  const staff={id:crypto.randomUUID(),employee_number:'COOKIE1',auth_email:'staff-cookie@identity.invalid',display_name:'Cookie Test',role:'receiver',active:true,password_operation:null,password_change_required:true,temporary_password_expires_at:new Date(Date.now()+3600000).toISOString(),session_version:1};
  const cookieHandler=createHandler({appOrigin:'http://localhost:8000',local:true,backend:{
    verifyPassword:async()=>staff.id,
    updatePassword:async()=>{},
    rpc:async(name,args)=>{
      if(name==='romway_consume_attempt')return true;
      if(name==='romway_staff_for_login')return {...staff,password_change_required:required,session_version:version};
      if(name==='romway_open_session'){storedHash=args.p_hash;return true;}
      if(name==='romway_session')return args.p_hash===storedHash?{...staff,password_change_required:required}:null;
      if(name==='romway_begin_password'){storedHash=null;version++;return staff.id;}
      if(name==='romway_finish_password'){required=false;return true;}
      if(name==='romway_revoke_session'){storedHash=null;return null;}
      throw new Error('Unexpected RPC');
    },
  }});
  const cookieServer=createServer(async(req,res)=>{
    let body='';for await(const chunk of req)body+=chunk;
    const response=await cookieHandler(new Request('http://localhost:8001'+req.url,{method:req.method,headers:req.headers,...(body?{body}:{})}));
    res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());
  });
  await new Promise(resolve=>cookieServer.listen(8001,'127.0.0.1',resolve));
  try{
    const context=await browser.newContext(),page=await context.newPage();
    await page.route('http://localhost:8000/',async route => { const response=await route.fetch(); const html=await response.text(); await route.fulfill({response,body:html.replace("connect-src 'self'","connect-src 'self' http://localhost:8001")}); });
    await context.route('https://fonts.googleapis.com/**',route=>route.fulfill({contentType:'text/css',body:''}));
    await page.route('**/js/config.js',route=>route.fulfill({contentType:'text/javascript',body:"export const config={authEndpoint:'http://localhost:8001/auth'};"}));
    await page.goto('http://localhost:8000');await page.locator('#login').waitFor({state:'visible'});
    await page.locator('#employee').fill('COOKIE1');await page.locator('#password').fill('Synthetic-old-password-1');await page.locator('#login button').click();
    await page.locator('#change').waitFor({state:'visible'});
    const cookies=await context.cookies();assert(cookies.some(c=>c.name==='romway_dev_session'&&c.httpOnly&&c.sameSite==='Strict'));
    assert.equal(await page.evaluate(()=>document.cookie),'');
    const me=await page.evaluate(async()=>await(await fetch('http://localhost:8001/auth',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'me'})})).json());
    assert.deepEqual(me,{password_change_required:true});
    await page.locator('#current').fill('Synthetic-old-password-1');await page.locator('#new').fill('Synthetic-new-password-2');await page.locator('#confirm').fill('Synthetic-new-password-2');await page.locator('#change button').click();
    await page.locator('#login').waitFor({state:'visible'});
    assert(!(await context.cookies()).some(c=>c.name==='romway_dev_session'));
    await context.close();
  } finally { await new Promise(resolve=>cookieServer.close(resolve)); }
  // Test-only routes simulate API outcomes; production config and backend are untouched.
  const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
  await context.route('https://fonts.googleapis.com/**',route=>route.fulfill({contentType:'text/css',body:''}));
  let stage='logged_out',cookie=null,password='Synthetic-old-password-1',logoutFails=false,meFails=false;
  const calls=[];
  await page.route('**/js/config.js',route=>route.fulfill({contentType:'text/javascript',body:"export const config={authEndpoint:'http://localhost:8000/test-auth'};"}));
  await page.route('**/test-auth',async route=>{
    const req=route.request(),body=req.postDataJSON(); calls.push(body.action);
    let response={},status=200;
    if (body.action==='login') {
      if (body.password!==password) {status=401;response={error:'invalid_credentials'};}
      else {stage=password==='Synthetic-old-password-1'?'change':'welcome';cookie='opaque';response={password_change_required:stage==='change'};}
    } else if (body.action==='me') {
      if(meFails){status=503;response={error:'service_unavailable'};}
      else if(!cookie){status=401;response={error:'session_expired'};}
      else response=stage==='change'?{password_change_required:true}:{password_change_required:false,profile:{employee_number:'TEST1',display_name:'<img src=x onerror=alert(1)>',role:'receiver'}};
    } else if(body.action==='change-password') {
      password=body.password;cookie=null;stage='logged_out';response={ok:true,reauthenticate:true};
    } else if(body.action==='logout') {
      if(logoutFails){status=503;response={error:'service_unavailable'};}
      else {cookie=null;stage='logged_out';response={ok:true};}
    }
    await route.fulfill({status,contentType:'application/json',body:JSON.stringify(response)});
  });
  const login=async pass=>{await page.locator('#employee').fill('TEST1');await page.locator('#password').fill(pass);await page.locator('#login button').click();};
  await page.goto('http://localhost:8000');
  await page.locator('#login').waitFor({state:'visible'});
  await login('wrong');await page.getByText('Sicil numarası veya şifre hatalı.',{exact:true}).waitFor();
  assert.equal(await page.locator('#password').inputValue(),'');
  await login(password);await page.locator('#change').waitFor({state:'visible'});
  assert(await page.locator('#welcome').isHidden());
  await page.locator('#current').fill(password);await page.locator('#new').fill('Synthetic-new-password-2');await page.locator('#confirm').fill('Synthetic-mismatch-password');
  await page.locator('#change button').click();await page.getByText('Yeni şifreler eşleşmiyor.',{exact:true}).waitFor();
  assert(!calls.includes('change-password'));
  await page.locator('#current').fill(password);await page.locator('#new').fill('Synthetic-new-password-2');await page.locator('#confirm').fill('Synthetic-new-password-2');
  await page.locator('#change button').click();await page.getByText('Şifreniz değiştirildi. Yeni şifrenizle yeniden giriş yapın.',{exact:true}).waitFor();
  await login(password);await page.locator('#welcome').waitFor({state:'visible'});
  assert.equal(await page.locator('#panel-title img').count(),0);
  assert.match(await page.locator('#panel-title').textContent(),/<img/);
  await page.locator('#language').selectOption('ro');assert.equal(await page.locator('#staff-role').textContent(),'Recepție');
  logoutFails=true;await page.locator('#logout').click();await page.getByText('Conexiunea nu a putut fi stabilită. Încercați din nou.',{exact:true}).waitFor();
  assert(await page.locator('#welcome').isVisible());
  logoutFails=false;await page.locator('#logout').click();await page.locator('#login').waitFor({state:'visible'});
  meFails=true;await page.reload();await page.locator('#retry').waitFor({state:'visible'});
  assert(await page.locator('#welcome').isHidden());
  meFails=false;await page.locator('#retry').click();await page.locator('#login').waitFor({state:'visible'});
  const storage=await page.evaluate(()=>Object.keys(localStorage));
  assert.deepEqual(storage,['romway.language']);
  assert.equal((await page.evaluate(()=>Object.keys(sessionStorage))).length,0);
  await context.close();
  const traversal=await fetch('http://localhost:8000/%2e%2e%2fREADME.md');assert.equal(traversal.status,404);
  assert.equal((await fetch('http://localhost:8000/README.md')).status,404);
  console.log('Browser checks passed: mobile/desktop, TR/RO persistence, wrong login, forced change, real HttpOnly cookie/CORS round trip, XSS-safe profile, logout failure, network retry and isolated web root. API outcomes are simulated.');
} finally { await browser?.close(); server.kill(); }
