-- Hardening for the Cool Affair helper functions (Supabase security advisor).
--
-- * The SECURITY DEFINER helpers move out of the API-exposed `public` schema
--   into `ca_private`, so they can no longer be called via /rest/v1/rpc.
--   RLS policies and the auth trigger reference functions by OID, so they keep
--   working unchanged after the move.
-- * The policies still need to evaluate the role helpers for every visitor,
--   so anon/authenticated keep USAGE on the schema and EXECUTE on those two.
-- * The new-user trigger function is not callable by anyone but its owner.
-- * The updated_at trigger function gets a fixed search_path.
-- Additive and re-runnable.

create schema if not exists ca_private;
grant usage on schema ca_private to anon, authenticated;

do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'ca_is_staff') then
    alter function public.ca_is_staff() set schema ca_private;
  end if;
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'ca_is_admin') then
    alter function public.ca_is_admin() set schema ca_private;
  end if;
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'ca_handle_new_user') then
    alter function public.ca_handle_new_user() set schema ca_private;
  end if;
end $$;

revoke all on function ca_private.ca_is_staff() from public;
revoke all on function ca_private.ca_is_admin() from public;
grant execute on function ca_private.ca_is_staff() to anon, authenticated;
grant execute on function ca_private.ca_is_admin() to anon, authenticated;

revoke all on function ca_private.ca_handle_new_user() from public, anon, authenticated;

alter function public.ca_touch_updated_at() set search_path = public;
