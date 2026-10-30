# Supabase setup

Project ref: `adhppvuwbrnwujziedzj`

> **Nothing has been applied to the production project.** The migration below is prepared and was tested against a local Supabase stack. Review it and apply it yourself when ready.

## What the migration creates

`supabase/migrations/20261030000000_cool_affair_universe.sql` is **additive only**:

- Every table is prefixed `ca_` so it cannot clash with tables that may already exist in the project.
- It never drops, truncates or alters objects it did not create.
- Grants apply only to the `ca_` tables.
- It is safe to re-run. Tables, indexes and the bucket use `IF NOT EXISTS` / `ON CONFLICT`, and policies are only created when missing. This was tested by applying it twice.

| Table | Purpose |
| --- | --- |
| `ca_profiles` | One row per auth user, with a `role` of `admin`, `editor` or `viewer` |
| `ca_site_settings` | A single row (`id = 1`): identity, homepage, artist story, Full Band, contact links, SEO defaults |
| `ca_media_assets` | The provenance registry: source, credit, rights holder, permission, approval status |
| `ca_releases`, `ca_tracks` | The catalogue and track listings, with audio previews linked to media assets |
| `ca_events` | Live performances |
| `ca_archive_items` | The archive |
| `ca_alchemy_entries` | The laboratory |
| `ca_journal_posts` | Articles. A published post with a future `published_at` stays hidden until that time. |
| `ca_collaborators` | The Collaboration Network |
| `ca_enquiries`, `ca_enquiry_notes` | Enquiries, and their append-only history of status changes and notes |

It also creates a public-read storage bucket, `ca-media`, which only staff can write to.

### Access rules (RLS)

- **Public visitors** can read published rows, approved media and site settings. They can submit an enquiry with status `new`, and can't read enquiries back.
- **Viewers** (any signed-in account without a role) get the same access as the public. They have no Studio access.
- **Editors** can manage all content, media and enquiries, and add enquiry notes.
- **Admins** have editor access plus role management and enquiry deletion.
- A media asset **cannot be approved** until its permission is `owned`, `licensed` or `permission_granted`. A database constraint enforces this.

## Applying it

1. Back up the project: Dashboard → Database → Backups.
2. Read the migration file.
3. Apply it, either:
   - in the Dashboard → SQL Editor, by pasting the file and running it; or
   - with the CLI. Linking only stores the project ref locally; `db push` applies pending migrations.

     ```bash
     npx supabase link --project-ref adhppvuwbrnwujziedzj
     ```

     ```bash
     npx supabase db push
     ```

4. Optional: run `supabase/seed.sql` in the SQL Editor to start with the built-in content in the database. It inserts settings and the eight concepts, and never overwrites existing rows.

## Creating the first admin

1. Dashboard → Authentication → Users → **Add user**. Enter an email and password, and tick *Auto confirm*.
2. In the SQL Editor, run:

   ```sql
   update public.ca_profiles set role = 'admin' where email = 'you@example.com';
   ```

3. Sign in at `/studio`. Further editors can be promoted from **Studio → Team**.

Recommended: in Authentication → Sign In / Providers, **turn off public sign-ups**. The Studio only needs accounts you create.

## Environment variables

Set these in your hosting provider (for example Vercel → Settings → Environment Variables):

```
NEXT_PUBLIC_SITE_URL=https://<your domain>
NEXT_PUBLIC_SUPABASE_URL=https://adhppvuwbrnwujziedzj.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Dashboard → Project Settings → API → publishable key>
```

The service-role key is not needed and must never be added to the app.

## Storage notes

- Uploads go straight from the Studio in the browser to the `ca-media` bucket. Storage RLS limits writes to staff. The file is then registered with its provenance.
- The bucket is public-read so approved media can be cached and optimised. Unapproved files therefore aren't hidden by the bucket itself; their unguessable paths are what keeps them private, and the site never links to them. Upload anything confidential somewhere else.

## Testing locally

This requires Docker. The test uses throwaway users and rows, and refuses to run against anything except localhost.

1. Start a local stack. `npx supabase start` applies the migrations in `supabase/migrations`.

   ```bash
   npx supabase start
   ```

2. Run the RLS checks, using the local keys that `supabase start` prints:

   ```bash
   SUPABASE_URL=http://127.0.0.1:54321 SUPABASE_ANON_KEY=<publishable> SUPABASE_SERVICE_ROLE_KEY=<secret> npm run test:rls
   ```

The script checks 22 rules covering public visibility, scheduling, the media approval gate, enquiry privacy, storage writes and role boundaries.
