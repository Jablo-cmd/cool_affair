import { Footer } from "@/components/site/Footer";
import { Suspense } from "react";
import { Header, HeaderFallback } from "@/components/site/Header";
import { ArrowLink } from "@/components/site/Section";
import { Waveform } from "@/components/site/Waveform";

export default function NotFound() {
  return (
    <>
      <Suspense fallback={<HeaderFallback />}>
        <Header />
      </Suspense>
      <main id="main">
    <section className="container-ca flex min-h-[80dvh] flex-col justify-center pt-32">
      <p className="eyebrow mb-6">404 · Signal lost</p>
      <h1 className="font-display text-giant leading-[0.9]">
        This frequency
        <br />
        <em className="text-silver">is silent.</em>
      </h1>
      <Waveform seed="404" bars={80} className="mt-12 h-12 w-full max-w-2xl text-smoke" />
      <div className="mt-12 flex flex-wrap gap-8">
        <ArrowLink href="/">Return to the universe</ArrowLink>
        <ArrowLink href="/sound">Explore the sound</ArrowLink>
      </div>
    </section>
      </main>
      <Footer />
    </>
  );
}
