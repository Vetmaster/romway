-- Single affiliated location for new personnel changes. Existing rows and assignment history are preserved.
begin;
create or replace function public.romway_personnel(p_hash text,p_action text,p_data jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare actor romway_private.staff; target romway_private.staff; reservation romway_private.personnel_requests;
 actor_id uuid; target_id uuid; ids uuid[]; desired_role text; desired_name text; number text; desired_active boolean;
 result jsonb; item uuid;
begin
 perform pg_catalog.pg_advisory_xact_lock(729041);
 actor_id := (public.romway_session(p_hash)->>'id')::uuid;
 if actor_id is null then return jsonb_build_object('error','session_expired'); end if;
 select * into actor from romway_private.staff where id=actor_id for update;
 -- Password changes can revoke sessions while this operation waits for the row.
 if public.romway_session(p_hash) is null then return jsonb_build_object('error','session_expired'); end if;
 if actor.password_change_required or actor.role not in ('super_admin','admin') then
  return jsonb_build_object('error','permission_denied');
 end if;
 if p_action='list' then
  select jsonb_build_object('locations',coalesce((select jsonb_agg(jsonb_build_object('id',l.id,'code',l.code,'name',l.name,'country',l.country) order by l.code)
   from romway_private.locations l where actor.role='super_admin' or exists(select 1 from romway_private.staff_locations x where x.staff_id=actor.id and x.location_id=l.id and x.assigned)),'[]'::jsonb),
   'staff',coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'employee_number',s.employee_number,'display_name',s.display_name,'role',s.role,'active',s.active,'created_at',s.created_at,'password_change_required',s.password_change_required,
    'location_ids',coalesce((select jsonb_agg(x.location_id order by x.location_id) from romway_private.staff_locations x where x.staff_id=s.id and x.assigned),'[]'::jsonb)) order by s.active desc,s.created_at desc,s.id)
   from romway_private.staff s where actor.role='super_admin' or (s.role in ('purchasing','receiver')
    and exists(select 1 from romway_private.staff_locations x where x.staff_id=s.id and x.assigned)
    and not exists(select 1 from romway_private.staff_locations x where x.staff_id=s.id and x.assigned and not exists(select 1 from romway_private.staff_locations a where a.staff_id=actor.id and a.location_id=x.location_id and a.assigned)))),'[]'::jsonb)) into result;
  return result;
 end if;
 if p_action not in ('reserve','complete','update','location') then return jsonb_build_object('error','invalid_request'); end if;
 if p_action='location' then
  if actor.role<>'super_admin' then return jsonb_build_object('error','permission_denied'); end if;
  if p_data->>'code' !~ '^[A-Z0-9_-]{1,40}$' or length(coalesce(p_data->>'name','')) not between 1 and 100 or (p_data->>'country' is not null and p_data->>'country' not in ('TR','RO')) then return jsonb_build_object('error','invalid_request'); end if;
  target_id := (p_data->>'id')::uuid;
  insert into romway_private.locations values(target_id,p_data->>'code',p_data->>'name',p_data->>'country');
  insert into romway_private.personnel_audit(actor,action,target,details) values(actor.id,'location',target_id,p_data-'id');
  return jsonb_build_object('ok',true);
 end if;
 target_id := (p_data->>'id')::uuid;
 if target_id is null then return jsonb_build_object('error','invalid_request'); end if;
 if p_action='complete' then
  select * into reservation from romway_private.personnel_requests where id=target_id for update;
  if not found or reservation.completed or reservation.creator<>actor.id then return jsonb_build_object('error','conflict'); end if;
  ids:=reservation.location_ids; desired_role:=reservation.role; desired_name:=reservation.display_name; number:=reservation.employee_number;
 else
  if jsonb_typeof(p_data->'location_ids') is distinct from 'array' then return jsonb_build_object('error','invalid_request'); end if;
  select coalesce(array_agg(distinct v::uuid),'{}'::uuid[]) into ids from jsonb_array_elements_text(p_data->'location_ids') v;
  desired_role:=p_data->>'role'; desired_name:=btrim(p_data->>'display_name');
 end if;
 if desired_role is null or desired_role not in ('super_admin','admin','purchasing','receiver') or length(coalesce(desired_name,'')) not between 1 and 100
  or cardinality(ids)>1 or (desired_role<>'super_admin' and cardinality(ids)=0)
  or exists(select 1 from unnest(ids) x where not exists(select 1 from romway_private.locations l where l.id=x)) then return jsonb_build_object('error','invalid_request'); end if;
 if actor.role='admin' and (desired_role not in ('purchasing','receiver') or exists(select 1 from unnest(ids) x where not exists(select 1 from romway_private.staff_locations a where a.staff_id=actor.id and a.location_id=x and a.assigned))) then return jsonb_build_object('error','permission_denied'); end if;
 if p_action='reserve' then
  number:=p_data->>'employee_number';
  if number is null or number !~ '^[A-Z0-9_-]{1,40}$' then return jsonb_build_object('error','invalid_request'); end if;
  if exists(select 1 from romway_private.staff s where s.employee_number=number) then return jsonb_build_object('error','conflict'); end if;
  insert into romway_private.personnel_requests(id,employee_number,creator,display_name,role,location_ids) values(target_id,number,actor.id,desired_name,desired_role,ids);
  insert into romway_private.personnel_audit(actor,action,target,details) values(actor.id,'reserve',target_id,jsonb_build_object('employee_number',number,'role',desired_role,'location_ids',to_jsonb(ids)));
  return jsonb_build_object('ok',true);
 elsif p_action='complete' then
  -- Auth creation must have completed; staff becomes active only in this transaction.
  insert into romway_private.staff(id,employee_number,auth_email,display_name,role,active,temporary_password_expires_at)
   values(target_id,number,'staff-'||target_id::text||'@identity.invalid',desired_name,desired_role,true,now()+interval '24 hours');
  foreach item in array ids loop insert into romway_private.staff_locations values(target_id,item,true); end loop;
  update romway_private.personnel_requests set completed=true where id=target_id;
 else
  select * into target from romway_private.staff where id=target_id for update;
  if not found then return jsonb_build_object('error','permission_denied'); end if;
  if actor.role='admin' and (target.role not in ('purchasing','receiver')
   or not exists(select 1 from romway_private.staff_locations x where x.staff_id=target.id and x.assigned)
   or exists(select 1 from romway_private.staff_locations x where x.staff_id=target.id and x.assigned and not exists(select 1 from romway_private.staff_locations a where a.staff_id=actor.id and a.location_id=x.location_id and a.assigned))) then return jsonb_build_object('error','permission_denied'); end if;
  if jsonb_typeof(p_data->'active') is distinct from 'boolean' then return jsonb_build_object('error','invalid_request'); end if;
  desired_active:=(p_data->>'active')::boolean;
  -- No manager can remove their own access. The last available super admin survives.
  if target.id=actor.id and (not desired_active or desired_role<>target.role) then return jsonb_build_object('error','self_protected'); end if;
  if target.role='super_admin' and target.active and (not desired_active or desired_role<>'super_admin') and not exists(select 1 from romway_private.staff s where s.id<>target.id and s.role='super_admin' and s.active and not s.password_change_required and s.password_operation is null) then return jsonb_build_object('error','last_super_admin'); end if;
  update romway_private.staff set display_name=desired_name,role=desired_role,active=desired_active,session_version=session_version+1 where id=target.id;
  update romway_private.sessions set revoked_at=coalesce(revoked_at,now()) where staff_id=target.id;
  -- Retain old assignments as history, never delete rows.
  update romway_private.staff_locations set assigned=false where staff_id=target.id;
  foreach item in array ids loop insert into romway_private.staff_locations values(target.id,item,true) on conflict(staff_id,location_id) do update set assigned=true; end loop;
 end if;
 insert into romway_private.personnel_audit(actor,action,target,details) values(actor.id,p_action,target_id,jsonb_build_object('role',desired_role,'location_ids',to_jsonb(ids),'active',case when p_action='update' then desired_active else true end));
 return jsonb_build_object('ok',true);
exception when unique_violation then return jsonb_build_object('error','conflict');
 when invalid_text_representation or not_null_violation or check_violation then return jsonb_build_object('error','invalid_request');
end $$;
revoke all on function public.romway_personnel(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.romway_personnel(text,text,jsonb) to service_role;
commit;
