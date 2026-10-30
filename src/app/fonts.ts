import localFont from "next/font/local";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

// All fonts are self-hosted: no build-time or runtime requests to a font CDN.
// Instrument Serif is SIL OFL 1.1 (see src/fonts/InstrumentSerif-OFL.txt).
export const instrumentSerif = localFont({
  src: [
    { path: "../fonts/instrument-serif-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/instrument-serif-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument",
  display: "swap",
  fallback: ["Iowan Old Style", "Times New Roman", "serif"],
});

export const fontVariables = `${GeistSans.variable} ${GeistMono.variable} ${instrumentSerif.variable}`;
