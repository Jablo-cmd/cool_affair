import Link from "next/link";
import type { ReactNode } from "react";

export function SectionHeader({
  index,
  eyebrow,
  title,
  intro,
  action,
}: {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <div className="reveal mb-12 grid gap-6 border-t border-line pt-6 md:mb-16 md:grid-cols-12">
      <p className="eyebrow md:col-span-3">
        {index && <span className="mr-3 text-copper">{index}</span>}
        {eyebrow}
      </p>
      <div className="md:col-span-9">
        <h2 className="font-display text-display leading-[0.95] text-balance">{title}</h2>
        {intro && <div className="mt-6 max-w-2xl text-lg leading-relaxed text-silver">{intro}</div>}
        {action && (
          <ArrowLink href={action.href} className="mt-8">
            {action.label}
          </ArrowLink>
        )}
      </div>
    </div>
  );
}

export function ArrowLink({
  href,
  children,
  className = "",
  external,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
}) {
  const classes = `group inline-flex items-center gap-3 text-sm tracking-wide text-bone ${className}`;
  const inner = (
    <>
      <span className="link-draw">{children}</span>
      <span
        aria-hidden
        className="inline-block text-copper transition-transform duration-500 group-hover:translate-x-1.5"
      >
        {external ? "↗" : "→"}
      </span>
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={classes}>
      {inner}
    </Link>
  );
}

/** Large page opening used by every section page. */
export function PageHero({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="container-ca pb-16 pt-36 md:pb-24 md:pt-48">
      <p className="eyebrow rise mb-8">{eyebrow}</p>
      <h1 className="font-display rise text-giant leading-[0.9] text-balance" style={{ animationDelay: "80ms" }}>
        {title}
      </h1>
      {lede && (
        <div
          className="rise mt-10 max-w-2xl text-lg leading-relaxed text-silver md:text-xl"
          style={{ animationDelay: "180ms" }}
        >
          {lede}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * A clearly labelled gap for content the artist has not supplied yet. It says
 * where to fill it in, so placeholders never pass as real biography.
 */
export function Placeholder({ label, where }: { label: string; where: string }) {
  return (
    <div className="border border-dashed border-smoke p-5 text-sm text-mist">
      <p className="eyebrow mb-2 text-copper">To be supplied</p>
      <p>
        {label} <span className="text-silver">Add it in Studio → {where}.</span>
      </p>
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="reveal border border-line px-6 py-14 text-center md:py-20">
      <p className="font-display text-3xl text-bone md:text-4xl">{title}</p>
      {children && <div className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-mist">{children}</div>}
    </div>
  );
}
