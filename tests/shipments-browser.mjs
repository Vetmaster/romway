import {chromium} from 'playwright';import {readFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const A='00000000-0000-4000-8000-000000000001',B='00000000-0000-4000-8000-000000000002',C='00000000-0000-4000-8000-000000000003';
const browser=await chromium.launch();
try{for(const width of [390,1440])for(const role of ['super_admin','receiver']){
 const p=await browser.newPage({viewport:{width,height:900}}),errors=[],writes=[],shipments=[];let reads=0;
 p.on('pageerror',e=>errors.push(e.message));
 await p.route('https://**/*',async route=>{const u=new URL(route.request().url());if(u.hostname.endsWith('supabase.co')){
  const body=JSON.parse(route.request().postData());let json;
  if(body.action==='me')json={profile:{role,display_name:'Synthetic',employee_number:'TEST'},password_change_required:false};
  else if(body.action==='shipment-list'){reads++;json={sources:[{id:A,name:'A'},{id:B,name:'B'}],destinations:[{id:A,name:'A'},{id:B,name:'B'}],carriers:[{id:C,display_name:'Carrier'}],shipments};}
  else if(body.action==='shipment-create') {writes.push(body);if(writes.length===1)return route.fulfill({status:503,json:{error:'service_unavailable'}});shipments.push({id:body.request_id,number:1,source_name:'A',destination_name:'B',carrier_name:'Carrier',notes:body.notes,status:'draft',created_at:new Date().toISOString()});json={ok:true,id:body.request_id,number:1,status:'draft'};}
  else if(body.action==='personnel-list')json={staff:[],locations:[]};else throw Error('Unexpected '+body.action);
  return route.fulfill({json});
 }
 if(u.hostname!=='vetmaster.github.io')return route.abort();const path=u.pathname.replace('/romway','');try{return route.fulfill({body:await readFile('web'+(path==='/'?'/index.html':path)),contentType:path.endsWith('.css')?'text/css':path.endsWith('.js')?'text/javascript':path.endsWith('.png')?'image/png':'text/html'});}catch{return route.abort();}});
 await p.goto('https://vetmaster.github.io/romway/#shipment-start');await p.locator('#shipment-form').waitFor();assert(!['INPUT','SELECT','TEXTAREA'].includes(await p.evaluate(()=>document.activeElement.tagName)));
 await p.selectOption('#shipment-source',A);await p.selectOption('#shipment-destination',A);await p.locator('#shipment-form button[type=submit]').click();await p.locator('#shipment-message').getByText('Kaynak ve hedef depo farklı olmalıdır.').waitFor();assert.equal(writes.length,0);
 await p.selectOption('#shipment-destination',B);await p.screenshot({path:`/private/tmp/romway-shipment-form-${width}.png`,fullPage:true});await p.locator('#shipment-notes').fill('<img src=x onerror=alert(1)>');await p.selectOption('#language','ro');assert.equal(await p.locator('#shipment-source').inputValue(),A);assert.equal(await p.locator('#shipment-notes').inputValue(),'<img src=x onerror=alert(1)>');
 await p.locator('#shipment-form button[type=submit]').click();await p.waitForFunction(()=>document.querySelector('#shipment-message').textContent.length>0&&!document.querySelector('#shipment-source').disabled);assert.equal(writes.length,1);assert.equal(await p.locator('#shipment-source').inputValue(),A);
 await p.locator('#shipment-form button[type=submit]').click();await p.locator('#shipment-saved').getByText('Proiect salvat.',{exact:false}).waitFor();assert.equal(writes.length,2);assert.equal(writes[0].request_id,writes[1].request_id);assert.equal(await p.locator('#shipment-list img').count(),0);assert((await p.locator('#shipment-list').textContent()).includes('<img'));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.reload();await p.locator('#shipment-form').waitFor();assert.equal(new URL(p.url()).hash,'#shipment-start');assert((await p.locator('#shipment-list').textContent()).includes('Carrier'));
 if(role==='super_admin'){await p.selectOption('#preview-role','receiver');const before=reads;await p.locator('#shipment-open').click();await p.locator('#shipment-readonly').waitFor();assert.equal(reads,before);assert(await p.locator('#shipment-form').isHidden());assert.equal(await p.locator('#shipment-list li').count(),0);}
 assert.deepEqual(errors,[]);await p.screenshot({path:`/private/tmp/romway-shipment-${width}-${role}.png`,fullPage:true});await p.close();console.log(width,role,'form, scope view, retry idempotency, TR/RO, escaping, reload and overflow passed');
}}finally{await browser.close();}
