// No credentials or personnel data are persisted in browser storage.
export function createPersonnel({api,text,run,onSessionChange}) {
  const $=id=>document.getElementById(id);
  let role=null,data=null,editing=null;
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
    editing=null;$('personnel-form').reset();$('personnel-number').readOnly=false;
    options($('personnel-role'),(role==='super_admin'?['receiver','purchasing','admin','super_admin']:['receiver','purchasing']).map(r=>[r,text(r)]));
    locations();$('personnel-active-label').hidden=true;$('personnel-save').dataset.i18n='add_staff';$('personnel-save').textContent=text('add_staff');
  }
  function render() {
    const visible=!!role;$('personnel-open').hidden=!visible;
    if(!visible) {$('personnel-section').hidden=true;return;}
    $('location-form').hidden=role!=='super_admin';
    if(!data)return;
    $('personnel-list').replaceChildren(...data.staff.map(s=>{
      const card=node('article'),title=node('h3',s.display_name),description=node('p',`${s.employee_number} · ${text(s.role)} · ${text(s.active?'active':'inactive')}`);
      const names=s.location_ids.map(id=>data.locations.find(l=>l.id===id)?.name??'').filter(Boolean);
      const button=node('button',text('edit_staff'));button.type='button';button.className='secondary';
      button.addEventListener('click',()=>{
        clearSecret();editing=s;$('personnel-form').reset();$('personnel-number').value=s.employee_number;$('personnel-number').readOnly=true;
        $('personnel-name').value=s.display_name;$('personnel-role').value=s.role;locations(s.location_ids);
        $('personnel-active').checked=s.active;$('personnel-active-label').hidden=false;$('personnel-save').dataset.i18n='save_staff';$('personnel-save').textContent=text('save_staff');$('personnel-name').focus();
      });
      card.append(title,description,node('p',names.join(', ')||text('no_locations')),button);return card;
    }));
    if(!data.staff.length)$('personnel-list').append(node('p',text('no_staff')));
  }
  async function load() {data=await api.call('personnel-list');resetForm();render();}
  $('personnel-open').addEventListener('click',()=>run(async()=>{$('personnel-section').hidden=false;clearSecret();await load();}));
  $('personnel-new').addEventListener('click',()=>{clearSecret();resetForm();});
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
    run(async()=>{clearSecret();await api.call('location-create',payload);$('location-form').reset();await load();});
  });
  return {
    update(profile) {
      const next=['super_admin','admin'].includes(profile?.role)?profile.role:null;
      if(next!==role || !profile){role=next;data=null;editing=null;clearSecret();$('personnel-list').replaceChildren();$('personnel-form').reset();$('personnel-section').hidden=true;}
      render();
    },
    translate(){const selected=$('personnel-role').value;options($('personnel-role'),(role==='super_admin'?['receiver','purchasing','admin','super_admin']:['receiver','purchasing']).map(r=>[r,text(r)]));$('personnel-role').value=selected;render();},
    clear:clearSecret,
  };
}
