export function createProducts({api,text,run,isReadonly,isBusy}){
 const $=id=>document.getElementById(id);let data=null,requestId=crypto.randomUUID(),visible=10;
 const node=(tag,value)=>{const el=document.createElement(tag);if(value!==undefined)el.textContent=value;return el;};
 function reset(){ $('product-form').reset();requestId=crypto.randomUUID(); }
 function close(){ $('product-dialog').close();reset(); }
 function render(){
  $('product-readonly').hidden=!isReadonly();$('product-new').hidden=isReadonly();$('product-search').disabled=!data;
  if(!data)return;
  $('product-new').disabled=isBusy()||!data.locations.length;
  $('product-no-location').hidden=Boolean(data.locations.length)||isReadonly();
  const old=$('product-location').value;$('product-location').replaceChildren(new Option(text('product_choose'),''),...data.locations.map(l=>new Option(l.name,l.id)));if(data.locations.some(l=>l.id===old))$('product-location').value=old;else if(data.locations.length===1)$('product-location').value=data.locations[0].id;
  const unit=$('product-unit').value;$('product-unit').replaceChildren(new Option(text('product_choose'),''),...['piece','set','litre','kg','metre'].map(u=>new Option(text('unit_'+u),u)));$('product-unit').value=unit;
  const normal=s=>s.toLocaleLowerCase(document.documentElement.lang).normalize('NFD').replace(/\p{M}/gu,'');const raw=$('product-search').value.trim(),query=normal(raw);
  const rows=data.products.filter(p=>normal(p.name+' '+text('unit_'+p.unit)).includes(query)||p.part_code.toUpperCase().includes(raw.toUpperCase()));
  $('product-list').replaceChildren(...rows.slice(0,visible).map(p=>{const row=node('tr');row.append(node('td',p.part_code),node('td',p.name),node('td',text('unit_'+p.unit)));return row;}));
  if(!rows.length){const row=node('tr'),cell=node('td',text('product_empty'));cell.colSpan=3;row.append(cell);$('product-list').append(row);}
  $('product-more').hidden=rows.length<=visible;
 }
 async function load(){data=await api.call('product-list');render();}
 $('product-search').addEventListener('input',()=>{visible=10;render();});
 $('product-more').addEventListener('click',()=>{visible+=10;render();});
 $('product-new').addEventListener('click',()=>{if(isReadonly()||isBusy()||!data?.locations.length)return;reset();render();$('product-dialog-message').textContent='';$('product-dialog').showModal();$('product-form-heading').focus({preventScroll:true});});
 function cancel(){if(isBusy())return;close();$('product-new').focus({preventScroll:true});}
 $('product-close').addEventListener('click',cancel);$('product-cancel').addEventListener('click',cancel);
 $('product-dialog').addEventListener('cancel',e=>{e.preventDefault();cancel();});
 $('product-dialog').addEventListener('click',e=>{if(e.target!==$('product-dialog'))return;const b=e.target.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)cancel();});
 $('product-form').addEventListener('submit',e=>{e.preventDefault();if(isReadonly()||isBusy())return;run(async()=>{
  await api.call('product-create',{request_id:requestId,location_id:$('product-location').value,name:$('product-name').value,part_code:$('product-code').value,unit:$('product-unit').value});
  close();$('product-saved').textContent=text('product_saved');visible=10;$('product-search').value='';await load();
 });});
 return {translate:render,async open(){data=null;visible=10;close();$('product-saved').textContent='';$('product-search').value='';$('product-list').replaceChildren();render();if(!isReadonly())await run(load);},clear(){data=null;close();$('product-list').replaceChildren();$('product-location').replaceChildren();$('product-saved').textContent='';}};
}
