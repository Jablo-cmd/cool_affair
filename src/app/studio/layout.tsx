import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: { default: "Studio", template: "%s · Studio · Cool Affair" },
  robots: { index: false, follow: false },
};

// The Studio is per-user and always rendered at request time.
export const instant = false;

/** Marks every Studio route as request-time, including its metadata. */
async function RequestTime() {
  await connection();
  return null;
}

export default function StudioRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-graphite text-bone">
      <Suspense
        fallback={
          <div className="flex min-h-dvh items-center justify-center" aria-busy="true">
            <span className="eyebrow">Opening the Studio…</span>
          </div>
        }
      >
        {children}
      </Suspense>
      <Suspense>
        <RequestTime />
      </Suspense>
    </div>
  );
}
