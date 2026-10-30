import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "@/lib/env";

// Cookie-bound client acting as the signed-in user. Use only behind <Suspense>
// or in Server Actions: it reads request cookies.
export async function getServerClient() {
  if (!isSupabaseConfigured) return null;
  // Request-time only: the auth client reads the clock as it initialises.
  await connection();
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component: the proxy refreshes the session.
        }
      },
    },
  });
}
