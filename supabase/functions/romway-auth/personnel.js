import {AuthError,employeeNumber,hash,randomSecret} from './security.js';
export const personnelActions = ['personnel-list','personnel-create','personnel-update','location-create'];
function checked(result) {
  if (!result || typeof result !== 'object') throw new AuthError('service_unavailable',503);
  if (result.error) throw new AuthError(result.error,result.error==='session_expired'?401:result.error==='invalid_request'?400:['permission_denied','self_protected','last_super_admin'].includes(result.error)?403:409);
  return result;
}
export async function managePersonnel({backend,staff,sessionHash,body}) {
  if (staff.password_change_required || !['super_admin','admin'].includes(staff.role)) throw new AuthError('permission_denied',403);
  const rpc=(action,data={})=>backend.rpc('romway_personnel',{p_hash:sessionHash,p_action:action,p_data:data}).then(checked);
  if (body.action==='personnel-list') return rpc('list');
  if (!await backend.rpc('romway_consume_attempt',{p_bucket:await hash('personnel:'+staff.id),p_limit:30})) throw new AuthError('rate_limited',429);
  if (body.action==='location-create') {
    const id=crypto.randomUUID(),code='LOC_'+id.replaceAll('-','').toUpperCase();
    return rpc('location',{id,code,name:typeof body.name==='string'?body.name.trim():null,country:body.country??null});
  }
  if (!Array.isArray(body.location_ids)||body.location_ids.length>1) throw new AuthError('invalid_request',400);
  if (body.action==='personnel-update') return rpc('update',{id:body.id,display_name:body.display_name,role:body.role,location_ids:body.location_ids,active:body.active});
  const id=crypto.randomUUID(), number=employeeNumber(body.employee_number);
  await rpc('reserve',{id,employee_number:number,display_name:body.display_name,role:body.role,location_ids:body.location_ids});
  const temporaryPassword=randomSecret();
  // No retries or deletion: failed provisioning remains reserved and cannot sign in.
  // The client receives the temporary password once, only after scoped activation.
  try {
    const user=await backend.createUser(`staff-${id}@identity.invalid`,temporaryPassword,id);
    if (user?.id!==id) throw new Error('Auth ID mismatch');
    await rpc('complete',{id});
  } catch { throw new AuthError('provisioning_incomplete',503); }
  return {ok:true,employee_number:number,temporary_password:temporaryPassword,valid_hours:24};
}
