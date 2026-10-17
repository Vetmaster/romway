import {chromium} from 'playwright';import {readFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const browser=await chromium.launch();
try{for(const width of [390,1440]){
 const page=await browser.newPage({viewport:{width,height:1000}}),errors=[],staff=[{id:"S",employee_number:"S1",display_name:"Sample",role:"receiver",active:true,location_ids:["L"]}];let creates=0;page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',async r=>{const u=new URL(r.request().url());if(u.hostname.endsWith('supabase.co')){const body=JSON.parse(r.request().postData());if(body.action==='personnel-create'){creates++;if(creates===1)return r.fulfill({status:400,json:{error:'invalid_request'}});assert.deepEqual(body.location_ids,['L']);staff.push({...body,id:'NEW',active:true,created_at:new Date().toISOString()});return r.fulfill({json:{employee_number:body.employee_number,temporary_password:'Synthetic-one-time-password',valid_hours:24}});}return r.fulfill({json:body.action==='me'?{profile:{role:'super_admin',display_name:'Preview',employee_number:'ADMIN'},password_change_required:false}:{staff,locations:[{id:'L',name:'Test Depo',code:'L'}]}});}if(u.hostname!=='vetmaster.github.io')return r.abort();const path=u.pathname.replace('/romway','');try{await r.fulfill({body:await readFile('web'+(path==='/'?'/index.html':path)),contentType:path.endsWith('.css')?'text/css':path.endsWith('.js')?'text/javascript':path.endsWith('.png')?'image/png':'text/html'});}catch{await r.abort();}});

 await page.goto('https://vetmaster.github.io/romway/#location');
 await page.locator('#location-toggle').waitFor();
 await page.waitForFunction(()=>!document.querySelector('#location-toggle').disabled);
 // Long content after the card allows alignment rather than end-of-page clamping.
 await page.evaluate(()=>{const spacer=document.createElement('div');spacer.style.height='1600px';document.querySelector('#location-section').append(spacer);});
 await page.locator('#location-toggle').click();
 await page.waitForFunction(()=>{const card=document.querySelector('#location-card');return Math.abs(card.getBoundingClientRect().top-(innerWidth>820?156:12))<2;});
 assert.equal(await page.evaluate(()=>document.activeElement.id),'location-toggle');
 await page.locator('#location-toggle').click();
 const closedScroll=await page.evaluate(()=>scrollY);await page.waitForTimeout(60);assert.equal(await page.evaluate(()=>scrollY),closedScroll);
 await page.goto('https://vetmaster.github.io/romway/#staff-profile/S');
 await page.locator('#record-edit').waitFor();await page.locator('#record-edit').click();
 await page.waitForTimeout(80);
 assert.equal(await page.evaluate(()=>document.activeElement.id),'personnel-form-heading');
 const top=await page.locator('#personnel-form-heading').evaluate(e=>e.getBoundingClientRect().top);
 assert(top>=(width>820?144:0), 'editor must not be behind banner');
 assert.deepEqual(errors,[]);await page.close();console.log(width,'location card alignment, closing stability and edit focus passed');
}}finally{await browser.close();}
