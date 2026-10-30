"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { primaryNav, secondaryNav } from "@/lib/nav";

/** The live header: knows the current route for active links. */
export function Header() {
  return <HeaderView pathname={usePathname()} />;
}

/**
 * Same markup without route awareness. Used as the Suspense fallback so the
 * static shell has a complete header while the pathname streams in.
 */
export function HeaderFallback() {
  return <HeaderView pathname="" />;
}

function HeaderView({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close the menu whenever the route changes (adjusting state during render,
  // rather than in an effect).
  if (open && openedAt !== pathname) {
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    const toggle = toggleRef.current;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      // Keep keyboard focus inside the open menu.
      if (event.key === "Tab" && panelRef.current) {
        const focusables = [
          toggle,
          ...panelRef.current.querySelectorAll<HTMLElement>("a, button"),
        ].filter(Boolean) as HTMLElement[];
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open]);

  const isActive = (href: string) => Boolean(pathname) && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled || open ? "bg-ink/85 backdrop-blur-md" : "bg-gradient-to-b from-ink/80 to-transparent"
      }`}
    >
      <div className="container-ca flex h-16 items-center justify-between gap-6 md:h-20">
        <Link
          href="/"
          className="group relative z-10 flex items-baseline gap-2"
          aria-label="Cool Affair, home"
        >
          <span className="font-display text-[1.6rem] leading-none tracking-tight md:text-[1.85rem]">
            Cool Affair
          </span>
          <span className="eyebrow hidden transition-colors group-hover:text-copper sm:inline">
            Universe
          </span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`text-[0.8125rem] tracking-wide transition-colors ${
                    item.href === "/book"
                      ? "border border-bone/30 px-4 py-2 hover:border-copper hover:text-copper"
                      : isActive(item.href)
                        ? "text-copper"
                        : "text-silver hover:text-bone"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className="relative z-10 flex h-11 items-center gap-3 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => {
            setOpenedAt(pathname);
            setOpen((v) => !v);
          }}
        >
          <span className="eyebrow text-bone">{open ? "Close" : "Menu"}</span>
          <span aria-hidden className="relative block h-3 w-6">
            <span
              className={`absolute left-0 h-px w-6 bg-bone transition-transform duration-500 ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 h-px w-6 bg-bone transition-transform duration-500 ${
                open ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </div>

      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        className="fixed inset-0 top-16 h-[calc(100dvh-4rem)] overflow-y-auto bg-ink lg:hidden"
      >
        <nav aria-label="Mobile" className="container-ca flex min-h-full flex-col justify-between py-8">
          <ol className="space-y-1">
            {primaryNav.map((item, i) => (
              <li key={item.href} className="page-enter" style={{ animationDelay: `${i * 45}ms` }}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="group flex items-baseline gap-4 border-b border-line py-3"
                >
                  <span className="eyebrow w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <span
                    className={`font-display text-[2.6rem] leading-none ${
                      isActive(item.href) ? "text-copper" : "text-bone group-hover:text-copper"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
            {secondaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="eyebrow hover:text-bone">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
