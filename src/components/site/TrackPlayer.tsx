"use client";

import { useEffect, useRef, useState } from "react";
import { Waveform } from "./Waveform";

export interface PlayerTrack {
  id: string;
  position: number;
  title: string;
  duration: string | null;
  credits: string | null;
  src: string | null;
}

function clock(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Track listing with in-page previews for tracks that have an approved audio
// asset. One <audio> element is shared, so only one preview plays at a time.
export function TrackPlayer({ tracks, releaseTitle }: { tracks: PlayerTrack[]; releaseTitle: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [length, setLength] = useState(0);
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setTime(audio.currentTime);
    const onMeta = () => setLength(audio.duration);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onPause);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onPause);
    };
  }, []);

  async function toggle(track: PlayerTrack) {
    const audio = audioRef.current;
    if (!audio || !track.src) return;
    setFailed(null);
    if (current === track.id) {
      if (audio.paused) await audio.play().catch(() => setFailed(track.id));
      else audio.pause();
      return;
    }
    audio.src = track.src;
    setCurrent(track.id);
    setTime(0);
    setLength(0);
    await audio.play().catch(() => setFailed(track.id));
  }

  return (
    <div>
      <audio ref={audioRef} preload="none" />
      <ol className="border-t border-line">
        {tracks.map((track) => {
          const active = current === track.id;
          return (
            <li key={track.id} className="border-b border-line">
              <div className="flex items-center gap-4 py-4 md:gap-6">
                <span className="w-8 shrink-0 font-mono text-xs text-mist">
                  {String(track.position).padStart(2, "0")}
                </span>
                {track.src ? (
                  <button
                    type="button"
                    onClick={() => toggle(track)}
                    aria-label={`${active && playing ? "Pause" : "Play"} preview of ${track.title}`}
                    aria-pressed={active && playing}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      active ? "border-copper text-copper" : "border-smoke text-bone hover:border-bone"
                    }`}
                  >
                    {active && playing ? (
                      <svg aria-hidden viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="currentColor">
                        <rect x="1" y="1" width="3" height="8" />
                        <rect x="6" y="1" width="3" height="8" />
                      </svg>
                    ) : (
                      <svg aria-hidden viewBox="0 0 10 10" className="ml-0.5 h-2.5 w-2.5" fill="currentColor">
                        <path d="M2 1 L9 5 L2 9 Z" />
                      </svg>
                    )}
                  </button>
                ) : (
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-[0.55rem] font-mono uppercase text-smoke"
                    title="No authorised preview"
                  >
                    —
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-base ${active ? "text-copper" : "text-bone"}`}>{track.title}</p>
                  {track.credits && <p className="truncate text-xs text-mist">{track.credits}</p>}
                </div>
                <span className="font-mono text-xs text-mist">{track.duration ?? ""}</span>
              </div>
              {active && (
                <div className="pb-5 pl-12 md:pl-[5.5rem]">
                  <Waveform
                    seed={`${releaseTitle}-${track.title}`}
                    bars={72}
                    progress={length ? time / length : 0}
                    className="h-8 w-full text-smoke"
                  />
                  <div className="mt-2 flex items-center gap-3">
                    <span className="font-mono text-[0.65rem] text-mist">{clock(time)}</span>
                    <input
                      type="range"
                      min={0}
                      max={length || 0}
                      step={0.1}
                      value={time}
                      aria-label={`Seek within ${track.title}`}
                      onChange={(e) => {
                        const audio = audioRef.current;
                        if (audio) audio.currentTime = Number(e.target.value);
                      }}
                      className="scrubber flex-1"
                    />
                    <span className="font-mono text-[0.65rem] text-mist">{clock(length)}</span>
                  </div>
                  {failed === track.id && (
                    <p role="alert" className="mt-2 text-xs text-signal">
                      This preview could not be played.
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
