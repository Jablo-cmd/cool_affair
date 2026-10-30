import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/studio/LoginForm";
import { getSession } from "@/lib/studio/auth";
import { Unconfigured } from "../Unconfigured";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/studio/login">) {
  const [session, params] = await Promise.all([getSession(), searchParams]);
  const next = typeof params.next === "string" && params.next.startsWith("/studio") ? params.next : "/studio";
  if (session.state === "staff") redirect(next);
  if (session.state === "unconfigured") return <Unconfigured />;

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-3xl">
          Cool Affair
        </Link>
        <p className="eyebrow mb-10 mt-2">The Studio · Private</p>
        {session.state === "forbidden" ? (
          <div className="space-y-4 text-sm text-silver">
            <p>
              You are signed in as <span className="text-bone">{session.email}</span>, but this account
              does not have Studio access.
            </p>
            <p>Ask an administrator to give your account the editor or admin role.</p>
          </div>
        ) : (
          <LoginForm next={next} />
        )}
      </div>
    </main>
  );
}
