// Run only after explicit approval for the creation-time migration, on this exact test project.
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
const pre=(await query("select (select count(*) from romway_private.staff)::int as staff, (select count(*) from auth.users)::int as users, (select count(*) from pg_tables where schemaname='romway_private')::int as tables, pg_get_functiondef('public.romway_personnel(text,text,jsonb)'::regprocedure) as definition"))[0];
assert.equal(pre.tables,7,'Unexpected schema; refusing migration');
if(/'created_at'\s*,\s*s\.created_at/.test(pre.definition)) console.log('Creation-time response already present; no repeat writes.');
else {
 const sql=await readFile(new URL('../supabase/migrations/202610110003_personnel_list_created_at.sql',import.meta.url),'utf8');
 await api('/database/migrations',{name:'romway_personnel_list_created_at',query:sql});
 console.log('Creation-time response installed only on romway-auth-test.');
}
const post=(await query("select (select count(*) from romway_private.staff)::int as staff,(select count(*) from auth.users)::int as users,pg_get_functiondef('public.romway_personnel(text,text,jsonb)'::regprocedure) as definition,has_function_privilege('anon','public.romway_personnel(text,text,jsonb)','execute') as anon,has_function_privilege('authenticated','public.romway_personnel(text,text,jsonb)','execute') as authenticated,has_function_privilege('service_role','public.romway_personnel(text,text,jsonb)','execute') as service"))[0];
assert.equal(post.staff,pre.staff);assert.equal(post.users,pre.users);
assert(/'created_at'\s*,\s*s\.created_at/.test(post.definition));assert(!post.anon&&!post.authenticated&&post.service);
console.log('Existing staff/Auth counts preserved; restricted RPC now includes creation time.');
