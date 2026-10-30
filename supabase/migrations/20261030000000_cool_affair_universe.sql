-- The Cool Affair Universe: content, media provenance, enquiries and Studio roles.
--
-- Safety notes
-- * Additive only. Nothing here drops, truncates or alters an existing object
--   that this migration did not create. Every table is prefixed `ca_` so it
--   cannot collide with tables that may already exist in the project.
-- * Review before applying to production. Apply with the Supabase CLI
--   (`supabase db push`) or paste into the SQL editor. See docs/SUPABASE.md.
-- * Re-running is safe: tables, indexes and the bucket use IF NOT EXISTS /
--   ON CONFLICT, and policies are only created when missing.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------

create table if not exists public.ca_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'viewer' check (role in ('admin', 'editor', 'viewer')),
  created_at timestamptz not null default now()
);

-- Staff = admin or editor. SECURITY DEFINER so policies can call it without
-- recursing through ca_profiles' own RLS.
create or replace function public.ca_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.ca_profiles
    where id = auth.uid() and role in ('admin', 'editor')
  );
$$;

create or replace function public.ca_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.ca_profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- New sign-ins get a viewer profile; an admin promotes them in SQL.
create or replace function public.ca_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.ca_profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'ca_on_auth_user_created'
  ) then
    create trigger ca_on_auth_user_created
      after insert on auth.users
      for each row execute function public.ca_handle_new_user();
  end if;
end $$;

create or replace function public.ca_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Media provenance registry
-- Every image, recording and video the site shows is a row here. Public pages
-- only ever see rows with status = 'approved'.
-- ---------------------------------------------------------------------------

create table if not exists public.ca_media_assets (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('image', 'audio', 'video')),
  title text not null,
  storage_path text,
  external_url text,
  alt_text text,
  credit text,
  source text not null,
  rights_holder text,
  permission text not null default 'pending'
    check (permission in ('owned', 'licensed', 'permission_granted', 'pending', 'unknown')),
  permission_notes text,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'approved', 'rejected', 'archived')),
  is_temporary boolean not null default false,
  width integer,
  height integer,
  captured_on date,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ca_media_has_location check (storage_path is not null or external_url is not null),
  -- An asset cannot go live until its permission is settled.
  constraint ca_media_approved_needs_permission check (
    status <> 'approved' or permission in ('owned', 'licensed', 'permission_granted')
  )
);

-- ---------------------------------------------------------------------------
-- Site settings (single row, id = 1)
-- ---------------------------------------------------------------------------

create table if not exists public.ca_site_settings (
  id integer primary key default 1 check (id = 1),
  artist_name text not null default 'Cool Affair',
  legal_name text,
  base_city text,
  roles text[] not null default '{}',
  influences text[] not null default '{}',
  hero_statement text,
  intro_statement text,
  bio_intro text,
  philosophy text,
  creative_approach text,
  johannesburg text,
  artistic_direction text,
  alchemy_intro text,
  live_intro text,
  band_concept text,
  band_configuration text,
  band_instrumentation text,
  band_technical text,
  band_video_url text,
  band_media_id uuid references public.ca_media_assets (id) on delete set null,
  hero_media_id uuid references public.ca_media_assets (id) on delete set null,
  portrait_media_id uuid references public.ca_media_assets (id) on delete set null,
  featured_release_id uuid,
  contact_email text,
  booking_email text,
  instagram_url text,
  soundcloud_url text,
  youtube_url text,
  spotify_url text,
  bandcamp_url text,
  apple_music_url text,
  facebook_url text,
  x_url text,
  seo_title text,
  seo_description text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Catalogue
-- `stage` keeps concepts honest: only stage = 'released' is presented as an
-- available release.
-- ---------------------------------------------------------------------------

create table if not exists public.ca_releases (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  kind text not null default 'project'
    check (kind in ('album', 'ep', 'single', 'mix', 'project', 'experiment')),
  stage text not null default 'concept'
    check (stage in ('released', 'forthcoming', 'in_development', 'concept')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  release_date date,
  catalogue_number text,
  summary text,
  description text,
  genres text[] not null default '{}',
  artwork_id uuid references public.ca_media_assets (id) on delete set null,
  embed_url text,
  spotify_url text,
  apple_music_url text,
  soundcloud_url text,
  youtube_url text,
  bandcamp_url text,
  other_url text,
  featured boolean not null default false,
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'ca_settings_featured_release_fk'
  ) then
    alter table public.ca_site_settings
      add constraint ca_settings_featured_release_fk
      foreign key (featured_release_id) references public.ca_releases (id) on delete set null;
  end if;
end $$;

create table if not exists public.ca_tracks (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references public.ca_releases (id) on delete cascade,
  position integer not null default 1,
  title text not null,
  duration text,
  preview_id uuid references public.ca_media_assets (id) on delete set null,
  credits text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Live
-- ---------------------------------------------------------------------------

create table if not exists public.ca_events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  format text not null default 'dj_set'
    check (format in ('dj_set', 'live_electronic', 'collaboration', 'full_band')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  confirmed boolean not null default false,
  event_date date,
  start_time text,
  venue text,
  city text,
  country text,
  description text,
  ticket_url text,
  image_id uuid references public.ca_media_assets (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Archive, Alchemy, Journal, Collaborators
-- ---------------------------------------------------------------------------

create table if not exists public.ca_archive_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'project'
    check (category in ('release', 'artwork', 'photography', 'video', 'live',
                        'collaboration', 'studio', 'historical', 'project')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  item_date date,
  description text,
  media_id uuid references public.ca_media_assets (id) on delete set null,
  external_url text,
  release_id uuid references public.ca_releases (id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ca_alchemy_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text not null default 'experiment'
    check (kind in ('experiment', 'research', 'production_note', 'philosophy',
                    'concept', 'collaboration')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  entry_date date,
  summary text,
  body text,
  media_id uuid references public.ca_media_assets (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ca_journal_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null default 'reflection'
    check (category in ('reflection', 'commentary', 'production', 'philosophy',
                        'studio', 'culture', 'announcement', 'behind_the_scenes')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  -- A published post with a future date stays hidden until then (scheduling).
  published_at timestamptz,
  excerpt text,
  body text,
  cover_id uuid references public.ca_media_assets (id) on delete set null,
  author text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ca_collaborators (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  role text,
  bio text,
  image_id uuid references public.ca_media_assets (id) on delete set null,
  website_url text,
  instagram_url text,
  other_url text,
  release_ids uuid[] not null default '{}',
  verified boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Enquiries
-- ---------------------------------------------------------------------------

create table if not exists public.ca_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 160),
  email text not null check (char_length(email) between 3 and 254),
  organisation text check (organisation is null or char_length(organisation) <= 200),
  enquiry_type text not null
    check (enquiry_type in ('dj_booking', 'live_performance', 'full_band', 'production',
                            'sound_engineering', 'collaboration', 'label_industry', 'general')),
  event_date date,
  location text check (location is null or char_length(location) <= 200),
  budget_range text check (budget_range is null or char_length(budget_range) <= 80),
  message text not null check (char_length(message) between 10 and 5000),
  status text not null default 'new'
    check (status in ('new', 'in_review', 'responded', 'confirmed', 'declined', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ca_enquiry_notes (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.ca_enquiries (id) on delete cascade,
  author_id uuid references auth.users (id) on delete set null,
  author_email text,
  body text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes and updated_at triggers
-- ---------------------------------------------------------------------------

create index if not exists ca_releases_status_idx on public.ca_releases (status, sort_order);
create index if not exists ca_tracks_release_idx on public.ca_tracks (release_id, position);
create index if not exists ca_events_status_date_idx on public.ca_events (status, event_date);
create index if not exists ca_archive_status_idx on public.ca_archive_items (status, item_date);
create index if not exists ca_journal_status_idx on public.ca_journal_posts (status, published_at);
create index if not exists ca_enquiries_status_idx on public.ca_enquiries (status, created_at);
create index if not exists ca_enquiry_notes_idx on public.ca_enquiry_notes (enquiry_id, created_at);
create index if not exists ca_media_status_idx on public.ca_media_assets (status, kind);

do $$
declare
  t text;
begin
  foreach t in array array[
    'ca_media_assets', 'ca_site_settings', 'ca_releases', 'ca_tracks', 'ca_events',
    'ca_archive_items', 'ca_alchemy_entries', 'ca_journal_posts', 'ca_collaborators',
    'ca_enquiries'
  ] loop
    if not exists (
      select 1 from pg_trigger where tgname = t || '_touch_updated_at'
    ) then
      execute format(
        'create trigger %I before update on public.%I for each row execute function public.ca_touch_updated_at()',
        t || '_touch_updated_at', t
      );
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.ca_profiles enable row level security;
alter table public.ca_media_assets enable row level security;
alter table public.ca_site_settings enable row level security;
alter table public.ca_releases enable row level security;
alter table public.ca_tracks enable row level security;
alter table public.ca_events enable row level security;
alter table public.ca_archive_items enable row level security;
alter table public.ca_alchemy_entries enable row level security;
alter table public.ca_journal_posts enable row level security;
alter table public.ca_collaborators enable row level security;
alter table public.ca_enquiries enable row level security;
alter table public.ca_enquiry_notes enable row level security;

-- Helper: create a policy only when it does not exist yet.
create or replace function pg_temp.ca_policy(p_name text, p_table text, p_sql text)
returns void
language plpgsql
as $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = p_table and policyname = p_name
  ) then
    execute p_sql;
  end if;
end;
$$;

-- Profiles: you can read your own; admins read and manage all.
select pg_temp.ca_policy('ca_profiles_self_read', 'ca_profiles',
  $p$create policy ca_profiles_self_read on public.ca_profiles
     for select to authenticated using (id = auth.uid() or public.ca_is_admin())$p$);
select pg_temp.ca_policy('ca_profiles_admin_update', 'ca_profiles',
  $p$create policy ca_profiles_admin_update on public.ca_profiles
     for update to authenticated using (public.ca_is_admin()) with check (public.ca_is_admin())$p$);

-- Media: the public sees approved assets only; staff manage everything.
select pg_temp.ca_policy('ca_media_public_read', 'ca_media_assets',
  $p$create policy ca_media_public_read on public.ca_media_assets
     for select to anon, authenticated using (status = 'approved' or public.ca_is_staff())$p$);
select pg_temp.ca_policy('ca_media_staff_write', 'ca_media_assets',
  $p$create policy ca_media_staff_write on public.ca_media_assets
     for all to authenticated using (public.ca_is_staff()) with check (public.ca_is_staff())$p$);

-- Settings: public read, staff write.
select pg_temp.ca_policy('ca_settings_public_read', 'ca_site_settings',
  $p$create policy ca_settings_public_read on public.ca_site_settings
     for select to anon, authenticated using (true)$p$);
select pg_temp.ca_policy('ca_settings_staff_write', 'ca_site_settings',
  $p$create policy ca_settings_staff_write on public.ca_site_settings
     for all to authenticated using (public.ca_is_staff()) with check (public.ca_is_staff())$p$);

-- Published content: public read when published; staff manage everything.
select pg_temp.ca_policy('ca_releases_public_read', 'ca_releases',
  $p$create policy ca_releases_public_read on public.ca_releases
     for select to anon, authenticated using (status = 'published' or public.ca_is_staff())$p$);
select pg_temp.ca_policy('ca_releases_staff_write', 'ca_releases',
  $p$create policy ca_releases_staff_write on public.ca_releases
     for all to authenticated using (public.ca_is_staff()) with check (public.ca_is_staff())$p$);

select pg_temp.ca_policy('ca_tracks_public_read', 'ca_tracks',
  $p$create policy ca_tracks_public_read on public.ca_tracks
     for select to anon, authenticated using (
       public.ca_is_staff() or exists (
         select 1 from public.ca_releases r where r.id = release_id and r.status = 'published'
       ))$p$);
select pg_temp.ca_policy('ca_tracks_staff_write', 'ca_tracks',
  $p$create policy ca_tracks_staff_write on public.ca_tracks
     for all to authenticated using (public.ca_is_staff()) with check (public.ca_is_staff())$p$);

select pg_temp.ca_policy('ca_events_public_read', 'ca_events',
  $p$create policy ca_events_public_read on public.ca_events
     for select to anon, authenticated using (status = 'published' or public.ca_is_staff())$p$);
select pg_temp.ca_policy('ca_events_staff_write', 'ca_events',
  $p$create policy ca_events_staff_write on public.ca_events
     for all to authenticated using (public.ca_is_staff()) with check (public.ca_is_staff())$p$);

select pg_temp.ca_policy('ca_archive_public_read', 'ca_archive_items',
  $p$create policy ca_archive_public_read on public.ca_archive_items
     for select to anon, authenticated using (status = 'published' or public.ca_is_staff())$p$);
select pg_temp.ca_policy('ca_archive_staff_write', 'ca_archive_items',
  $p$create policy ca_archive_staff_write on public.ca_archive_items
     for all to authenticated using (public.ca_is_staff()) with check (public.ca_is_staff())$p$);

select pg_temp.ca_policy('ca_alchemy_public_read', 'ca_alchemy_entries',
  $p$create policy ca_alchemy_public_read on public.ca_alchemy_entries
     for select to anon, authenticated using (status = 'published' or public.ca_is_staff())$p$);
select pg_temp.ca_policy('ca_alchemy_staff_write', 'ca_alchemy_entries',
  $p$create policy ca_alchemy_staff_write on public.ca_alchemy_entries
     for all to authenticated using (public.ca_is_staff()) with check (public.ca_is_staff())$p$);

select pg_temp.ca_policy('ca_journal_public_read', 'ca_journal_posts',
  $p$create policy ca_journal_public_read on public.ca_journal_posts
     for select to anon, authenticated using (
       (status = 'published' and (published_at is null or published_at <= now()))
       or public.ca_is_staff())$p$);
select pg_temp.ca_policy('ca_journal_staff_write', 'ca_journal_posts',
  $p$create policy ca_journal_staff_write on public.ca_journal_posts
     for all to authenticated using (public.ca_is_staff()) with check (public.ca_is_staff())$p$);

-- Collaborators: only verified, published people are public.
select pg_temp.ca_policy('ca_collaborators_public_read', 'ca_collaborators',
  $p$create policy ca_collaborators_public_read on public.ca_collaborators
     for select to anon, authenticated using (
       (status = 'published' and verified) or public.ca_is_staff())$p$);
select pg_temp.ca_policy('ca_collaborators_staff_write', 'ca_collaborators',
  $p$create policy ca_collaborators_staff_write on public.ca_collaborators
     for all to authenticated using (public.ca_is_staff()) with check (public.ca_is_staff())$p$);

-- Enquiries: anyone may submit a new one; nobody but staff can read them back.
select pg_temp.ca_policy('ca_enquiries_public_insert', 'ca_enquiries',
  $p$create policy ca_enquiries_public_insert on public.ca_enquiries
     for insert to anon, authenticated with check (status = 'new')$p$);
select pg_temp.ca_policy('ca_enquiries_staff_read', 'ca_enquiries',
  $p$create policy ca_enquiries_staff_read on public.ca_enquiries
     for select to authenticated using (public.ca_is_staff())$p$);
select pg_temp.ca_policy('ca_enquiries_staff_update', 'ca_enquiries',
  $p$create policy ca_enquiries_staff_update on public.ca_enquiries
     for update to authenticated using (public.ca_is_staff()) with check (public.ca_is_staff())$p$);
select pg_temp.ca_policy('ca_enquiries_admin_delete', 'ca_enquiries',
  $p$create policy ca_enquiries_admin_delete on public.ca_enquiries
     for delete to authenticated using (public.ca_is_admin())$p$);

-- Enquiry notes are an append-only history.
select pg_temp.ca_policy('ca_enquiry_notes_staff_read', 'ca_enquiry_notes',
  $p$create policy ca_enquiry_notes_staff_read on public.ca_enquiry_notes
     for select to authenticated using (public.ca_is_staff())$p$);
select pg_temp.ca_policy('ca_enquiry_notes_staff_insert', 'ca_enquiry_notes',
  $p$create policy ca_enquiry_notes_staff_insert on public.ca_enquiry_notes
     for insert to authenticated with check (public.ca_is_staff() and author_id = auth.uid())$p$);

-- Grants (Supabase defaults usually cover these; stated explicitly for clarity).
grant select on public.ca_media_assets, public.ca_site_settings, public.ca_releases,
  public.ca_tracks, public.ca_events, public.ca_archive_items, public.ca_alchemy_entries,
  public.ca_journal_posts, public.ca_collaborators to anon, authenticated;
grant insert on public.ca_enquiries to anon, authenticated;
-- Only the ca_ tables: never widen grants on tables this migration did not create.
grant select, insert, update, delete on public.ca_profiles, public.ca_media_assets,
  public.ca_site_settings, public.ca_releases, public.ca_tracks, public.ca_events,
  public.ca_archive_items, public.ca_alchemy_entries, public.ca_journal_posts,
  public.ca_collaborators, public.ca_enquiries, public.ca_enquiry_notes to authenticated;

-- ---------------------------------------------------------------------------
-- Storage: public-read bucket for approved media, staff-only writes.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit)
values ('ca-media', 'ca-media', true, 52428800)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'ca_media_staff_insert'
  ) then
    create policy ca_media_staff_insert on storage.objects
      for insert to authenticated
      with check (bucket_id = 'ca-media' and public.ca_is_staff());
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'ca_media_staff_update'
  ) then
    create policy ca_media_staff_update on storage.objects
      for update to authenticated
      using (bucket_id = 'ca-media' and public.ca_is_staff());
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'ca_media_staff_delete'
  ) then
    create policy ca_media_staff_delete on storage.objects
      for delete to authenticated
      using (bucket_id = 'ca-media' and public.ca_is_staff());
  end if;
end $$;
