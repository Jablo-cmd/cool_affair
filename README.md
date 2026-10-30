# cool_affair

cool affair website

**The Cool Affair Universe** is the official website of Cool Affair, the creative identity of Sibusiso Zephania Ntombela: a Johannesburg producer, DJ, musician, sound engineer and label owner. It has a public site and a private CMS called **the Studio** at `/studio`.

Built with Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS 4 and Supabase (Postgres, Auth and Storage).

## Sections

| Route | Section |
| --- | --- |
| `/` | Home: Enter the Universe |
| `/sound`, `/sound/[slug]` | Sound: the catalogue, with filters, an index view, a release chronology, track listings with previews and embedded players |
| `/live`, `/live/full-band` | Live: performance formats, upcoming dates, photography, the event archive, and the Full Band Experience |
| `/alchemy` | Alchemy: the creative laboratory |
| `/story` | Artist Story |
| `/archive` | Archive: a filterable visual archive with a lightbox |
| `/journal`, `/journal/[slug]` | Journal: articles, with scheduled publishing |
| `/collaborators` | Collaboration Network (verified collaborators only) |
| `/book` | Book: the enquiry form |
| `/studio` | The Studio: private, Supabase Auth, admin and editor roles |

The site also generates `sitemap.xml`, `robots.txt`, Open Graph and Twitter cards, and JSON-LD structured data: Person, WebSite, MusicAlbum (released work only), MusicEvent and BlogPosting.

## Content policy built into the code

- **No invented facts.** The built-in content (`src/lib/data/seed.ts`, `supabase/seed.sql`) holds only what the brief supplied: name, roles, city, influences and the eight project titles. Each project is marked **Concept**. Biography sections the artist hasn't written show a labelled *To be supplied* placeholder that says where to fill it in.
- **Release stages.** Each release has a stage: `concept`, `in_development`, `forthcoming` or `released`. Only `released` work appears as an available record, in the chronology, or in MusicAlbum structured data.
- **Media provenance.** Every image, recording and video is a row in `ca_media_assets` with its source, credit, rights holder, usage permission and status. The public site only shows `approved` assets. The database refuses approval until permission is `owned`, `licensed` or `permission_granted`. Temporary development images are labelled on the page.
- **Live dates.** An event only appears under *Upcoming* when it is published, dated and marked confirmed.
- **Collaborators.** A collaborator only appears publicly when they are both published and verified.
- **Enquiries.** Enquiries are reviewed by a person. The form never confirms a booking.

## Getting started

```bash
npm ci
```

```bash
cp .env.example .env.local
```

Fill in `.env.local`, then start the dev server:

```bash
npm run dev
```

With no environment variables the public site still runs, using the built-in content, and `/studio` explains what to configure.

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generates route types, then runs `tsc --noEmit` |
| `npm run check` | Typecheck, lint and build |
| `npm run test:rls` | Row Level Security checks against a **local** Supabase stack (see `docs/SUPABASE.md`) |

## Environment variables

See `.env.example`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Recommended in production | Canonical URLs, sitemap and social cards |
| `NEXT_PUBLIC_SUPABASE_URL` | For the Studio and live content | `https://adhppvuwbrnwujziedzj.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | For the Studio and live content | The publishable (anon) key. It is safe in the browser because RLS protects the data. |

The app never uses the Supabase service-role key.

## Supabase

The schema, RLS policies and storage bucket are in `supabase/migrations/`. Both migrations are applied to the production project. Next, create the first admin; `docs/SUPABASE.md` has the steps.

## Documentation

- `docs/ARCHITECTURE.md`: structure, data flow, caching and security decisions
- `docs/SUPABASE.md`: database setup, roles, storage and local testing
