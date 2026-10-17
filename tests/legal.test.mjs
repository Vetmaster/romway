import test from 'node:test';import assert from 'node:assert/strict';import {createHandler} from '../supabase/functions/romway-auth/handler.js';
const origin='https://vetmaster.github.io',secret='a'.repeat(64);
async function request(staff,body={action:'legal-documents',language:'tr'},cookie=true,requestOrigin=origin){const calls=[];const handler=createHandler({appOrigin:origin,cookieMode:'partitioned',backend:{rpc:async name=>{calls.push(name);assert.equal(name,'romway_session');return staff;}}});const r=await handler(new Request('https://example.invalid/auth',{method:'POST',headers:{Origin:requestOrigin,'Content-Type':'application/json',...(cookie?{Cookie:'__Host-romway_session='+secret}:{})},body:JSON.stringify(body)}));return {status:r.status,body:await r.json(),calls,headers:r.headers};}
test('legal bodies require a valid super-admin session and completed password change',async()=>{
 for(const role of ['admin','purchasing','receiver']){const r=await request({role,password_change_required:false});assert.equal(r.status,403);assert.deepEqual(r.body,{error:'permission_denied'});}
 assert.equal((await request({role:'super_admin',password_change_required:true})).status,403);
 assert.equal((await request(null)).status,401);assert.equal((await request({role:'super_admin'},undefined,false)).status,401);
 assert.equal((await request({role:'super_admin'},undefined,true,'https://attacker.invalid')).status,403);
});
test('super admin receives localized read-only drafts, completion fields and authoritative sources',async()=>{
 for(const language of ['tr','ro']){const r=await request({role:'super_admin',password_change_required:false},{action:'legal-documents',language});assert.equal(r.status,200);assert.equal(r.body.status,'draft');assert.equal(r.body.documents.length,6);assert.equal(r.body.missingFields.length,5);assert.equal(r.headers.get('cache-control'),'no-store');assert.deepEqual(r.calls,['romway_session']);assert.equal(r.body.documents[0].id,'notice');assert(!JSON.stringify(r.body).includes('bilgi@sasa-f.com'));assert(!JSON.stringify(r.body).includes('Fenerbahçe'));assert(r.body.sources.every(s=>s.url.startsWith('https://')));}
 assert.equal((await request({role:'super_admin'},{action:'legal-documents',language:'de'})).status,400);
});

test('test organization details are explicitly fictitious and use a non-deliverable contact in both languages',async()=>{
 for(const language of ['tr','ro']){
  const {body}=await request({role:'super_admin',password_change_required:false},{action:'legal-documents',language});
  const paragraphs=body.documents[0].sections[0].paragraphs;
  assert(paragraphs.join(' ').includes('Solea Test Lojistik Ltd. Şti.'));
  assert(paragraphs.join(' ').includes('veri.basvuru@solea.example.invalid'));
  assert(paragraphs[0].includes(language==='tr'?'Tamamı temsilidir':'Toate sunt fictive'));
  assert(body.documents.at(-1).sections[0].paragraphs[0].includes('veri.basvuru@solea.example.invalid'));
  assert.equal(body.status,'draft');assert.equal(body.missingFields.length,5);
 }
});
