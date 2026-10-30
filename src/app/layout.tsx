import type { Metadata, Viewport } from "next";
import { getSettings } from "@/lib/data/queries";
import { siteUrl } from "@/lib/env";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import { fontVariables } from "./fonts";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = settings.seo_title ?? `Cool Affair: ${SITE_NAME}`;
  const description = settings.seo_description ?? DEFAULT_DESCRIPTION;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: "%s · Cool Affair" },
    description,
    applicationName: SITE_NAME,
    authors: [{ name: settings.legal_name ?? settings.artist_name }],
    creator: settings.legal_name ?? settings.artist_name,
    keywords: [
      "Cool Affair",
      "Cool Affair South Africa",
      "Sibusiso Ntombela",
      "Sibusiso Zephania Ntombela",
      "Johannesburg music producer",
      "South African electronic music",
      "broken beat",
      "nu-jazz",
    ],
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_ZA",
      title,
      description,
      url: "/",
    },
    twitter: { card: "summary_large_image", title, description },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#09090a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-ZA" className={fontVariables}>
      <body className="grain min-h-dvh">
        <a
          href="#main"
          className="sr-only z-[70] bg-copper px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
