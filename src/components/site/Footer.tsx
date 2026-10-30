import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { CONTENT_TAG, getSettings } from "@/lib/data/queries";
import { primaryNav, secondaryNav } from "@/lib/nav";
import { socialLinks } from "@/lib/seo";
import { Waveform } from "./Waveform";

export async function Footer() {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);

  const settings = await getSettings();
  const socials = socialLinks(settings);
  const year = new Date().getFullYear();
  const email = settings.booking_email ?? settings.contact_email;

  return (
    <footer className="relative mt-32 border-t border-line bg-graphite">
      <div className="container-ca py-20 md:py-28">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-6">Book · Collaborate · Enquire</p>
            <Link href="/book" className="group block">
              <span className="font-display block text-giant leading-[0.92] text-bone transition-colors group-hover:text-copper">
                Bring the sound
                <br />
                <em className="text-silver group-hover:text-copper">into the room.</em>
              </span>
            </Link>
            <Waveform seed="footer" bars={64} className="mt-10 h-10 w-full max-w-xl text-smoke" />
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-5">
            <div>
              <p className="eyebrow mb-4">Universe</p>
              <ul className="space-y-2 text-sm text-silver">
                <li>
                  <Link className="link-draw hover:text-bone" href="/">
                    Home
                  </Link>
                </li>
                {primaryNav.map((item) => (
                  <li key={item.href}>
                    <Link className="link-draw hover:text-bone" href={item.href}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-4">Further</p>
              <ul className="space-y-2 text-sm text-silver">
                {secondaryNav.map((item) => (
                  <li key={item.href}>
                    <Link className="link-draw hover:text-bone" href={item.href}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="eyebrow mb-4">Elsewhere</p>
              {socials.length ? (
                <ul className="space-y-2 text-sm text-silver">
                  {socials.map((s) => (
                    <li key={s.label}>
                      <a
                        className="link-draw hover:text-bone"
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {s.label} <span aria-hidden>↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-mist">Official channels will be listed here.</p>
              )}
              {email && (
                <a className="mt-6 block break-all text-sm text-bone link-draw" href={`mailto:${email}`}>
                  {email}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-line pt-8 text-xs text-mist md:flex-row md:items-center md:justify-between">
          <p className="font-mono uppercase tracking-[0.18em]">
            © {year} {settings.legal_name ?? settings.artist_name}
            {settings.base_city ? ` · ${settings.base_city}` : ""}
          </p>
          <p className="font-mono uppercase tracking-[0.18em]">
            {settings.artist_name} · The Universe
          </p>
        </div>
      </div>
    </footer>
  );
}
