// Run only after explicit approval: product catalog migration and Edge deployment to the isolated test project.
import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {homedir} from 'node:os';import {join} from 'node:path';
const ref='ifnjvdjhfhzfxyuorqvz',root=new URL('..',import.meta.url).pathname;
assert.equal(process.env.ROMWAY_TEST_PROJECT,ref);assert.equal(process.env.ROMWAY_APPROVED_CHANGE,'product-catalog-202610180007');
const token=(await readFile(join(homedir(),'.supabase/access-token'),'utf8')).trim();
async function api(path,{body,method}={}){const r=await fetch('https://api.supabase.com/v1/projects/'+ref+path,{method:method??(body?'POST':'GET'),headers:{Authorization:'Bearer '+token,...(body instanceof FormData?{}:{'Content-Type':'application/json'})},...(body?{body:body instanceof FormData?body:JSON.stringify(body)}:{}),redirect:'error',signal:AbortSignal.timeout(120000)});assert(r.ok,`Test-project request failed (${r.status}); private details suppressed`);const s=await r.text();return s?JSON.parse(s):null;}
const project=await api('');assert.equal(project.name,'romway-auth-test');assert(project.created_at.startsWith('2026-10-11'));assert.equal(project.status,'ACTIVE_HEALTHY');
const query=query=>api('/database/query',{body:{query}});
const snapshotSql="select (select count(*) from auth.users)::int as auth_users,"+['staff','staff_locations','locations','personnel_requests','personnel_audit','shipment_drafts'].map(t=>`(select md5(coalesce(jsonb_agg(to_jsonb(r) order by to_jsonb(r)::text)::text,'[]')) from romway_private.${t} r) as ${t}`).join(',');
const before=await query(snapshotSql),fnBefore=await api('/functions/romway-auth');assert.equal(fnBefore.verify_jwt,false);
const files=['index.ts','backend.js','handler.js','personnel.js','security.js','legal.js','legal-tr.js','legal-ro.js','shipments.js','products.js'];
async function deploy(dry){const form=new FormData();form.append('metadata',JSON.stringify({name:'romway-auth',entrypoint_path:'index.ts',verify_jwt:false}));for(const file of files)form.append('file',new Blob([await readFile(join(root,'supabase/functions/romway-auth',file))],{type:'application/typescript'}),file);return api('/functions/deploy?slug=romway-auth'+(dry?'&bundleOnly=1':''),{body:form});}
await deploy(true);console.log('Exact isolated test project verified; function bundle validated.');
assert.deepEqual(await query(snapshotSql),before,'Existing records changed; deployment halted without deleting or reverting records');
const rights=(await query("select has_function_privilege('anon','public.romway_personnel(text,text,jsonb)','execute') as anon,has_function_privilege('authenticated','public.romway_personnel(text,text,jsonb)','execute') as authenticated,has_function_privilege('service_role','public.romway_personnel(text,text,jsonb)','execute') as service"))[0];assert(!rights.anon&&!rights.authenticated&&rights.service);
const exists=(await query("select to_regclass('romway_private.products') is not null as present"))[0].present;
if(!exists){await api('/database/migrations',{body:{name:'romway_product_catalog',query:await readFile(join(root,'supabase/migrations/202610180007_product_catalog.sql'),'utf8')}});}
const access=(await query("select has_function_privilege('anon','public.romway_products(text,text,jsonb)','execute') as anon,has_function_privilege('authenticated','public.romway_products(text,text,jsonb)','execute') as authenticated,has_function_privilege('service_role','public.romway_products(text,text,jsonb)','execute') as service"))[0];assert(!access.anon&&!access.authenticated&&access.service);
assert.deepEqual(await query(snapshotSql),before,'Existing records changed during migration');
await deploy(false);const fn=await api('/functions/romway-auth');assert.equal(fn.verify_jwt,false);assert.equal(fn.status,'ACTIVE');assert(fn.version>fnBefore.version);assert.deepEqual(await query(snapshotSql),before,'Existing records changed during function deployment');
console.log(JSON.stringify({project:'romway-auth-test',functionVersion:fn.version,status:fn.status,existingRecordsPreserved:true,productCatalogMigrationVerified:true}));
