import {execFileSync} from 'node:child_process';
const git = (args,options={}) => execFileSync('git',args,{encoding:'utf8',...options});
if(git(['status','--porcelain']).trim()) throw new Error('Commit/review source changes before publishing');
// Fetching preserves any remote history; no force push or source checkout is involved.
const refs=git(['ls-remote','origin','refs/heads/gh-pages']).trim();
if(refs) git(['fetch','origin','gh-pages']);
const parent=refs ? git(['rev-parse','FETCH_HEAD']).trim() : null;
const entries=git(['ls-tree','-z','HEAD:web']).split('\0').filter(x=>x && x.split('\t')[1]!=='_headers').join('\0')+'\0';
const tree=git(['mktree','-z'],{input:entries}).trim();
const source=git(['rev-parse','HEAD']).trim();
const commit=git(['commit-tree',tree,...(parent?['-p',parent]:[]),'-m',`Publish web preview from ${source}`]).trim();
git(['push','origin',`${commit}:refs/heads/gh-pages`]);
console.log(`Published static branch from ${source}. GitHub Pages build still needs verification.`);
