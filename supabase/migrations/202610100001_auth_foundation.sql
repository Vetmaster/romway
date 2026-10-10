-- NEW, ISOLATED TEST PROJECT ONLY. No destructive statements or existing schema edits.
begin;
create schema romway_private;
revoke all on schema romway_private from public, anon, authenticated;
create table romway_private.staff (
 id uuid primary key references auth.users(id),
 employee_number text not null unique check (employee_number ~ '^[A-Z0-9_-]{1,40}$'),
 auth_email text not null unique check (auth_email ~ '^staff-[0-9a-f-]+@identity[.]invalid$'),
 display_name text not null check (length(display_name) between 1 and 100),
 role text not null check (role in ('super_admin','admin','purchasing','receiver')),
 active boolean not null default false,
 password_change_required boolean not null default true,
 temporary_password_expires_at timestamptz,
 session_version integer not null default 1,
 password_operation uuid,
 password_operation_started_at timestamptz,
 created_at timestamptz not null default now(),
 check (not password_change_required or temporary_password_expires_at is not null)
);
create table romway_private.sessions (
 cookie_hash text primary key check (cookie_hash ~ '^[0-9a-f]{64}$'),
 staff_id uuid not null references romway_private.staff(id),
 session_version integer not null,
 created_at timestamptz not null default now(),
 expires_at timestamptz not null,
 revoked_at timestamptz
);
create table romway_private.auth_attempts (
 bucket text primary key check (bucket ~ '^[0-9a-f]{64}$'),
 window_start timestamptz not null default now(),
 attempts integer not null default 1
);
-- No policies and no direct client grants: all access is through service-only RPCs.
alter table romway_private.staff enable row level security;
alter table romway_private.sessions enable row level security;
alter table romway_private.auth_attempts enable row level security;
revoke all on all tables in schema romway_private from public, anon, authenticated;

create function public.romway_consume_attempt(p_bucket text, p_limit integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare count_attempts integer;
begin
 if p_limit not between 1 and 500 then raise exception 'invalid limit'; end if;
 insert into romway_private.auth_attempts(bucket) values(p_bucket)
 on conflict(bucket) do update set
 attempts = case when romway_private.auth_attempts.window_start < now()-interval '15 minutes' then 1 else romway_private.auth_attempts.attempts+1 end,
 window_start = case when romway_private.auth_attempts.window_start < now()-interval '15 minutes' then now() else romway_private.auth_attempts.window_start end
 returning attempts into count_attempts;
 return count_attempts <= p_limit;
end $$;

create function public.romway_staff_for_login(p_employee_number text)
returns jsonb language sql security definer set search_path = '' as $$
 select to_jsonb(s) from romway_private.staff s where s.employee_number=p_employee_number;
$$;

create function public.romway_session(p_hash text)
returns jsonb language sql security definer set search_path = '' as $$
 select to_jsonb(s) from romway_private.sessions x join romway_private.staff s on s.id=x.staff_id
 where x.cookie_hash=p_hash and x.revoked_at is null and x.expires_at>now()
 and s.active and s.password_operation is null and s.session_version=x.session_version
 and (not s.password_change_required or s.temporary_password_expires_at>now());
$$;

create function public.romway_open_session(p_hash text,p_staff_id uuid,p_version integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare s romway_private.staff;
begin
 select * into s from romway_private.staff where id=p_staff_id for update;
 if not found or not s.active or s.password_operation is not null or s.session_version<>p_version
 or (s.password_change_required and (s.temporary_password_expires_at is null or s.temporary_password_expires_at<=now())) then return false; end if;
 insert into romway_private.sessions(cookie_hash,staff_id,session_version,expires_at)
 values(p_hash,s.id,s.session_version,least(now()+interval '8 hours',case when s.password_change_required then s.temporary_password_expires_at else now()+interval '8 hours' end));
 return true;
end $$;

create function public.romway_revoke_session(p_hash text)
returns void language sql security definer set search_path = '' as $$
 update romway_private.sessions set revoked_at=coalesce(revoked_at,now()) where cookie_hash=p_hash;
$$;

create function public.romway_begin_password(p_hash text,p_operation uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare s romway_private.staff; uid uuid;
begin
 select (public.romway_session(p_hash)->>'id')::uuid into uid;
 if uid is null then return null; end if;
 select * into s from romway_private.staff where id=uid for update;
 -- Recheck after acquiring the row lock: only one concurrent change may proceed.
 if public.romway_session(p_hash) is null then return null; end if;
 update romway_private.staff set password_operation=p_operation,password_operation_started_at=now(),session_version=session_version+1 where id=uid;
 update romway_private.sessions set revoked_at=coalesce(revoked_at,now()) where staff_id=uid;
 return uid;
end $$;

create function public.romway_finish_password(p_staff_id uuid,p_operation uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
 update romway_private.staff set password_operation=null,password_operation_started_at=null,
 password_change_required=false,temporary_password_expires_at=null
 where id=p_staff_id and password_operation=p_operation;
 return found;
end $$;

-- Two-phase provisioning: Auth user first, staff record INACTIVE, then activate.
-- Failure never deletes existing data and never grants access to an orphan Auth user.
create function public.romway_register_staff(p_id uuid,p_employee_number text,p_email text,p_name text,p_role text)
returns void language sql security definer set search_path = '' as $$
 insert into romway_private.staff(id,employee_number,auth_email,display_name,role,temporary_password_expires_at)
 values(p_id,p_employee_number,p_email,p_name,p_role,now()+interval '24 hours');
$$;
create function public.romway_activate_staff(p_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
 update romway_private.staff set active=true where id=p_id and not active and password_operation is null;
 return found;
end $$;

revoke all on function public.romway_consume_attempt(text,integer) from public,anon,authenticated;
revoke all on function public.romway_staff_for_login(text) from public,anon,authenticated;
revoke all on function public.romway_session(text) from public,anon,authenticated;
revoke all on function public.romway_open_session(text,uuid,integer) from public,anon,authenticated;
revoke all on function public.romway_revoke_session(text) from public,anon,authenticated;
revoke all on function public.romway_begin_password(text,uuid) from public,anon,authenticated;
revoke all on function public.romway_finish_password(uuid,uuid) from public,anon,authenticated;
revoke all on function public.romway_register_staff(uuid,text,text,text,text) from public,anon,authenticated;
revoke all on function public.romway_activate_staff(uuid) from public,anon,authenticated;
grant execute on function public.romway_consume_attempt(text,integer),public.romway_staff_for_login(text),
 public.romway_session(text),public.romway_open_session(text,uuid,integer),public.romway_revoke_session(text),
 public.romway_begin_password(text,uuid),public.romway_finish_password(uuid,uuid),
 public.romway_register_staff(uuid,text,text,text,text),public.romway_activate_staff(uuid) to service_role;
commit;
