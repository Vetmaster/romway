// Draft headers only: no inventory movement or dispatch is performed here.
export function createShipments({api,text,run,isReadonly,onNavigate}){
 const $=id=>document.getElementById(id);let page='shipment',data=null,requestId=crypto.randomUUID();
 const node=(tag,value)=>{const e=document.createElement(tag);if(value!==undefined)e.textContent=value;return e;};
 function reset(){ $('shipment-form').reset();requestId=crypto.randomUUID();$('shipment-saved').textContent=''; }
 function select(id,rows,key){const el=$(id),old=el.value;el.replaceChildren(new Option(text('shipment_choose'),''),...rows.map(r=>new Option(r[key],r.id)));if(rows.some(r=>r.id===old))el.value=old;}
 function render(){
  $('shipment-form').hidden=page!=='shipment-start'||isReadonly()||!data;
  $('shipment-new').hidden=page==='shipment-start'||isReadonly();
  $('shipment-readonly').hidden=!isReadonly();
  if(!data)return;
  select('shipment-source',data.sources,'name');select('shipment-destination',data.destinations,'name');select('shipment-carrier',data.carriers,'display_name');
  if(data.carriers.length===1&&!$('shipment-carrier').value)$('shipment-carrier').value=data.carriers[0].id;
  $('shipment-list').replaceChildren(...data.shipments.map(s=>{
   const row=node('li'),title=node('strong',text('shipment_number')+' '+s.number),route=node('p',s.source_name+' → '+s.destination_name),carrier=node('p',text('shipment_carrier')+': '+s.carrier_name),stamp=node('small',new Intl.DateTimeFormat(document.documentElement.lang,{dateStyle:'medium',timeStyle:'short'}).format(new Date(s.created_at))),badge=node('span',text('shipment_draft'));badge.className='shipment-status';row.append(title,badge,route,carrier,stamp);if(s.notes)row.append(node('p',s.notes));return row;
  }));
  if(!data.shipments.length)$('shipment-list').append(node('li',text('shipment_empty')));
 }
 async function load(){data=await api.call('shipment-list');render();}
 $('shipment-new').addEventListener('click',()=>onNavigate('shipment-start'));
 $('shipment-reset').addEventListener('click',()=>{reset();render();});
 $('shipment-form').addEventListener('submit',e=>{e.preventDefault();if(isReadonly())return;run(async()=>{
  if($('shipment-source').value===$('shipment-destination').value)throw new Error('shipment_same_location');
  await api.call('shipment-create',{request_id:requestId,source_id:$('shipment-source').value,destination_id:$('shipment-destination').value,carrier_id:$('shipment-carrier').value,notes:$('shipment-notes').value});
  reset();$('shipment-saved').textContent=text('shipment_saved');await load();
 });});
 return {translate:render,async open(next){page=next;data=null;reset();$('shipment-list').replaceChildren();render();if(!isReadonly())await run(load);},clear(){data=null;reset();$('shipment-list').replaceChildren();for(const id of ['shipment-source','shipment-destination','shipment-carrier'])$(id).replaceChildren();}};
}
