// Central place for environment configuration. Everything here is optional:
// without Supabase the public site renders from src/lib/data/seed.ts and the
// Studio explains what to configure.

function clean(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function resolveSiteUrl() {
  const explicit = clean(process.env.NEXT_PUBLIC_SITE_URL);
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = clean(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const siteUrl = resolveSiteUrl();

export const supabaseUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const supabaseKey =
  clean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ??
  clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const MEDIA_BUCKET = "ca-media";

export function publicStorageUrl(path: string) {
  if (!supabaseUrl) return null;
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/${encoded}`;
}
