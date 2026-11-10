"use client";

import { useState, useRef, useEffect } from "react";

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.warn("Audio playback interrupted:", err);
      });
    }
  };

  useEffect(() => {
    const handlePlayRequest = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
    };
    const handlePauseRequest = () => {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    };
    window.addEventListener("mirabel:play-piano", handlePlayRequest);
    window.addEventListener("mirabel:pause-piano", handlePauseRequest);
    return () => {
      window.removeEventListener("mirabel:play-piano", handlePlayRequest);
      window.removeEventListener("mirabel:pause-piano", handlePauseRequest);
    };
  }, []);

  return (
    <aside
      className="fixed bottom-[74px] right-6 z-50 sm:bottom-[78px] sm:right-6 pointer-events-auto"
      aria-label="Soothing piano player"
    >
      <audio
        ref={audioRef}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src="/audio/soothing-piano.mp3" type="audio/mpeg" />
        <source src="/audio/soothing-piano.wav" type="audio/wav" />
      </audio>
      <button
        type="button"
        onClick={togglePlay}
        aria-label={
          isPlaying
            ? "Pause soothing piano music"
            : "Play soothing piano music"
        }
        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium rounded-full backdrop-blur-md bg-[var(--surface)]/90 border border-[var(--line)] text-[var(--ink)] shadow-lg hover:border-[var(--purple)] hover:text-[var(--purple)] transition-all active:scale-95 cursor-pointer"
      >
        <span className="text-sm select-none" aria-hidden="true">
          {isPlaying ? "🔊" : "🔈"}
        </span>
        <span className="tracking-tight font-medium">
          {isPlaying ? "Pause Music" : "Play Music"}
        </span>
        {isPlaying && (
          <span
            className="flex items-center gap-0.5 h-3 ml-0.5"
            aria-hidden="true"
          >
            <span className="w-0.5 h-full bg-[var(--purple)] animate-pulse" />
            <span className="w-0.5 h-2/3 bg-[var(--purple)] animate-pulse delay-75" />
            <span className="w-0.5 h-4/5 bg-[var(--purple)] animate-pulse delay-150" />
          </span>
        )}
      </button>
    </aside>
  );
}
