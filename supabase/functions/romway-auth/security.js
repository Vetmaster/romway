export class AuthError extends Error {
  constructor(code, status = 400) { super(code); this.code = code; this.status = status; }
}
export function employeeNumber(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,40}$/.test(value.trim())) throw new AuthError('invalid_credentials', 401);
  return value.trim().toUpperCase();
}
export function password(value) {
  if (typeof value !== 'string' || value.length < 12 || value.length > 128) throw new AuthError('password_rules');
  return value;
}
export const randomSecret = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
export async function hash(value) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), b => b.toString(16).padStart(2, '0')).join('');
}
export function cookieValue(header, name) {
  const values = (header || '').split(';').map(x => x.trim()).filter(x => x.startsWith(name + '='));
  if (values.length !== 1) return null;
  const value = values[0].slice(name.length + 1);
  return /^[0-9a-f]{64}$/.test(value) ? value : null;
}
export function safeProfile(staff) {
  return {employee_number: staff.employee_number, display_name: staff.display_name, role: staff.role};
}
export async function readJson(request) {
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') throw new AuthError('invalid_request', 415);
  const reader = request.body?.getReader();
  if (!reader) throw new AuthError('invalid_request');
  const chunks = []; let length = 0;
  try {
    while (true) {
      const {done, value} = await reader.read(); if (done) break;
      length += value.length;
      if (length > 8192) { await reader.cancel(); throw new AuthError('invalid_request', 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const body = JSON.parse(new TextDecoder().decode(bytes));
    if (!body || Array.isArray(body) || typeof body !== 'object') throw new Error();
    return body;
  } catch (e) { if (e instanceof AuthError) throw e; throw new AuthError('invalid_request'); }
}
