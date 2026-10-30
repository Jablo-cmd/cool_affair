# Architecture

## Layout

```
src/
  app/
    (site)/            Public site. Shared header, footer and JSON-LD layout.
      page.tsx         Home
      sound/ live/ alchemy/ story/ archive/ journal/ collaborators/ book/
    studio/            Private CMS with its own layout.
      login/           Sign-in
      (cms)/           Authenticated area. The layout is the authorisation gate.
        [resource]/    Generic list, new and edit pages for every content type
        media/new/     Upload with provenance
        enquiries/     Enquiry inbox and detail with history
        settings/ team/
      actions.ts       Every Studio Server Action
    sitemap.ts robots.ts opengraph-image.tsx twitter-image.tsx icon.svg
  components/site/     Public UI: Cover, Waveform, Embed, TrackPlayer, SoundLibrary, ArchiveBrowser …
  components/studio/   Studio UI: RecordForm, FieldInput, MediaUploader …
  lib/
    data/              Types, labels, seed content and the cached public queries
    studio/            Resource config, form parsing, auth and choices
    supabase/          Public (cookie-less), server (cookie) and browser clients
    seo.ts embed.ts format.ts env.ts
  proxy.ts             Session refresh and the sign-in redirect for /studio
supabase/              Migration and optional seed
scripts/verify-rls.mjs RLS test suite for a local stack
```

## Rendering and caching

The app uses Next.js 16 with **Cache Components** and **Partial Prefetching**.

- **Public reads** live in `src/lib/data/queries.ts`. Each is a `"use cache"` function tagged `content`, and goes through a cookie-less anon client, so RLS decides what is public. As a result every public page prerenders as static HTML.
- **Studio saves** call `updateTag("content")`, so edits show up on the next request with no stale content (verified end to end).
- **Dynamic routes** (`/sound/[slug]`, `/journal/[slug]`) prerender the known slugs. New slugs render on first visit and are then cached.
- **The Studio** is request-time only. Its layout wraps everything in `<Suspense>`, and `getServerClient()` calls `connection()` before touching cookies.
- **Fallback content.** Without Supabase, or if a query fails (for example before the migration is applied), the site renders the seed content instead of erroring.

## Security

- **Defence in depth.** `proxy.ts` handles redirects only. The `(cms)` layout checks the role server-side with `auth.getUser()`, every Server Action calls `requireStaff()` again, and RLS enforces the same rules in Postgres.
- **No service-role key.** The app never uses one, so every database call acts as the visitor or the signed-in user.
- **Whitelisted form fields.** Studio forms are parsed against `src/lib/studio/resources.ts`, so undeclared columns can't be written. Validation runs on the server.
- **No HTML injection.** Rich text is a small Markdown subset rendered as React elements (`Prose.tsx`), so raw HTML from the Studio never reaches the page. Embeds are restricted to Spotify, SoundCloud, YouTube (privacy-enhanced domain), Bandcamp and Apple Music (`embed.ts`).
- **Booking form spam protection.** A honeypot field and a minimum fill time. RLS lets the public insert enquiries but never read them.
- **Response headers.** Security headers are set in `next.config.ts`, and `/studio` is `noindex`.

## Design system

The tokens are in `src/app/globals.css` (`@theme`):

- **Colour.** Near-black, graphite and charcoal grounds; bone and silver type; a single copper accent.
- **Type.** Instrument Serif for display (self-hosted, SIL OFL), Geist Sans for text and Geist Mono for metadata.
- **Motion.** CSS only. Scroll reveals use scroll-driven animations where supported, and the hero waveform uses a compositor-only sweep. Everything respects `prefers-reduced-motion`. There is no animation library.
- **Placeholders.** Generative visuals (`Waveform`, typographic `Cover`) are stable per title and clearly labelled. They never pass as artwork or audio.

## Studio content types

Content types are declared in `src/lib/studio/resources.ts`. Adding a field means:

1. add the column in a new migration;
2. add the field to the resource config;
3. add the type to `src/lib/data/types.ts` and render it on the public page.

The list, form, validation and save logic pick it up automatically.
