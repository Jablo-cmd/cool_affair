import { Footer } from "@/components/site/Footer";
import { Suspense } from "react";
import { Header, HeaderFallback } from "@/components/site/Header";
import { JsonLd } from "@/components/site/JsonLd";
import { getSettings } from "@/lib/data/queries";
import { siteJsonLd } from "@/lib/seo";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <Suspense fallback={<HeaderFallback />}>
        <Header />
      </Suspense>
      <main id="main">{children}</main>
      <Footer />
      <JsonLd data={siteJsonLd(settings)} />
    </>
  );
}
