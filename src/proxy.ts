import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "@/lib/env";

// Optimistic gate for /studio: refreshes the Supabase session cookie and sends
// signed-out visitors to the login page. The real authorisation check (staff
// role) happens server-side in the Studio layout and in every Server Action,
// and RLS enforces it again in the database.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/studio/login";

  if (!isSupabaseConfigured) {
    // Nothing to authenticate against; the Studio shows setup instructions.
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/studio/login";
    url.search = "";
    if (pathname !== "/studio") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/studio", "/studio/:path*"],
};
