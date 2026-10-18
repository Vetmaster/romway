import {manageProducts,productActions} from './products.js';
import {manageShipments,shipmentActions} from './shipments.js';
import {legalDocuments} from './legal.js';
import {managePersonnel,personnelActions} from './personnel.js';
import {AuthError, cookieValue, employeeNumber, hash, password, randomSecret, readJson, safeProfile} from './security.js';
export function createHandler({backend, appOrigin, local = false, cookieMode = 'strict'}) {
  const origin = new URL(appOrigin);
  if (origin.origin !== appOrigin || (local ? !(['localhost','127.0.0.1'].includes(origin.hostname) && origin.protocol === 'http:') : origin.protocol !== 'https:')) throw new Error('Invalid APP_ORIGIN');
  if (!['strict','partitioned'].includes(cookieMode) || (local && cookieMode !== 'strict')) throw new Error('Invalid cookie mode');
  const cookieName = local ? 'romway_dev_session' : '__Host-romway_session';
  // CHIPS keeps the opaque HttpOnly session partitioned by the top-level site.
  // All POSTs still require exact Origin and JSON; no unpartitioned None mode exists.
  const cookie = (value, age) => `${cookieName}=${value}; HttpOnly; Path=/; SameSite=${cookieMode === 'partitioned' ? 'None' : 'Strict'}; Max-Age=${age}${local ? '' : '; Secure'}${cookieMode === 'partitioned' ? '; Partitioned' : ''}`;
  return async function handle(req) {
    const headers = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin',
      'Access-Control-Allow-Origin':appOrigin,'Access-Control-Allow-Credentials':'true','X-Content-Type-Options':'nosniff'};
    const reply = (status, body) => new Response(JSON.stringify(body), {status, headers});
    // Require exact browser Origin even for read-only POSTs; no wildcard or null-origin bypass.
    if (req.headers.get('origin') !== appOrigin) return reply(403, {error:'origin_denied'});
    if (req.method === 'OPTIONS') {
      if (req.headers.get('access-control-request-method') !== 'POST') return reply(405,{error:'invalid_request'});
      return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'POST','Access-Control-Allow-Headers':'content-type'}});
    }
    if (req.method !== 'POST') return reply(405,{error:'invalid_request'});
    try {
      const body = await readJson(req);
      if (!['login','me','change-password','logout','legal-documents',...personnelActions,...shipmentActions,...productActions].includes(body.action)) throw new AuthError('invalid_request');
      // Persistent global and account limits: caller-controlled IP headers are not trusted.
      if (body.action === 'login' || body.action === 'change-password') {
        if (!await backend.rpc('romway_consume_attempt',{p_bucket:await hash('auth-global'),p_limit:300})) throw new AuthError('rate_limited',429);
      }
      if (body.action === 'login') {
        const number = employeeNumber(body.employee_number);
        if (typeof body.password !== 'string' || !body.password || body.password.length > 128) throw new AuthError('invalid_credentials',401);
        if (!await backend.rpc('romway_consume_attempt',{p_bucket:await hash('login:'+number),p_limit:10})) throw new AuthError('rate_limited',429);
        const staff = await backend.rpc('romway_staff_for_login',{p_employee_number:number});
        const id = await backend.verifyPassword(staff?.auth_email ?? 'staff-00000000-0000-0000-0000-000000000000@identity.invalid',body.password);
        if (!staff || id !== staff.id || !staff.active || staff.password_operation ||
          (staff.password_change_required && !(Date.parse(staff.temporary_password_expires_at) > Date.now()))) throw new AuthError('invalid_credentials',401);
        const secret = randomSecret();
        const opened = await backend.rpc('romway_open_session',{p_hash:await hash(secret),p_staff_id:staff.id,p_version:staff.session_version});
        if (!opened) throw new AuthError('invalid_credentials',401);
        headers['Set-Cookie'] = cookie(secret,28800);
        return reply(200, {password_change_required:staff.password_change_required});
      }
      const secret = cookieValue(req.headers.get('cookie'),cookieName);
      const sessionHash = secret ? await hash(secret) : null;
      if (body.action === 'logout') {
        if (sessionHash) await backend.rpc('romway_revoke_session',{p_hash:sessionHash});
        headers['Set-Cookie'] = cookie('',0);
        return reply(200,{ok:true});
      }
      const staff = sessionHash ? await backend.rpc('romway_session',{p_hash:sessionHash}) : null;
      if (!staff) { headers['Set-Cookie'] = cookie('',0); throw new AuthError('session_expired',401); }
      if (body.action === 'me') {
        if (staff.password_change_required) return reply(200,{password_change_required:true});
        return reply(200,{password_change_required:false,profile:safeProfile(staff)});
      }
      if(body.action==='legal-documents')return reply(200,legalDocuments(staff,body.language??'tr'));
      if(productActions.includes(body.action))return reply(200,await manageProducts({backend,staff,sessionHash,body}));
      if(shipmentActions.includes(body.action))return reply(200,await manageShipments({backend,staff,sessionHash,body}));
      if (personnelActions.includes(body.action)) return reply(200,await managePersonnel({backend,staff,sessionHash,body}));
      password(body.password);
      if (typeof body.current_password !== 'string' || body.current_password.length > 128 || !body.current_password) throw new AuthError('invalid_credentials',401);
      if (body.password === body.current_password) throw new AuthError('password_unchanged');
      if (!await backend.rpc('romway_consume_attempt',{p_bucket:await hash('change:'+staff.id),p_limit:10})) throw new AuthError('rate_limited',429);
      if (await backend.verifyPassword(staff.auth_email,body.current_password) !== staff.id) throw new AuthError('invalid_credentials',401);
      const operation = crypto.randomUUID();
      const locked = await backend.rpc('romway_begin_password',{p_hash:sessionHash,p_operation:operation});
      if (locked !== staff.id) throw new AuthError('session_expired',401);
      headers['Set-Cookie'] = cookie('',0);
      // All app sessions were revoked before touching Auth. A partial failure leaves a persistent lock.
      try {
        await backend.updatePassword(staff.id,body.password);
        if (!await backend.rpc('romway_finish_password',{p_staff_id:staff.id,p_operation:operation})) throw new Error();
      } catch { throw new AuthError('recovery_required',503); }
      return reply(200,{ok:true,reauthenticate:true});
    } catch (error) {
      return reply(error instanceof AuthError ? error.status : 503, {error:error instanceof AuthError ? error.code : 'service_unavailable'});
    }
  };
}
