import {sortStaff} from './staff-sort.js?v=70f9d7797eed';
// No credentials or personnel data are persisted in browser storage.
export function createPersonnel({api,text,run,onSessionChange,onOpen,isReadonly=()=>false}) {
  const $=id=>document.getElementById(id);
  let role=null,data=null,editing=null,visibleCount=10,recordType=null,recordId=null,sortKey='active',sortDirection='descending';
  function node(tag,value) {const el=document.createElement(tag);if(value!==undefined) el.textContent=value;return el;}
  function clearSecret() {$('temporary-credential').hidden=true;$('temporary-password').textContent='';$('temporary-number').textContent='';}
  function options(select,values) {select.replaceChildren(...values.map(([value,label])=>{const o=node('option',label);o.value=value;return o;}));}
  function locations(selected=[]) {
    const select=node('select');select.id='personnel-location-select';select.setAttribute('aria-label',text('locations'));
    options(select,[['',text('choose_location')],...(data?.locations??[]).map(l=>[l.id,l.name])]);
    select.value=selected.length===1?selected[0]:'';select.required=$('personnel-role').value!=='super_admin';
    $('personnel-locations').replaceChildren(select);
    if(selected.length>1)$('personnel-locations').append(node('p',text('legacy_multiple_locations')));
  }
  function resetForm() {
    $('personnel-section').insertBefore($('personnel-new').closest('.personnel-add-card'),$('temporary-credential'));$('personnel-new').hidden=false;
    editing=null;$('personnel-form').reset();$('personnel-form').hidden=true;$('personnel-new').setAttribute('aria-expanded','false');$('personnel-number').readOnly=false;
    options($('personnel-role'),(role==='super_admin'?['receiver','purchasing','admin','super_admin']:['receiver','purchasing']).map(r=>[r,text(r)]));
    locations();$('personnel-active-label').hidden=true;$('personnel-save').dataset.i18n='create_staff';$('personnel-save').textContent=text('create_staff');$('personnel-form-heading').dataset.i18n='add_staff';$('personnel-form-heading').textContent=text('add_staff');
  }
  function render() {
    $('personnel-new').setAttribute('aria-label',text('add_staff'));
    const visible=!!role;$('personnel-open').hidden=!visible;
    $('personnel-new').disabled=isReadonly();$('location-toggle').disabled=isReadonly();
    if(!visible) {$('personnel-section').hidden=true;$('location-section').hidden=true;$('record-profile').hidden=true;return;}
    $('location-card').hidden=role!=='super_admin';
    $('location-toggle').setAttribute('aria-label',text('add_location'));
    if(!data)return;
    $('location-list').replaceChildren(...data.locations.map(l=>{const row=node('li');const title=node('a',l.name);title.className='profile-name';title.href='#location-profile/'+encodeURIComponent(l.id);row.append(title,node('small',l.code));return row;}));
    if(!data.locations.length)$('location-list').append(node('li',text('no_locations')));
    const normalize=value=>value.toLocaleLowerCase(document.documentElement.lang).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
    const query=normalize($('personnel-search').value.trim());
    const filtered=sortStaff(data.staff.filter(s=>normalize([s.display_name,s.employee_number,text(s.role),text(s.active?'active':'inactive'),...s.location_ids.map(id=>data.locations.find(l=>l.id===id)?.name??'')].join(' ')).includes(query)),sortKey,sortDirection,document.documentElement.lang);
    $('personnel-list').replaceChildren(...filtered.slice(0,visibleCount).map(s=>{
      const row=node('tr'),identity=node('td'),title=node('a',s.display_name),number=node('td',s.employee_number),details=node('td');
      title.className='profile-name';title.href='#staff-profile/'+encodeURIComponent(s.id);identity.className='staff-identity';identity.append(title);details.className='staff-details';
      const roleLabel=node('span',text(s.role)),status=node('span',text(s.active?'active':'inactive'));status.className='staff-status '+(s.active?'active':'inactive');
      const names=s.location_ids.map(id=>data.locations.find(l=>l.id===id)?.name??'').filter(Boolean);
      details.append(roleLabel);details.className='staff-extra-column';const assigned=node('td',names.join(', ')||text('no_locations'));assigned.className='staff-extra-column';const state=node('td');state.append(status);row.append(number,identity,details,assigned,state);return row;
    }));
    $('personnel-more').hidden=filtered.length<=visibleCount;
    if(!filtered.length){const row=node('tr'),cell=node('td',text('no_staff'));cell.colSpan=5;row.append(cell);$('personnel-list').append(row);}
    for(const th of document.querySelectorAll('[data-staff-sort]')){const active=th.dataset.staffSort===sortKey;th.setAttribute('aria-sort',active?sortDirection:'none');th.querySelector('.sort-arrow').textContent=active?(sortDirection==='ascending'?'↑':'↓'):'↕';}
    renderRecord();
  }
  function closeLocation(){ $('location-form').reset();$('location-form').hidden=true;$('location-toggle').setAttribute('aria-expanded','false'); }
  for(const th of document.querySelectorAll('[data-staff-sort]'))th.querySelector('button').addEventListener('click',()=>{const key=th.dataset.staffSort;sortDirection=key===sortKey?(sortDirection==='ascending'?'descending':'ascending'):(key==='active'?'descending':'ascending');sortKey=key;visibleCount=10;render();});
  $('personnel-search').addEventListener('input',()=>{visibleCount=10;render();});
  $('personnel-more').addEventListener('click',()=>{visibleCount+=10;render();if($('personnel-more').hidden)$('personnel-new').focus();});
  $('location-toggle').addEventListener('click',()=>{const opening=$('location-form').hidden;closeLocation();if(opening){clearSecret();resetForm();$('location-form').hidden=false;$('location-toggle').setAttribute('aria-expanded','true');}});
  async function load() {visibleCount=10;data=await api.call('personnel-list');resetForm();render();}
  async function open(card='personnel',id=null){
    if(!role || (['location','location-profile'].includes(card)&&role!=='super_admin'))return;
    await run(async()=>{
      clearSecret();closeLocation();recordType=card;recordId=id;
      $('personnel-section').hidden=card!=='personnel';$('location-section').hidden=card!=='location';$('record-profile').hidden=!card.endsWith('-profile');
      $('personnel-search').value='';await load();onOpen(card,id);
    });
  }
  function renderRecord(){
    if(!recordType?.endsWith('-profile'))return;
    const isStaff=recordType==='staff-profile',item=(isStaff?data.staff:data.locations).find(r=>r.id===recordId);
    $('transport-activity').hidden=!isStaff||item?.role!=='receiver';
    $('record-edit').hidden=!isStaff||!item||Boolean(editing)||isReadonly();
    $('record-heading').textContent=text(isStaff?'staff_profile':'location_profile');$('record-details').replaceChildren();$('record-related').replaceChildren();
    $('record-message').textContent=item?'':text('not_available');$('record-back').href=isStaff?'#personnel':'#location';
    $('record-related-heading').textContent=text(isStaff?'locations':'staff_list');
    $('record-related-heading').hidden=isStaff;$('record-related').hidden=isStaff;
    if(!item)return;
    const fields=isStaff?[[text('display_name'),item.display_name],[text('employee'),item.employee_number],[text('role'),text(item.role)]]:[[text('location_name'),item.name],[text('location_code'),item.code]];
    for(const [label,value] of fields)$('record-details').append(node('dt',label),node('dd',value));
    const related=isStaff?data.locations.filter(l=>item.location_ids.includes(l.id)):data.staff.filter(r=>r.location_ids.includes(item.id));
    const relatedList=isStaff?node('ul'):$('record-related');
    if(isStaff){relatedList.className='profile-location-values';const value=node('dd');value.append(relatedList);const state=node('dd'),badge=node('span',text(item.active?'active':'inactive'));badge.className='staff-status '+(item.active?'active':'inactive');state.append(badge);$('record-details').append(node('dt',text('locations')),value,node('dt',text('status_label')),state);}
    for(const r of related){const row=node('li'),link=node('a',isStaff?r.name:r.display_name);link.className='profile-name';link.href=(isStaff?'#location-profile/':'#staff-profile/')+encodeURIComponent(r.id);if(isStaff&&role!=='super_admin')row.append(node('span',r.name));else row.append(link);relatedList.append(row);}
    if(!related.length)relatedList.append(node('li',text(isStaff?'no_locations':'no_staff')));
  }

  $('record-edit').addEventListener('click',()=>{
    if(recordType!=='staff-profile'||!role||isReadonly())return;
    const staff=data?.staff.find(s=>s.id===recordId);if(!staff)return;
    clearSecret();closeLocation();resetForm();editing=staff;
    $('record-edit-host').append($('personnel-new').closest('.personnel-add-card'));
    $('personnel-new').hidden=true;$('personnel-form').hidden=false;
    $('personnel-form-heading').dataset.i18n='edit_staff';$('personnel-form-heading').textContent=text('edit_staff');
    $('personnel-number').value=staff.employee_number;$('personnel-number').readOnly=true;
    $('personnel-name').value=staff.display_name;$('personnel-role').value=staff.role;locations(staff.location_ids);
    $('personnel-active').checked=staff.active;$('personnel-active-label').hidden=false;
    $('personnel-save').dataset.i18n='save_staff';$('personnel-save').textContent=text('save_staff');renderRecord();
    $('personnel-form-heading').tabIndex=-1;$('personnel-form-heading').focus();
  });
  $('personnel-open').addEventListener('click',()=>open());
  $('personnel-new').addEventListener('click',()=>{const opening=$('personnel-form').hidden;clearSecret();resetForm();if(opening){closeLocation();$('personnel-form').hidden=false;$('personnel-new').setAttribute('aria-expanded','true');}else $('personnel-new').focus();});
  $('personnel-cancel').addEventListener('click',()=>{clearSecret();resetForm();renderRecord();$(recordType==='staff-profile'?'record-edit':'personnel-new').focus();});
  $('personnel-role').addEventListener('change',()=>{$('personnel-location-select').required=$('personnel-role').value!=='super_admin';});
  $('credential-close').addEventListener('click',clearSecret);
  $('personnel-form').addEventListener('submit',e=>{
    e.preventDefault();if(isReadonly())return;clearSecret();
    const payload={display_name:$('personnel-name').value.trim(),role:$('personnel-role').value,
      location_ids:$('personnel-location-select').value?[$('personnel-location-select').value]:[]};
    const target=editing;
    if(target){payload.id=target.id;payload.active=$('personnel-active').checked;}else payload.employee_number=$('personnel-number').value.trim();
    run(async()=>{
      const result=await api.call(target?'personnel-update':'personnel-create',payload);
      if(target?.employee_number===onSessionChange.employeeNumber()) {throw new Error('session_expired');}
      if(result.temporary_password){$('temporary-password').textContent=result.temporary_password;$('temporary-number').textContent=result.employee_number;$('temporary-credential').hidden=false;}
      await load();
    });
  });
  $('location-form').addEventListener('submit',e=>{
    e.preventDefault();if(isReadonly())return;const payload={name:$('location-name').value.trim()};
    run(async()=>{clearSecret();await api.call('location-create',payload);closeLocation();await load();});
  });
  return {
    open,
    update(profile) {
      const next=['super_admin','admin'].includes(profile?.role)?profile.role:null;
      if(next!==role || !profile){role=next;visibleCount=10;$('personnel-more').hidden=true;data=null;editing=null;clearSecret();closeLocation();$('personnel-search').value='';$('personnel-list').replaceChildren();resetForm();$('personnel-section').hidden=true;$('location-section').hidden=true;$('location-list').replaceChildren();$('record-profile').hidden=true;$('record-details').replaceChildren();$('record-related').replaceChildren();recordType=null;recordId=null;$('transport-activity').hidden=true;}
      render();
    },
    translate(){const selected=$('personnel-role').value;options($('personnel-role'),(role==='super_admin'?['receiver','purchasing','admin','super_admin']:['receiver','purchasing']).map(r=>[r,text(r)]));$('personnel-role').value=selected;render();},
    clear:clearSecret,
  };
}
