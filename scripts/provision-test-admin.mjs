// Explicit bootstrap ONLY for the user-authorized isolated cloud test project.
import {readFile,open,stat} from 'node:fs/promises';
import {homedir} from 'node:os';
import {join} from 'node:path';
import {createBackend} from '../supabase/functions/romway-auth/backend.js';
import {randomSecret} from '../supabase/functions/romway-auth/security.js';

const ref='ifnjvdjhfhzfxyuorqvz',folder=join(homedir(),'.supabase','romway-test');
if(process.env.ROMWAY_TEST_PROJECT!==ref) throw new Error('Explicit authorized test-project reference is required');
const runtime=join(folder,'runtime-20261011.json');
if((await stat(runtime)).mode & 0o077) throw new Error('Private runtime permissions must be 0600');
const config=JSON.parse(await readFile(runtime,'utf8'));
if(config.project_ref!==ref || config.url!==`https://${ref}.supabase.co`) throw new Error('Unexpected test project');
const backend=createBackend({url:config.url,serviceKey:config.service_key,publicKey:config.public_key});
const number='TESTADMIN';
if(await backend.rpc('romway_staff_for_login',{p_employee_number:number})) throw new Error('TESTADMIN already exists; no replacement or password reset performed');
const file=await open(join(folder,'test-admin-20261011.json'),'wx',0o600);
try {
  const password=randomSecret(),email=`staff-${crypto.randomUUID()}@identity.invalid`;
  await file.writeFile(JSON.stringify({employee_number:number,temporary_password:password,valid_hours:24,test_only:true})+'\n');
  await file.sync();
  const user=await backend.createUser(email,password);
  if(!user?.id) throw new Error('Test Auth user not created');
  await backend.rpc('romway_register_staff',{p_id:user.id,p_employee_number:number,p_email:email,p_name:'Romway Test Admin',p_role:'super_admin'});
  if(!await backend.rpc('romway_activate_staff',{p_id:user.id})) throw new Error('Test account inactive; operator review required');
  console.log('TESTADMIN activated only in romway-auth-test. Temporary password is in the private 0600 file outside Git; first change is mandatory.');
} finally {await file.close();}
