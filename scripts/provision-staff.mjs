// Trusted operator bootstrap for a NEW LOCAL test project, not a browser or admin UI.
import {open,realpath} from 'node:fs/promises';
import {resolve,relative,dirname,basename,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createBackend} from '../supabase/functions/romway-auth/backend.js';
import {employeeNumber,randomSecret} from '../supabase/functions/romway-auth/security.js';
const url = new URL(process.env.SUPABASE_URL ?? '');
if (url.protocol !== 'http:' || !['localhost','127.0.0.1'].includes(url.hostname) || process.env.ROMWAY_LOCAL_DEV !== 'true') throw new Error('Only a new LOCAL test environment is allowed');
const [number,name,output] = process.argv.slice(2);
if (!name?.trim() || name.length>100 || !output) throw new Error('Usage: node scripts/provision-staff.mjs SICIL NAME /absolute/private/output-file');
const root = fileURLToPath(new URL('../',import.meta.url));
const outputPath = resolve(await realpath(dirname(resolve(output))),basename(output));
const rel = relative(await realpath(root),outputPath);
if (!(rel === '..' || rel.startsWith('..'+sep))) throw new Error('Credential file must be OUTSIDE the repository');
// Reserve a new 0600 file before creating anything. Never overwrite/delete credentials or users.
const file = await open(outputPath,'wx',0o600);
try {
  const backend = createBackend({url:url.href,serviceKey:process.env.SUPABASE_SERVICE_ROLE_KEY,publicKey:process.env.SUPABASE_ANON_KEY});
  const employee_number = employeeNumber(number);
  if (await backend.rpc('romway_staff_for_login',{p_employee_number:employee_number})) throw new Error('Employee already exists');
  const auth_email = `staff-${crypto.randomUUID()}@identity.invalid`, password = randomSecret();
  const user = await backend.createUser(auth_email,password);
  if (!user?.id) throw new Error('Auth user not created');
  await backend.rpc('romway_register_staff',{p_id:user.id,p_employee_number:employee_number,p_email:auth_email,p_name:name.trim(),p_role:'super_admin'});
  await file.writeFile(JSON.stringify({employee_number,temporary_password:password,valid_hours:24})+'\n');
  await file.sync();
  if (!await backend.rpc('romway_activate_staff',{p_id:user.id})) throw new Error('Account inactive; operator recovery required');
  console.log('Local test admin created. Temporary password is in the private output file; not printed here.');
} finally { await file.close(); }
