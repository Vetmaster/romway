import {AuthError,hash} from './security.js';
export const productActions=['product-list','product-create'];
const uuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
export async function manageProducts({backend,staff,sessionHash,body}){
 if(staff.password_change_required||!['super_admin','admin','purchasing'].includes(staff.role))throw new AuthError('permission_denied',403);
 let data={};
 if(body.action==='product-create'){
  if(!uuid(body.request_id)||!uuid(body.location_id)||typeof body.name!=='string'||!body.name.trim()||body.name.trim().length>100||typeof body.part_code!=='string'||!/^\s*[A-Za-z0-9][A-Za-z0-9 ._\/-]*\s*$/.test(body.part_code)||body.part_code.trim().length>80||!['piece','set','litre','kg','metre'].includes(body.unit))throw new AuthError('invalid_request',400);
  if(!await backend.rpc('romway_consume_attempt',{p_bucket:await hash('product:'+staff.id),p_limit:30}))throw new AuthError('rate_limited',429);
  data={request_id:body.request_id,location_id:body.location_id,name:body.name.trim(),part_code:body.part_code.trim().replace(/ +/g,' ').toUpperCase(),unit:body.unit};
 }
 const result=await backend.rpc('romway_products',{p_hash:sessionHash,p_action:body.action==='product-list'?'list':'create',p_data:data});
 if(!result||typeof result!=='object')throw new AuthError('service_unavailable',503);
 if(result.error)throw new AuthError(result.error==='conflict'?'product_conflict':result.error,result.error==='session_expired'?401:result.error==='permission_denied'?403:['conflict','product_code_exists'].includes(result.error)?409:400);
 return result;
}
