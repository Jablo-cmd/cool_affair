// Turns a listening or video link into an embeddable player URL, but only for
// known platforms. Anything else returns null and is shown as a plain link, so
// the Studio can never inject an arbitrary iframe.

export type EmbedKind = "spotify" | "soundcloud" | "youtube" | "bandcamp" | "apple";

export interface Embed {
  kind: EmbedKind;
  src: string;
  height: number;
}

export function toEmbed(raw: string | null | undefined): Embed | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.replace(/^www\./, "");

  if (host === "open.spotify.com") {
    const path = url.pathname.replace(/^\/embed/, "").replace(/^\/intl-[a-z-]+/, "");
    const match = path.match(/^\/(track|album|playlist|artist|episode|show)\/([A-Za-z0-9]+)/);
    if (!match) return null;
    const tall = match[1] !== "track" && match[1] !== "episode";
    return {
      kind: "spotify",
      src: `https://open.spotify.com/embed/${match[1]}/${match[2]}?theme=0`,
      height: tall ? 380 : 152,
    };
  }

  if (host === "w.soundcloud.com" && url.pathname.startsWith("/player")) {
    return { kind: "soundcloud", src: url.toString(), height: 166 };
  }
  if (host === "soundcloud.com" || host === "on.soundcloud.com") {
    const isSet = url.pathname.includes("/sets/");
    const params = new URLSearchParams({
      url: url.toString(),
      color: "#c4834f",
      auto_play: "false",
      hide_related: "true",
      show_comments: "false",
      show_user: "true",
      show_reposts: "false",
      visual: "false",
    });
    return {
      kind: "soundcloud",
      src: `https://w.soundcloud.com/player/?${params.toString()}`,
      height: isSet ? 400 : 166,
    };
  }

  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be" || host === "youtube-nocookie.com") {
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.slice(1);
    else if (url.pathname.startsWith("/embed/")) id = url.pathname.split("/")[2] ?? null;
    else if (url.pathname.startsWith("/shorts/")) id = url.pathname.split("/")[2] ?? null;
    else id = url.searchParams.get("v");
    if (!id || !/^[A-Za-z0-9_-]{6,20}$/.test(id)) return null;
    return { kind: "youtube", src: `https://www.youtube-nocookie.com/embed/${id}`, height: 0 };
  }

  if (host === "bandcamp.com" && url.pathname.startsWith("/EmbeddedPlayer")) {
    return { kind: "bandcamp", src: url.toString(), height: 120 };
  }

  if (host === "embed.music.apple.com") {
    return { kind: "apple", src: url.toString(), height: 450 };
  }
  if (host === "music.apple.com") {
    return { kind: "apple", src: `https://embed.music.apple.com${url.pathname}`, height: 450 };
  }

  return null;
}
