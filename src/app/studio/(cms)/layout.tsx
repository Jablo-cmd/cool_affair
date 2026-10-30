import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "../actions";
import { getSession } from "@/lib/studio/auth";
import { StudioNav } from "@/components/studio/StudioNav";
import { Unconfigured } from "../Unconfigured";

// Authorisation gate for every Studio page. Pages below only render for
// admins and editors; Server Actions and RLS check again independently.
export default async function CmsLayout({ children }: { children: React.ReactNode }) {
  const result = await getSession();
  if (result.state === "unconfigured") return <Unconfigured />;
  if (result.state !== "staff") redirect("/studio/login");
  const { session } = result;

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-line bg-ink lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col">
          <div className="flex items-baseline justify-between px-5 py-5">
            <Link href="/studio" className="font-display text-2xl">
              Studio
            </Link>
            <Link href="/" className="eyebrow hover:text-bone" target="_blank">
              View site ↗
            </Link>
          </div>
          <StudioNav isAdmin={session.role === "admin"} />
          <div className="mt-auto flex items-center justify-between gap-4 border-t border-line px-5 py-3 lg:block lg:py-4">
            <p className="truncate text-xs text-mist">{session.email}</p>
            <p className="eyebrow text-copper lg:mt-1">{session.role}</p>
            <form action={signOut} className="lg:mt-3">
              <button type="submit" className="text-xs text-silver underline underline-offset-4 hover:text-bone">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0 px-4 py-8 md:px-8 lg:py-10">{children}</div>
    </div>
  );
}
