import Link from "next/link";

export function StudioHeader({
  title,
  description,
  crumbs,
  actions,
}: {
  title: string;
  description?: string;
  crumbs?: { href: string; label: string }[];
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        {crumbs && (
          <nav aria-label="Breadcrumb" className="eyebrow mb-3">
            {crumbs.map((c, i) => (
              <span key={c.href}>
                {i > 0 && <span aria-hidden className="mx-2 text-smoke">/</span>}
                <Link href={c.href} className="hover:text-bone">
                  {c.label}
                </Link>
              </span>
            ))}
          </nav>
        )}
        <h1 className="font-display text-4xl leading-tight md:text-5xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-mist">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "published" || status === "approved" || status === "confirmed"
      ? "border-copper/60 text-copper"
      : status === "new"
        ? "border-bone/50 text-bone"
        : status === "rejected" || status === "declined"
          ? "border-signal/50 text-signal"
          : "border-line text-mist";
  return (
    <span className={`inline-block border px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] ${tone}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
