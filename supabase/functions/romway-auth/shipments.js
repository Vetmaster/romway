import {AuthError,hash} from './security.js';
export const shipmentActions=['shipment-list','shipment-create'];
const uuid=value=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export async function manageShipments({backend,staff,sessionHash,body}){
 if(staff.password_change_required||!['super_admin','admin','purchasing','receiver'].includes(staff.role))throw new AuthError('permission_denied',403);
 let data={};
 if(body.action==='shipment-create'){
  if(![body.request_id,body.source_id,body.destination_id,body.carrier_id].every(uuid)||body.source_id===body.destination_id||typeof body.notes!=='string'||body.notes.trim().length>1000)throw new AuthError('invalid_request',400);
  if(!await backend.rpc('romway_consume_attempt',{p_bucket:await hash('shipment:'+staff.id),p_limit:30}))throw new AuthError('rate_limited',429);
  data={request_id:body.request_id,source_id:body.source_id,destination_id:body.destination_id,carrier_id:body.carrier_id,notes:body.notes.trim()};
 }
 const result=await backend.rpc('romway_shipments',{p_hash:sessionHash,p_action:body.action==='shipment-list'?'list':'create',p_data:data});
 if(!result||typeof result!=='object')throw new AuthError('service_unavailable',503);
 if(result.error)throw new AuthError(result.error,result.error==='session_expired'?401:result.error==='permission_denied'?403:result.error==='conflict'?409:400);
 return result;
}
