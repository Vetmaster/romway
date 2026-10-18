-- Prepared only. Shared product cards; no stock, price, batch, serial or movement rows.
begin;
create table romway_private.products (
 id uuid primary key,
 request_id uuid not null,
 creator_id uuid not null references romway_private.staff(id),
 created_location_id uuid not null references romway_private.locations(id),
 name text not null check(length(name) between 1 and 100),
 part_code text not null unique check(length(part_code) between 1 and 80 and part_code ~ '^[A-Z0-9][A-Z0-9 ._/-]*$' and part_code=btrim(part_code)),
 unit text not null check(unit in ('piece','set','litre','kg','metre')),
 created_at timestamptz not null default now(),
 unique(creator_id,request_id)
);
alter table romway_private.products enable row level security;
revoke all on romway_private.products from public,anon,authenticated;
create index products_newest on romway_private.products(created_at desc,id);
create function public.romway_products(p_hash text,p_action text,p_data jsonb default '{}')
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor jsonb; actor_id uuid; actor_role text; assigned uuid[]; location uuid; request uuid; title text; code text; measure text; item romway_private.products; result jsonb;
begin
 if p_action is null or p_action not in ('list','create') then return jsonb_build_object('error','invalid_request');end if;
 actor:=public.romway_session(p_hash);
 if actor is null then return jsonb_build_object('error','session_expired');end if;
 actor_id:=(actor->>'id')::uuid;
 perform 1 from romway_private.staff where id=actor_id for update;
 actor:=public.romway_session(p_hash);
 if actor is null then return jsonb_build_object('error','session_expired');end if;
 actor_role:=actor->>'role';
 if (actor->>'password_change_required')::boolean or actor_role not in ('super_admin','admin','purchasing') then return jsonb_build_object('error','permission_denied');end if;
 select coalesce(array_agg(location_id),'{}'::uuid[]) into assigned from romway_private.staff_locations where staff_id=actor_id and staff_locations.assigned;
 if p_action='create' then
  if jsonb_typeof(p_data->'name') is distinct from 'string' or jsonb_typeof(p_data->'part_code') is distinct from 'string' or jsonb_typeof(p_data->'unit') is distinct from 'string' then return jsonb_build_object('error','invalid_request');end if;
  begin
   location:=(p_data->>'location_id')::uuid;request:=(p_data->>'request_id')::uuid;
  exception when invalid_text_representation then return jsonb_build_object('error','invalid_request');end;
  title:=btrim(p_data->>'name');code:=upper(regexp_replace(btrim(p_data->>'part_code'),' +',' ','g'));measure:=p_data->>'unit';
  if location is null or request is null or length(title) not between 1 and 100 or length(code) not between 1 and 80 or code !~ '^[A-Z0-9][A-Z0-9 ._/-]*$' or measure not in ('piece','set','litre','kg','metre') or not exists(select 1 from romway_private.locations where id=location) then return jsonb_build_object('error','invalid_request');end if;
  if actor_role<>'super_admin' and not(location=any(assigned)) then return jsonb_build_object('error','permission_denied');end if;
  select * into item from romway_private.products where creator_id=actor_id and request_id=request;
  if found then
   if item.created_location_id<>location or item.name<>title or item.part_code<>code or item.unit<>measure then return jsonb_build_object('error','conflict');end if;
  else
   if exists(select 1 from romway_private.products where part_code=code) then return jsonb_build_object('error','product_code_exists');end if;
   insert into romway_private.products(id,request_id,creator_id,created_location_id,name,part_code,unit) values(request,request,actor_id,location,title,code,measure) returning * into item;
  end if;
  return jsonb_build_object('ok',true,'id',item.id);
 end if;
 select jsonb_build_object(
  'locations',coalesce((select jsonb_agg(jsonb_build_object('id',l.id,'name',l.name) order by l.name) from romway_private.locations l where actor_role='super_admin' or l.id=any(assigned)),'[]'::jsonb),
  'products',coalesce((select jsonb_agg(r.row order by r.created_at desc,r.id) from (
   select p.created_at,p.id,jsonb_build_object('id',p.id,'name',p.name,'part_code',p.part_code,'unit',p.unit,'created_at',p.created_at) as row
   from romway_private.products p order by p.created_at desc,p.id limit 200
  ) r),'[]'::jsonb)
 ) into result;
 return result;
exception when unique_violation then return jsonb_build_object('error','conflict');
 when invalid_text_representation or not_null_violation or check_violation then return jsonb_build_object('error','invalid_request');
end $$;
revoke all on function public.romway_products(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.romway_products(text,text,jsonb) to service_role;
commit;
