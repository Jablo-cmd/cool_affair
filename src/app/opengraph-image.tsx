import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/data/queries";

export const alt = "Cool Affair: The Cool Affair Universe";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const serif = readFile(join(process.cwd(), "src/fonts/instrument-serif-latin-400-normal.woff"));

// Default social card: typographic, so it never implies a photograph or
// artwork that has not been supplied.
export default async function OpenGraphImage() {
  const [font, settings] = await Promise.all([serif, getSettings()]);
  const rings = [250, 205, 160, 115, 70];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#09090a",
          color: "#ece7dd",
          padding: "64px 72px",
          position: "relative",
          fontFamily: "Instrument Serif",
        }}
      >
        <div style={{ position: "absolute", right: -120, top: 60, display: "flex" }}>
          <svg width="560" height="560" viewBox="0 0 560 560">
            {rings.map((r) => (
              <circle key={r} cx="280" cy="280" r={r} fill="none" stroke="#26262b" strokeWidth="2" />
            ))}
            <circle cx="280" cy="30" r="9" fill="#c4834f" />
          </svg>
        </div>
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, color: "#8e8b84", textTransform: "uppercase" }}>
          {`${settings.base_city ?? "Johannesburg"} · The Universe`}
        </div>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 0.85 }}>
          <span style={{ fontSize: 200 }}>Cool</span>
          <span style={{ fontSize: 200, color: "#bebcb6", marginLeft: 90 }}>Affair</span>
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#bebcb6", maxWidth: 900 }}>
          {settings.hero_statement ?? ""}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Instrument Serif", data: await font, style: "normal", weight: 400 }],
    },
  );
}
