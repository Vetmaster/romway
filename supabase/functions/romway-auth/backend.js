import {AuthError} from './security.js';
// Native fetch keeps the production function dependency-free. Auth credentials stay on the server.
export function createBackend({url, serviceKey, publicKey, local = false}, fetcher = fetch) {
  const base = new URL(url);
  if (!serviceKey || !publicKey || base.username || base.password || base.pathname !== '/' ||
      (base.protocol !== 'https:' && !((['localhost','127.0.0.1'].includes(base.hostname) || (local && base.hostname === 'kong')) && base.protocol === 'http:'))) throw new Error('Invalid server configuration');
  async function request(path, body, key = serviceKey, bearer = key) {
    const response = await fetcher(new URL(path, base), {
      method: 'POST', redirect:'error', headers: {'Content-Type':'application/json', apikey:key, Authorization:`Bearer ${bearer}`},
      body:JSON.stringify(body), signal:AbortSignal.timeout(12000),
    });
    if (!response.ok) {
      if (path.startsWith('/auth/v1/token') && [400,401,422].includes(response.status)) throw new AuthError('invalid_credentials',401);
      if (response.status === 429) throw new AuthError('rate_limited',429);
      throw new AuthError('service_unavailable',503);
    }
    if (response.status === 204) return null;
    const text = await response.text(); return text ? JSON.parse(text) : null;
  }
  return {
    rpc: (name, body) => request('/rest/v1/rpc/' + name, body),
    async verifyPassword(email, password) {
      let result;
      try { result = await request('/auth/v1/token?grant_type=password', {email,password}, publicKey); }
      catch (error) {
        // Preserve outages and rate limits; only credential failures become invalid_credentials.
        if (error instanceof AuthError && error.code === 'invalid_credentials') return null;
        throw error;
      }
      if (!result?.access_token || !result.user?.id) throw new AuthError('service_unavailable', 503);
      await request('/auth/v1/logout?scope=local', {}, publicKey, result.access_token);
      return result.user.id;
    },
    async updatePassword(id, password) {
      const response = await fetcher(new URL('/auth/v1/admin/users/' + encodeURIComponent(id), base), {
        method:'PUT', redirect:'error', headers:{'Content-Type':'application/json', apikey:serviceKey, Authorization:`Bearer ${serviceKey}`},
        body:JSON.stringify({password}), signal:AbortSignal.timeout(12000),
      });
      if (!response.ok) throw new AuthError('recovery_required', 503);
    },
    async createUser(email, password) {
      return request('/auth/v1/admin/users', {email,password,email_confirm:true});
    },
  };
}
