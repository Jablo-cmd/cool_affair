import Link from "next/link";

export function Unconfigured() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-24">
      <Link href="/" className="font-display text-3xl">
        Cool Affair
      </Link>
      <p className="eyebrow mb-8 mt-2">The Studio</p>
      <h1 className="font-display text-5xl leading-tight">The Studio is not connected yet.</h1>
      <div className="mt-8 space-y-4 text-silver">
        <p>The public site is running on its built-in content. To edit content, connect Supabase:</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Set <code className="text-bone">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="text-bone">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> (see <code>.env.example</code>).
          </li>
          <li>Review and apply the migration in <code className="text-bone">supabase/migrations</code>.</li>
          <li>Create your user in Supabase Auth and give it the admin role (see docs/SUPABASE.md).</li>
        </ol>
      </div>
    </main>
  );
}
