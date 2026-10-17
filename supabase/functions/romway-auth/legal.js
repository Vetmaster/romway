import tr from './legal-tr.js';
import ro from './legal-ro.js';
import {AuthError} from './security.js';
export function legalDocuments(staff,language='tr'){
 if(staff?.role!=='super_admin'||staff.password_change_required)throw new AuthError('permission_denied',403);
 if(!['tr','ro'].includes(language))throw new AuthError('invalid_request',400);
 return language==='ro'?ro:tr;
}
