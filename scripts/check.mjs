import {readFile,readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
async function walk(path) {
  const result=[];
  for (const entry of await readdir(path,{withFileTypes:true})) {
    const file=path+'/'+entry.name;
    result.push(...(entry.isDirectory()?await walk(file):[file]));
  }
  return result;
}
for (const path of ['web','scripts','supabase/functions','tests']) {
  for (const file of await walk(path)) {
    const text=await readFile(file,'utf8');
    assert(!/(?:sb_secret_|gh[pousr]_)[a-zA-Z0-9]{20,}/.test(text),`Possible secret in ${file}`);
    if (file.endsWith('.js')||file.endsWith('.mjs')) {
      const check=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
      assert.equal(check.status,0,check.stderr);
    }
    if (file.startsWith('web/')) {
      assert(!/SUPABASE_SERVICE_ROLE_KEY|access_token|refresh_token|Authorization\s*:/.test(text),`Server credential reference in ${file}`);
    }
  }
}
const html=await readFile('web/index.html','utf8');
for (const [,target] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  if (target==='./'||target.startsWith('https:')) continue;
  await readFile('web/'+target);
}
console.log('JS syntax, web references and limited secret/credential checks passed.');
