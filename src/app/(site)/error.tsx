"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-ca flex min-h-[70dvh] flex-col justify-center pt-32">
      <p className="eyebrow mb-6">Interference</p>
      <h1 className="font-display text-display leading-[0.95]">Something broke the signal.</h1>
      <p className="mt-6 max-w-lg text-silver">
        This page could not be loaded. Try again, or come back in a moment.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-10 w-fit border border-bone/30 px-6 py-3 text-sm hover:border-copper hover:text-copper"
      >
        Try again
      </button>
    </section>
  );
}
