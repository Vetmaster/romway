import {revealCard} from './card-scroll.js';
// Legal bodies arrive only through the authenticated super-admin endpoint.
export function renderLegalDocuments(data,text){
 const node=(tag,value)=>{const el=document.createElement(tag);if(value!==undefined)el.textContent=value;return el;};
 const list=document.getElementById('legal-documents'),pending=document.getElementById('legal-missing'),sources=document.getElementById('legal-sources');
 list.replaceChildren();pending.replaceChildren();sources.replaceChildren();
 for(const field of data.missingFields??[])pending.append(node('li',field));
 for(const doc of data.documents??[]){
  const detail=node('details');detail.className='legal-document';const summary=node('summary');summary.append(node('strong',doc.title),node('span',text('legal_draft')));detail.append(summary);
  const article=node('article');article.append(node('p',doc.summary));for(const section of doc.sections??[]){article.append(node('h3',section.heading));for(const paragraph of section.paragraphs??[])article.append(node('p',paragraph));}detail.append(article);
  summary.addEventListener('click',()=>requestAnimationFrame(()=>{if(detail.open)revealCard(detail);}));
  detail.addEventListener('toggle',()=>{if(detail.open)for(const other of list.querySelectorAll('details[open]'))if(other!==detail)other.open=false;});list.append(detail);
 }
 for(const source of data.sources??[]){const url=new URL(source.url);if(url.protocol!=='https:'||!['www.kvkk.gov.tr','eur-lex.europa.eu'].includes(url.hostname))continue;const row=node('li'),link=node('a',source.title);link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';row.append(link);sources.append(row);}
}
export function clearLegalDocuments(){for(const id of ['legal-documents','legal-missing','legal-sources'])document.getElementById(id).replaceChildren();}
