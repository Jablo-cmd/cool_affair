import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "@/lib/env";

// Session-less client for public, cacheable reads. It never touches cookies, so
// it is safe inside "use cache" functions. RLS limits it to published content.
let client: SupabaseClient | null = null;

export function getPublicClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  client ??= createClient(supabaseUrl!, supabaseKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
