// Public endpoint only. No key, password or token belongs in this file.
// Only the published preview connects to the isolated test project. Local preview stays offline.
export const config = Object.freeze({authEndpoint: location.origin === 'https://vetmaster.github.io'
  ? 'https://ifnjvdjhfhzfxyuorqvz.supabase.co/functions/v1/romway-auth' : ''});
