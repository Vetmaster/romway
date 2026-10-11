import {createPersonnel} from './personnel.js?v=6372c281ccf4';
import {config} from './config.js?v=ec17bf82ae7d';
import {createApi} from './api.js?v=bd01bbf4eebb';
import tr from './locales/tr.js?v=0856b01e762e';
import ro from './locales/ro.js?v=cfe0170e933a';
const $ = id => document.getElementById(id);
const locales = {tr,ro}; let language = 'tr';
try { const saved = localStorage.getItem('romway.language'); if (locales[saved]) language = saved; } catch { /* Storage can be blocked. */ }
let api;
try { api = createApi(config.authEndpoint); } catch { api = createApi(''); }
let view = 'login', profile = null, message = '', isError = false, busy = false, workspace = false, submenuExpanded=false, inventoryExpanded=false;
const text = key => locales[language][key] ?? locales[language].service_unavailable;
let personnel;
const desktopMenu=window.matchMedia('(min-width:821px)');
function render() {
  if(view!=='welcome') workspace=false;
  personnel?.update(view==='welcome'?profile:null);
  document.documentElement.lang = language; $('language').value = language;
  $('menu-toggle').setAttribute('aria-label',text('menu_label'));
  $('drawer-title').setAttribute('aria-label',text('menu_label'));
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = text(el.dataset.i18n); });
  for (const id of ['login','change','welcome']) $(id).hidden = id !== view;
  const signedIn=view==='welcome';
  $('auth-panel').hidden=signedIn;document.querySelector('.intro').hidden=signedIn;
  $('welcome').hidden=!signedIn||workspace;
  document.body.classList.toggle('app-shell',signedIn);
  const pageLabels={personnel:'staff_list',location:'location_list','staff-profile':'staff_profile','location-profile':'location_profile',stock:'stock_list',shipment:'shipment_management'};
  $('page-title').textContent=signedIn?text(pageLabels[workspace]??'dashboard_title'):'';
  $('pending-section').hidden=!signedIn||!['stock','shipment'].includes(workspace);
  if(['stock','shipment'].includes(workspace))$('pending-heading').textContent=text(workspace==='stock'?'stock_list':'shipment_management');
  $('bottom-tabs').hidden=!signedIn;
  $('tab-personnel').hidden=!['admin','super_admin'].includes(profile?.role);
  for(const tab of ['dashboard','personnel','stock','shipment'])$('tab-'+tab).setAttribute('aria-current',(tab==='dashboard'?!workspace:tab==='stock'?['location','location-profile','stock'].includes(workspace):tab==='personnel'?['personnel','staff-profile'].includes(workspace):workspace===tab)?'page':'false');
  $('menu-toggle').hidden=!signedIn||desktopMenu.matches;
  if(signedIn&&desktopMenu.matches&&!$('navigation-drawer').open) $('navigation-drawer').show();
  if(!signedIn) closeMenu(false);
  if(!signedIn)inventoryExpanded=false;
  $('nav-inventory-submenu').hidden=!inventoryExpanded;
  $('nav-inventory').setAttribute('aria-expanded',String(inventoryExpanded));
  $('nav-personnel').hidden=!signedIn||!['super_admin','admin'].includes(profile?.role);
  if($('nav-personnel').hidden)submenuExpanded=false;
  $('nav-personnel-submenu').hidden=$('nav-personnel').hidden||!submenuExpanded;
  $('nav-personnel').setAttribute('aria-expanded',String(submenuExpanded));
  $('nav-add-location').hidden=!signedIn||profile?.role!=='super_admin';
  $('nav-home').setAttribute('aria-current',workspace?'false':'page');
  $('nav-personnel').setAttribute('aria-current',workspace?'page':'false');
  $('nav-add-personnel').setAttribute('aria-current',workspace==='personnel'?'page':'false');
  $('nav-add-location').setAttribute('aria-current',workspace==='location'?'page':'false');
  $('dashboard-greeting').textContent=profile?`${text('welcome_title')}, ${profile.display_name}`:'';
  $('drawer-name').textContent=profile?.display_name??'';
  $('drawer-role').textContent=profile?text(profile.role):'';
  document.querySelector('main').classList.toggle('workspace',signedIn);
  const logoutHost=view==='change'?document.querySelector('.header-actions'):$('drawer-profile');
  if($('logout').parentElement!==logoutHost)logoutHost.append($('logout'));
  $('logout').hidden = !['change','welcome'].includes(view);
  $('retry').hidden = view !== 'checking' || busy;
  $('panel-title').textContent = view === 'welcome' ? `${text('welcome_title')}, ${profile?.display_name ?? ''}` : text(view === 'change' ? 'change_title' : 'login_title');
  $('subtitle').textContent = text(view === 'change' ? 'change_subtitle' : view === 'welcome' ? 'welcome_subtitle' : 'login_subtitle');
  if (profile) { $('staff-number').textContent = profile.employee_number; $('staff-role').textContent = text(profile.role); }
  else { $('staff-number').textContent = ''; $('staff-role').textContent = ''; }
  for(const [id,visible] of [['message',!signedIn],['dashboard-message',signedIn&&!workspace],['personnel-message',workspace==='personnel'],['location-message',workspace==='location']]) {$(id).textContent=visible&&message?text(message):'';$(id).className=isError?'error':'';}
  document.querySelectorAll('form input,form select,form button,#logout,#retry,#personnel-open,#nav-home,#nav-brand,#nav-personnel,#nav-add-personnel,#nav-add-location,#personnel-new,#location-toggle,#personnel-search,#personnel-more,#personnel-list button,#nav-stock-list,#nav-shipment,#bottom-tabs button').forEach(el => { el.disabled = busy || !api.configured; });
  document.querySelectorAll('.panel').forEach(el=>el.setAttribute('aria-busy',String(busy)));
}
function transition(next) { if (view !== next) { $('login').reset(); $('change').reset(); } view = next; }
function notify(key, error = false) { message = key; isError = error; render(); }
async function perform(fn) {
  if (busy) return;
  busy = true; notify('busy');
  try { await fn(); if(message==='busy') notify(''); }
  catch (e) {
    if (e.message === 'session_expired' || e.message === 'recovery_required') { profile = null; transition('login'); }
    notify(e.message, true);
  } finally { busy = false; render(); }
}
function rememberPage(page){history.replaceState(null,'','#'+page);}
async function restorePage(){
  if(view!=='welcome'||busy)return;
  const [page,id]=location.hash.slice(1).split('/');
  if(page==='personnel'&&['admin','super_admin'].includes(profile?.role))await personnel.open('personnel');
  else if(page==='location'&&profile?.role==='super_admin')await personnel.open('location');
  else if(page==='staff-profile'&&['admin','super_admin'].includes(profile?.role))await personnel.open(page,id);
  else if(page==='location-profile'&&profile?.role==='super_admin')await personnel.open(page,id);
  else if(['stock','shipment'].includes(page))showPending(page);
  else showDashboard();
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
  await restorePage();
}
$('language').addEventListener('change',e => {
  language = locales[e.target.value] ? e.target.value : 'tr';
  try { localStorage.setItem('romway.language',language); } catch { /* Optional preference. */ }
  personnel.translate(); render();
});
$('login').addEventListener('submit',event => {
  event.preventDefault();
  const employee_number = $('employee').value.trim(), password = $('password').value;
  $('password').value = '';
  perform(async () => {
    await api.call('login',{employee_number,password});
    // Confirm the cookie round trip before admitting the user to the welcome screen.
    let result;
    try { result = await api.call('me'); }
    catch (error) {
      if (error.message === 'session_expired') throw new Error('session_unavailable');
      throw error;
    }
    profile = result.profile ?? null; transition(result.password_change_required ? 'change' : 'welcome'); notify('');
  }).then(restorePage);
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
  await api.call('logout');rememberPage('dashboard'); profile = null; transition('login'); notify('');
}));
function closeMenu(restoreFocus=true) {
  if($('navigation-drawer').open) $('navigation-drawer').close();
  $('menu-toggle').setAttribute('aria-expanded','false');
  if(restoreFocus&&!$('menu-toggle').hidden) $('menu-toggle').focus();
}
function showDashboard() {
  rememberPage('dashboard');closeMenu(false);workspace=false;message='';personnel.clear();$('personnel-section').hidden=true;$('location-section').hidden=true;$('record-profile').hidden=true;render();$('dashboard-heading').focus();
}
$('menu-toggle').addEventListener('click',()=>{$('navigation-drawer').showModal();$('menu-toggle').setAttribute('aria-expanded','true');$('nav-brand').focus();});
$('navigation-drawer').addEventListener('cancel',event=>{event.preventDefault();closeMenu();});
$('navigation-drawer').addEventListener('close',()=>{$('menu-toggle').setAttribute('aria-expanded','false');});
$('navigation-drawer').addEventListener('click',event=>{if(event.target===$('navigation-drawer')){const box=event.target.getBoundingClientRect();if(event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)closeMenu();}});
$('nav-home').addEventListener('click',showDashboard);
$('nav-brand').addEventListener('click',showDashboard);
$('nav-inventory').addEventListener('click',()=>{inventoryExpanded=!inventoryExpanded;render();});
$('nav-personnel').addEventListener('click',()=>{submenuExpanded=!submenuExpanded;render();});
$('nav-add-personnel').addEventListener('click',()=>{closeMenu(false);personnel.open('personnel');});
$('nav-add-location').addEventListener('click',()=>{closeMenu(false);personnel.open('location');});
desktopMenu.addEventListener('change',()=>{closeMenu(false);render();});
$('retry').addEventListener('click',restore);
function showPending(page){closeMenu(false);personnel.clear();$('personnel-section').hidden=true;$('location-section').hidden=true;$('record-profile').hidden=true;workspace=page;rememberPage(page);message='';$('pending-heading').textContent=text(page==='stock'?'stock_list':'shipment_management');render();$('pending-heading').focus();}
$('nav-stock-list').addEventListener('click',()=>showPending('stock'));
$('nav-shipment').addEventListener('click',()=>showPending('shipment'));
$('tab-dashboard').addEventListener('click',showDashboard);
$('tab-personnel').addEventListener('click',()=>{closeMenu(false);personnel.open('personnel');});
$('tab-stock').addEventListener('click',()=>showPending('stock'));
$('tab-shipment').addEventListener('click',()=>showPending('shipment'));
personnel=createPersonnel({api,text,run:perform,onOpen:(page,id)=>{rememberPage(page+(id?'/'+encodeURIComponent(id):''));workspace=page;render();const heading=$(page.endsWith('-profile')?'record-heading':page==='location'?'location-page-heading':'personnel-heading');heading.setAttribute('tabindex','-1');heading.focus();},onSessionChange:{restore,employeeNumber:()=>profile?.employee_number}});

let resumePending=false,resuming=false;
async function resumeCurrentPage(){
  if(resuming||busy||view!=='welcome')return;
  resuming=true;
  try{
    await perform(async()=>{const result=await api.call('me');profile=result.profile??null;transition(result.password_change_required?'change':'welcome');});
    await restorePage();
  }finally{resuming=false;}
}
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden'){resumePending=true;personnel.clear();}
  else if(resumePending){resumePending=false;resumeCurrentPage();}
});
window.addEventListener('pageshow',event=>{if(event.persisted)resumeCurrentPage();});
window.addEventListener('hashchange',restorePage);
render(); restore();
