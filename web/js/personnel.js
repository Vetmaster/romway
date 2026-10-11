// No credentials or personnel data are persisted in browser storage.
export function createPersonnel({api,text,run,onSessionChange,onOpen}) {
  const $=id=>document.getElementById(id);
  let role=null,data=null,editing=null,visibleCount=20;
  function node(tag,value) {const el=document.createElement(tag);if(value!==undefined) el.textContent=value;return el;}
  function clearSecret() {$('temporary-credential').hidden=true;$('temporary-password').textContent='';$('temporary-number').textContent='';}
  function options(select,values) {select.replaceChildren(...values.map(([value,label])=>{const o=node('option',label);o.value=value;return o;}));}
  function locations(selected=[]) {
    $('personnel-locations').replaceChildren(...(data?.locations??[]).map(l=>{
      const label=node('label'),input=node('input');input.type='checkbox';input.value=l.id;input.checked=selected.includes(l.id);
      label.append(input,node('span',`${l.name} (${l.country})`));return label;
    }));
  }
  function resetForm() {
    editing=null;$('personnel-form').reset();$('personnel-form').hidden=true;$('personnel-new').setAttribute('aria-expanded','false');$('personnel-number').readOnly=false;
    options($('personnel-role'),(role==='super_admin'?['receiver','purchasing','admin','super_admin']:['receiver','purchasing']).map(r=>[r,text(r)]));
    locations();$('personnel-active-label').hidden=true;$('personnel-save').dataset.i18n='create_staff';$('personnel-save').textContent=text('create_staff');$('personnel-form-heading').dataset.i18n='add_staff';$('personnel-form-heading').textContent=text('add_staff');
  }
  function render() {
    $('personnel-new').setAttribute('aria-label',text('add_staff'));
    const visible=!!role;$('personnel-open').hidden=!visible;
    if(!visible) {$('personnel-section').hidden=true;return;}
    $('location-card').hidden=role!=='super_admin';
    $('location-toggle').setAttribute('aria-label',text('add_location'));
    if(!data)return;
    const normalize=value=>value.toLocaleLowerCase(document.documentElement.lang).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
    const query=normalize($('personnel-search').value.trim());
    const filtered=data.staff.filter(s=>normalize([s.display_name,s.employee_number,text(s.role),text(s.active?'active':'inactive'),...s.location_ids.map(id=>data.locations.find(l=>l.id===id)?.name??'')].join(' ')).includes(query)).sort((a,b)=>Number(b.active)-Number(a.active)||(Date.parse(b.created_at)||0)-(Date.parse(a.created_at)||0));
    $('personnel-list').replaceChildren(...filtered.slice(0,visibleCount).map(s=>{
      const row=node('li'),identity=node('div'),title=node('strong',s.display_name),number=node('small',s.employee_number),details=node('div');
      identity.className='staff-identity';identity.append(title,number);details.className='staff-details';
      const roleLabel=node('span',text(s.role)),status=node('span',text(s.active?'active':'inactive'));status.className='staff-status '+(s.active?'active':'inactive');
      const names=s.location_ids.map(id=>data.locations.find(l=>l.id===id)?.name??'').filter(Boolean);
      const button=node('button',text('edit_staff'));button.type='button';button.className='secondary';
      button.addEventListener('click',()=>{
        clearSecret();resetForm();editing=s;$('personnel-form').hidden=false;$('personnel-new').setAttribute('aria-expanded','true');$('personnel-form-heading').dataset.i18n='edit_staff';$('personnel-form-heading').textContent=text('edit_staff');$('personnel-number').value=s.employee_number;$('personnel-number').readOnly=true;
        $('personnel-name').value=s.display_name;$('personnel-role').value=s.role;locations(s.location_ids);
        $('personnel-active').checked=s.active;$('personnel-active-label').hidden=false;$('personnel-save').dataset.i18n='save_staff';$('personnel-save').textContent=text('save_staff');$('personnel-name').focus();
      });
      details.append(roleLabel,node('span',names.join(', ')||text('no_locations')),status);row.append(identity,details,button);return row;
    }));
    $('personnel-more').hidden=filtered.length<=visibleCount;
    if(!filtered.length)$('personnel-list').append(node('li',text('no_staff')));
  }
  function closeLocation(){ $('location-form').reset();$('location-form').hidden=true;$('location-toggle').setAttribute('aria-expanded','false'); }
  $('personnel-search').addEventListener('input',()=>{visibleCount=20;render();});
  $('personnel-more').addEventListener('click',()=>{visibleCount+=20;render();if($('personnel-more').hidden)$('personnel-search').focus();});
  $('location-toggle').addEventListener('click',()=>{const opening=$('location-form').hidden;closeLocation();if(opening){$('location-form').hidden=false;$('location-toggle').setAttribute('aria-expanded','true');$('location-code').focus();}});
  async function load() {visibleCount=20;data=await api.call('personnel-list');resetForm();render();}
  $('personnel-open').addEventListener('click',()=>run(async()=>{$('personnel-section').hidden=false;clearSecret();closeLocation();$('personnel-search').value='';await load();onOpen();}));
  $('personnel-new').addEventListener('click',()=>{const opening=$('personnel-form').hidden;clearSecret();resetForm();if(opening){$('personnel-form').hidden=false;$('personnel-new').setAttribute('aria-expanded','true');$('personnel-number').focus();}else $('personnel-new').focus();});
  $('personnel-cancel').addEventListener('click',()=>{clearSecret();resetForm();$('personnel-new').focus();});
  $('credential-close').addEventListener('click',clearSecret);
  $('personnel-form').addEventListener('submit',e=>{
    e.preventDefault();clearSecret();
    const payload={display_name:$('personnel-name').value.trim(),role:$('personnel-role').value,
      location_ids:[...$('personnel-locations').querySelectorAll('input:checked')].map(i=>i.value)};
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
    e.preventDefault();const payload={code:$('location-code').value.trim(),name:$('location-name').value.trim(),country:$('location-country').value};
    run(async()=>{clearSecret();await api.call('location-create',payload);closeLocation();await load();});
  });
  return {
    update(profile) {
      const next=['super_admin','admin'].includes(profile?.role)?profile.role:null;
      if(next!==role || !profile){role=next;visibleCount=20;$('personnel-more').hidden=true;data=null;editing=null;clearSecret();closeLocation();$('personnel-search').value='';$('personnel-list').replaceChildren();resetForm();$('personnel-section').hidden=true;}
      render();
    },
    translate(){const selected=$('personnel-role').value;options($('personnel-role'),(role==='super_admin'?['receiver','purchasing','admin','super_admin']:['receiver','purchasing']).map(r=>[r,text(r)]));$('personnel-role').value=selected;render();},
    clear:clearSecret,
  };
}
