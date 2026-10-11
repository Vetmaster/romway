// Explicit 11 October user authorization: this exact test project only.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {homedir} from 'node:os';
import {join} from 'node:path';
const ref='ifnjvdjhfhzfxyuorqvz';
assert.equal(process.env.ROMWAY_TEST_PROJECT,ref,'Explicit test-project opt-in required');
const token=(await readFile(join(homedir(),'.supabase/access-token'),'utf8')).trim();
async function api(path,body){
 const r=await fetch(`https://api.supabase.com/v1/projects/${ref}${path}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),redirect:'error',signal:AbortSignal.timeout(45000)});
 assert(r.ok,`Test project request failed (${r.status}); private details suppressed`);const text=await r.text();return text?JSON.parse(text):null;
}
const project=await api('');assert(project.name==='romway-auth-test'&&project.created_at.startsWith('2026-10-11')&&project.status==='ACTIVE_HEALTHY','Unexpected project identity');
const query=q=>api('/database/query',{query:q});
const pre=(await query("select (select count(*) from romway_private.staff)::int as staff, (select count(*) from auth.users)::int as users, to_regprocedure('public.romway_personnel(text,text,jsonb)') is not null as installed, (select count(*) from pg_tables where schemaname='romway_private')::int as tables"))[0];
if(pre.installed){assert.equal(pre.tables,7);console.log('Personnel migration already present; no repeat writes.');}
else{
 assert.equal(pre.tables,3,'Unexpected private schema; refusing migration');
 const sql=await readFile(new URL('../supabase/migrations/202610110002_personnel.sql',import.meta.url),'utf8');
 await api('/database/migrations',{name:'romway_personnel',query:sql});
 console.log('Authorized personnel migration applied only to romway-auth-test.');
}
const post=(await query("select (select count(*) from romway_private.staff)::int as staff,(select count(*) from auth.users)::int as users,(select count(*) from romway_private.locations)::int as locations"))[0];
assert.equal(post.staff,pre.staff);assert.equal(post.users,pre.users);assert(post.locations>=2,'Synthetic locations missing');
console.log('Existing staff/Auth counts preserved; test locations and personnel RPC present.');
