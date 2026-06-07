"use client";

import { useEffect, useRef, useState } from "react";

const SPEEDS = [0.75, 1, 1.25, 1.5];

/**
 * Audio player for AI-narrated recordings. Includes a playback-speed control,
 * which is handy when memorizing — slow it down to learn, speed up to test.
 */
export default function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-sm font-medium text-muted">Listen</span>
        <div className="flex items-center gap-1 text-xs">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={`rounded px-2 py-1 transition-colors ${
                speed === s
                  ? "bg-accent text-background"
                  : "text-muted hover:text-accent"
              }`}
              aria-pressed={speed === s}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>
      <audio ref={audioRef} controls preload="metadata" className="w-full">
        <source src={src} />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
