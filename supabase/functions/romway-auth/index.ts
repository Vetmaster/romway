import {createBackend} from './backend.js';
import {createHandler} from './handler.js';
const local = Deno.env.get('ROMWAY_LOCAL_DEV') === 'true';
const backend = createBackend({
  local,
  url:Deno.env.get('SUPABASE_URL')!,
  serviceKey:Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  publicKey:Deno.env.get('SUPABASE_ANON_KEY')!,
});
Deno.serve(createHandler({backend, appOrigin:Deno.env.get('APP_ORIGIN')!, local, cookieMode:Deno.env.get('ROMWAY_COOKIE_MODE') ?? 'strict'}));
