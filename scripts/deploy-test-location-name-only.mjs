// Run only after explicit approval for PR name-only locations, on this exact test project.
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
const snapshotSql="select (select count(*) from romway_private.staff)::int as staff,(select count(*) from auth.users)::int as users,(select jsonb_agg(to_jsonb(l) order by l.id) from romway_private.locations l) as locations";
const pre=(await query(snapshotSql))[0];
const column=(await query("select is_nullable from information_schema.columns where table_schema='romway_private' and table_name='locations' and column_name='country'"))[0];
assert(column,'Missing location schema');
if(column.is_nullable==='NO'){
 const sql=await readFile(new URL('../supabase/migrations/202610110004_location_optional_country.sql',import.meta.url),'utf8');
 await api('/database/migrations',{name:'romway_location_optional_country',query:sql});
}else console.log('Country column already optional; no repeat migration writes.');
const post=(await query(snapshotSql))[0];assert.deepEqual(post,pre,'Existing data changed unexpectedly');
const rights=(await query("select has_function_privilege('anon','public.romway_personnel(text,text,jsonb)','execute') as anon,has_function_privilege('authenticated','public.romway_personnel(text,text,jsonb)','execute') as authenticated,has_function_privilege('service_role','public.romway_personnel(text,text,jsonb)','execute') as service"))[0];
assert(!rights.anon&&!rights.authenticated&&rights.service);
console.log('Only romway-auth-test migration applied/verified; all existing locations and staff/Auth counts preserved. Edge function deployment is a separate authorized step.');
