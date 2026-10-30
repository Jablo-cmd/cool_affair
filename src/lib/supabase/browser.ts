"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser client for Studio uploads straight to Storage, so large files never
// pass through a Server Action body limit. RLS on storage.objects restricts
// writes to staff.
export function getBrowserClient(url: string, key: string) {
  return createBrowserClient(url, key);
}
