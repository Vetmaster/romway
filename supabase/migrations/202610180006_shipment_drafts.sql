-- Review only. Draft headers do not move inventory or record transport activity.
begin;
create table romway_private.shipment_drafts (
 id uuid primary key,
 number bigint generated always as identity unique,
 request_id uuid not null,
 creator_id uuid not null references romway_private.staff(id),
 source_id uuid not null references romway_private.locations(id),
 destination_id uuid not null references romway_private.locations(id),
 carrier_id uuid not null references romway_private.staff(id),
 notes text not null default '' check(length(notes)<=1000),
 status text not null default 'draft' check(status='draft'),
 created_at timestamptz not null default now(),
 unique(creator_id,request_id),check(source_id<>destination_id)
);
alter table romway_private.shipment_drafts enable row level security;
revoke all on romway_private.shipment_drafts from public,anon,authenticated;
revoke all on sequence romway_private.shipment_drafts_number_seq from public,anon,authenticated;
create index shipment_drafts_newest on romway_private.shipment_drafts(created_at desc,id);
create function public.romway_shipments(p_hash text,p_action text,p_data jsonb default '{}')
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor jsonb; actor_id uuid; actor_role text; assigned uuid[]; source uuid; destination uuid; carrier uuid; request uuid; note text; item romway_private.shipment_drafts; result jsonb;
begin
 if p_action is null or p_action not in ('list','create') then return jsonb_build_object('error','invalid_request');end if;
 actor:=public.romway_session(p_hash);
 if actor is null then return jsonb_build_object('error','session_expired');end if;
 actor_id:=(actor->>'id')::uuid;
 perform 1 from romway_private.staff where id=actor_id for update;
 actor:=public.romway_session(p_hash);
 if actor is null then return jsonb_build_object('error','session_expired');end if;
 actor_role:=actor->>'role';
 if (actor->>'password_change_required')::boolean or actor_role not in ('super_admin','admin','purchasing','receiver') then return jsonb_build_object('error','permission_denied');end if;
 select coalesce(array_agg(location_id),'{}'::uuid[]) into assigned from romway_private.staff_locations where staff_id=actor_id and staff_locations.assigned;
 if p_action='create' then
  if jsonb_typeof(p_data->'notes') is distinct from 'string' then return jsonb_build_object('error','invalid_request');end if;
  begin
   source:=(p_data->>'source_id')::uuid;destination:=(p_data->>'destination_id')::uuid;carrier:=(p_data->>'carrier_id')::uuid;request:=(p_data->>'request_id')::uuid;note:=btrim(p_data->>'notes');
  exception when invalid_text_representation then return jsonb_build_object('error','invalid_request');end;
  if source is null or destination is null or carrier is null or request is null or source=destination or length(note)>1000
    or not exists(select 1 from romway_private.locations where id=source) or not exists(select 1 from romway_private.locations where id=destination)
    or not exists(select 1 from romway_private.staff where id=carrier and active and role='receiver') then return jsonb_build_object('error','invalid_request');end if;
  if (actor_role in ('admin','purchasing') and not(source=any(assigned))) or (actor_role='receiver' and carrier<>actor_id) then return jsonb_build_object('error','permission_denied');end if;
  select * into item from romway_private.shipment_drafts where creator_id=actor_id and request_id=request;
  if found then
   if item.source_id<>source or item.destination_id<>destination or item.carrier_id<>carrier or item.notes<>note then return jsonb_build_object('error','conflict');end if;
  else
   insert into romway_private.shipment_drafts(id,request_id,creator_id,source_id,destination_id,carrier_id,notes) values(request,request,actor_id,source,destination,carrier,note) returning * into item;
  end if;
  return jsonb_build_object('ok',true,'id',item.id,'number',item.number,'status','draft');
 elsif p_action<>'list' then return jsonb_build_object('error','invalid_request');end if;
 select jsonb_build_object(
  'sources',coalesce((select jsonb_agg(jsonb_build_object('id',l.id,'name',l.name) order by l.name) from romway_private.locations l where actor_role in ('super_admin','receiver') or l.id=any(assigned)),'[]'::jsonb),
  'destinations',coalesce((select jsonb_agg(jsonb_build_object('id',l.id,'name',l.name) order by l.name) from romway_private.locations l),'[]'::jsonb),
  'carriers',coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'display_name',s.display_name) order by s.display_name) from romway_private.staff s where s.active and s.role='receiver' and (actor_role<>'receiver' or s.id=actor_id)),'[]'::jsonb),
  'shipments',coalesce((select jsonb_agg(r.row order by r.created_at desc,r.id) from (
    select d.created_at,d.id,jsonb_build_object('id',d.id,'number',d.number,'source_name',a.name,'destination_name',b.name,'carrier_name',s.display_name,'notes',d.notes,'status',d.status,'created_at',d.created_at) as row
    from romway_private.shipment_drafts d join romway_private.locations a on a.id=d.source_id join romway_private.locations b on b.id=d.destination_id join romway_private.staff s on s.id=d.carrier_id
    where actor_role='super_admin' or (actor_role='receiver' and (d.carrier_id=actor_id or d.creator_id=actor_id)) or (actor_role in ('admin','purchasing') and (d.source_id=any(assigned) or d.destination_id=any(assigned)))
    order by d.created_at desc,d.id limit 100
  ) r),'[]'::jsonb)
 ) into result;
 return result;
exception when unique_violation then return jsonb_build_object('error','conflict');
 when invalid_text_representation or not_null_violation or check_violation then return jsonb_build_object('error','invalid_request');
end $$;
revoke all on function public.romway_shipments(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.romway_shipments(text,text,jsonb) to service_role;
commit;
