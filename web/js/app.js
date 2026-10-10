import {config} from './config.js';
import {createApi} from './api.js';
import tr from './locales/tr.js';
import ro from './locales/ro.js';
const $ = id => document.getElementById(id);
const locales = {tr,ro}; let language = 'tr';
try { const saved = localStorage.getItem('romway.language'); if (locales[saved]) language = saved; } catch { /* Storage can be blocked. */ }
let api;
try { api = createApi(config.authEndpoint); } catch { api = createApi(''); }
let view = 'login', profile = null, message = '', isError = false, busy = false;
const text = key => locales[language][key] ?? locales[language].service_unavailable;
function render() {
  document.documentElement.lang = language; $('language').value = language;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = text(el.dataset.i18n); });
  for (const id of ['login','change','welcome']) $(id).hidden = id !== view;
  $('logout').hidden = !['change','welcome'].includes(view);
  $('retry').hidden = view !== 'checking' || busy;
  $('panel-title').textContent = view === 'welcome' ? `${text('welcome_title')}, ${profile?.display_name ?? ''}` : text(view === 'change' ? 'change_title' : 'login_title');
  $('subtitle').textContent = text(view === 'change' ? 'change_subtitle' : view === 'welcome' ? 'welcome_subtitle' : 'login_subtitle');
  if (profile) { $('staff-number').textContent = profile.employee_number; $('staff-role').textContent = text(profile.role); }
  else { $('staff-number').textContent = ''; $('staff-role').textContent = ''; }
  $('message').textContent = message ? text(message) : '';
  $('message').className = isError ? 'error' : '';
  document.querySelectorAll('form input,form button,#logout,#retry').forEach(el => { el.disabled = busy || !api.configured; });
  document.querySelector('.panel').setAttribute('aria-busy',String(busy));
}
function transition(next) { if (view !== next) { $('login').reset(); $('change').reset(); } view = next; }
function notify(key, error = false) { message = key; isError = error; render(); }
async function perform(fn) {
  if (busy) return;
  busy = true; notify('busy');
  try { await fn(); }
  catch (e) {
    if (e.message === 'session_expired' || e.message === 'recovery_required') { profile = null; transition('login'); }
    notify(e.message, true);
  } finally { busy = false; render(); }
}
async function restore() {
  if (!api.configured) { transition('login'); notify('not_configured'); return; }
  transition('checking');
  await perform(async () => {
    try {
      const result = await api.call('me');
      profile = result.profile ?? null; transition(result.password_change_required ? 'change' : 'welcome'); notify('');
    } catch (e) {
      if (e.message !== 'session_expired') throw e;
      profile = null; transition('login'); notify('');
    }
  });
}
$('language').addEventListener('change',e => {
  language = locales[e.target.value] ? e.target.value : 'tr';
  try { localStorage.setItem('romway.language',language); } catch { /* Optional preference. */ }
  render();
});
$('login').addEventListener('submit',event => {
  event.preventDefault();
  const employee_number = $('employee').value.trim(), password = $('password').value;
  $('password').value = '';
  perform(async () => {
    await api.call('login',{employee_number,password});
    // Confirm the cookie round trip before admitting the user to the welcome screen.
    const result = await api.call('me');
    profile = result.profile ?? null; transition(result.password_change_required ? 'change' : 'welcome'); notify('');
  });
});
$('change').addEventListener('submit',event => {
  event.preventDefault();
  const current_password = $('current').value, password = $('new').value, confirm = $('confirm').value;
  $('change').reset();
  if (password !== confirm) { notify('password_mismatch',true); return; }
  if (password === current_password) { notify('password_unchanged',true); return; }
  perform(async () => {
    await api.call('change-password',{current_password,password});
    profile = null; transition('login'); notify('changed');
  });
});
$('logout').addEventListener('click',() => perform(async () => {
  // Do not claim logout succeeded if the server did not revoke the session.
  await api.call('logout'); profile = null; transition('login'); notify('');
}));
$('retry').addEventListener('click',restore);
render(); restore();
