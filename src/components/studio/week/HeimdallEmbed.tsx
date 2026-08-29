"use client";

import { useState } from "react";
import type { HeimdallVideo } from "@/lib/week-log/types";

export function HeimdallEmbed({
  video,
  label = "Watch",
}: {
  video: HeimdallVideo;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="text-sm text-neon-cyan transition-colors hover:text-white"
        aria-expanded={open}
      >
        {open ? `Hide ${label.toLowerCase()}` : label}
      </button>

      {open ? (
        <div className="mt-3 space-y-3">
          <p className="text-sm font-medium text-white">{video.title}</p>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
            {video.domain}
            {video.duration ? ` · ${video.duration}` : ""}
            {video.channel ? ` · ${video.channel}` : ""}
          </p>

          {video.embedUrl ? (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
              <div className="aspect-video">
                <iframe
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  src={video.embedUrl}
                  title={video.title}
                />
              </div>
            </div>
          ) : null}

          <a
            href={video.primaryUrl}
            className="inline-block text-sm text-neon-cyan hover:underline"
            rel="noreferrer"
            target="_blank"
          >
            Open on YouTube
          </a>

          {video.why ? (
            <p className="text-sm leading-relaxed text-slate-300">{video.why}</p>
          ) : null}

          {video.cues.length > 0 ? (
            <div>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                Cues
              </p>
              <ul className="mt-2 space-y-1 text-sm text-slate-300">
                {video.cues.map((cue) => (
                  <li key={`${video.id}-${cue}`}>{cue}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
