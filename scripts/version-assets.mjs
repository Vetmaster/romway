import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../web/',import.meta.url);
const hash=async name=>createHash('sha256').update(await readFile(new URL(name,root))).digest('hex').slice(0,12);
const check=process.argv.includes('--check');
async function update(name,next){const path=new URL(name,root),old=await readFile(path,'utf8');if(old===next)return;if(check)throw Error('Asset versions are stale. Run node scripts/version-assets.mjs and commit the result.');await writeFile(path,next);}
let app=await readFile(new URL('js/app.js',root),'utf8');
for(const match of [...app.matchAll(/from '(\.\/[^'?]+\.js)(?:\?v=[^']*)?'/g)]){const target='js/'+match[1].slice(2);app=app.replace(match[0],`from '${match[1]}?v=${await hash(target)}'`);}
await update('js/app.js',app);
let html=await readFile(new URL('index.html',root),'utf8');
for(const name of ['styles.css','js/app.js'])html=html.replace(new RegExp(`((?:href|src)=")${name.replaceAll('.','\\.')}(?:\\?v=[^"]*)?(")`),`$1${name}?v=${await hash(name)}$2`);
await update('index.html',html);
console.log(check?'Asset versions match file contents.':'Asset URLs updated from content hashes.');
