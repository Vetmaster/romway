import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApi} from '../web/js/api.js';
import {createBackend} from '../supabase/functions/romway-auth/backend.js';
import tr from '../web/js/locales/tr.js';
import ro from '../web/js/locales/ro.js';

test('TR/RO keys match; every translation is nonempty',() => {
  assert.deepEqual(Object.keys(tr).sort(),Object.keys(ro).sort());
  for (const locale of [tr,ro]) for (const value of Object.values(locale)) assert.equal(typeof value === 'string' && value.length>0,true);
});
test('API sends credentials through cookie flow; no Authorization header or manual token',async () => {
  const api = createApi('https://api.example.com/functions/v1/romway-auth',async (url,options) => {
    assert.equal(options.credentials,'include'); assert.equal(options.cache,'no-store');
    assert.equal(options.headers.Authorization,undefined);
    assert.deepEqual(JSON.parse(options.body),{employee_number:'A1',password:'synthetic',action:'login'});
    return Response.json({password_change_required:true});
  });
  assert.deepEqual(await api.call('login',{employee_number:'A1',password:'synthetic'}),{password_change_required:true});
});
test('missing config and unsafe URLs cannot cause fake successful login',async () => {
  await assert.rejects(createApi('').call('login'),/not_configured/);
  for (const url of ['http://example.com','javascript:alert(1)','https://user:pass@example.com','https://example.com?token=x']) assert.throws(() => createApi(url));
});
test('network failures, malformed responses and rate limits are explicit',async () => {
  const url = 'https://api.example.com';
  await assert.rejects(createApi(url,async () => {throw new Error('network');}).call('me'),/service_unavailable/);
  await assert.rejects(createApi(url,async () => new Response('html')).call('me'),/service_unavailable/);
  await assert.rejects(createApi(url,async () => Response.json({error:'rate_limited'},{status:429})).call('login'),/rate_limited/);
});
test('backend verifies password through Auth and immediately revokes verification session',async () => {
  const paths=[];
  const backend=createBackend({url:'https://project.example.com',publicKey:'synthetic-public-key',serviceKey:'synthetic-server-key'},async (url,options) => {
    paths.push(url.pathname+url.search);
    if (url.pathname === '/auth/v1/token') return Response.json({access_token:'synthetic-token',user:{id:'synthetic-user'}});
    assert.equal(options.headers.Authorization,'Bearer synthetic-token');
    return new Response(null,{status:204});
  });
  assert.equal(await backend.verifyPassword('staff@identity.invalid','synthetic'),'synthetic-user');
  assert.deepEqual(paths,['/auth/v1/token?grant_type=password','/auth/v1/logout?scope=local']);
});
test('backend distinguishes wrong credentials from Auth outage/rate limits',async () => {
  for (const [status,expected] of [[400,null],[401,null],[429,'rate_limited'],[500,'service_unavailable']]) {
    const backend=createBackend({url:'https://project.example.com',publicKey:'synthetic-public-key',serviceKey:'synthetic-server-key'},async () => new Response('private error details',{status}));
    if (!expected) assert.equal(await backend.verifyPassword('staff@identity.invalid','wrong'),null);
    else await assert.rejects(backend.verifyPassword('staff@identity.invalid','wrong'),new RegExp(expected));
  }
});

test('Auth creation uses the reserved ID only when explicitly supplied, credentials stay server-side',async()=>{
 const requests=[];const backend=createBackend({url:'https://project.example.com',publicKey:'synthetic-public',serviceKey:'synthetic-server'},async(url,options)=>{requests.push(JSON.parse(options.body));assert.equal(options.headers.Authorization,'Bearer synthetic-server');return Response.json({id:'reserved-id'});});
 await backend.createUser('staff-reserved-id@identity.invalid','synthetic-password','reserved-id');
 await backend.createUser('staff-bootstrap@identity.invalid','synthetic-password');
 assert.equal(requests[0].id,'reserved-id');assert(!('id' in requests[1]));assert.equal(requests[0].email_confirm,true);
});
