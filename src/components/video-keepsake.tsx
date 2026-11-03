"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, Film, RotateCcw, Sparkles } from "lucide-react";
import styles from "./video-keepsake.module.css";

type VideoKeepsakeProps = {
  soundOn?: boolean;
  volume?: number;
  onPlay?: () => void;
};

export default function VideoKeepsake({
  soundOn = true,
  volume = 0.35,
  onPlay,
}: VideoKeepsakeProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const headingId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !soundOn;
    // Mobile Safari can reserve volume changes for the device's own controls.
    try {
      video.volume = Number.isFinite(volume)
        ? Math.max(0, Math.min(1, volume))
        : 0.35;
    } catch {
      // Native volume controls remain available if programmatic volume is blocked.
    }
  }, [soundOn, volume]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const pause = () => video.pause();
    const onVisibilityChange = () => {
      if (document.hidden) pause();
    };
    const dialogObserver = new MutationObserver((records) => {
      if (
        records.some(
          ({ target }) => target instanceof HTMLDialogElement && target.open,
        )
      )
        pause();
    });
    // The photo viewer and secret lullaby use native dialogs. Opening either
    // pauses this keepsake; returning to the page never restarts it automatically.
    dialogObserver.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["open"],
    });
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", pause);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", pause);
      dialogObserver.disconnect();
      pause();
    };
  }, []);

  const retry = () => {
    setHasError(false);
    videoRef.current?.load();
    videoRef.current?.focus({ preventScroll: true });
  };

  return (
    <section className={styles.keepsake} aria-labelledby={headingId}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>
          <Film size={14} strokeWidth={1.3} aria-hidden="true" />A LITTLE
          MIRABEL, IN MOTION
        </p>
        <h3 id={headingId}>
          Some moments
          <br />
          <em>deserve a little motion.</em>
        </h3>
        <p className={styles.description}>
          A short little montage, because a still photograph can only do so
          much.
        </p>
        <p className={styles.handwritten}>
          <Sparkles size={21} strokeWidth={1.2} aria-hidden="true" />
          <span>
            Same Mirabel. A little more
            <br />
            main-character energy.
          </span>
        </p>
        <p className={styles.quietNote}>
          A moving little keepsake. Press play when you&apos;re ready.
        </p>
      </div>

      <div className={styles.film}>
        <div className={styles.paperBehind} aria-hidden="true" />
        <div className={styles.frame}>
          <span className={styles.tape} aria-hidden="true" />
          <div className={styles.videoWrap} data-error={hasError || undefined}>
            <video
              ref={videoRef}
              className={styles.video}
              controls={!hasError}
              playsInline
              preload="metadata"
              poster="/videos/miri-poster.jpg"
              muted={!soundOn}
              tabIndex={hasError ? -1 : 0}
              aria-label="Play a 15-second video montage of Mirabel"
              aria-describedby={descriptionId}
              onError={() => setHasError(true)}
              onLoadedMetadata={() => setHasError(false)}
              onPlay={() => {
                if (document.hidden || document.querySelector("dialog[open]")) {
                  videoRef.current?.pause();
                  return;
                }
                onPlay?.();
              }}
            >
              <source
                src="/videos/miri.mp4"
                type="video/mp4"
                onError={() => setHasError(true)}
              />
              Your browser doesn&apos;t support this video.{" "}
              <a href="/videos/miri.mp4">Open Mirabel&apos;s video directly.</a>
            </video>
            <span className={styles.duration} aria-hidden="true">
              00:15
            </span>
            {hasError && (
              <div className={styles.error} role="alert">
                <Film size={25} strokeWidth={1.1} aria-hidden="true" />
                <p>This little moment couldn&apos;t load.</p>
                <span>A quick retry might do the trick.</span>
                <button type="button" onClick={retry}>
                  <RotateCcw size={14} aria-hidden="true" /> Try loading the
                  video again
                </button>
                <a
                  href="/videos/miri.mp4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open the clip directly{" "}
                  <ArrowUpRight size={13} aria-hidden="true" />
                </a>
              </div>
            )}
          </div>
          <p className={styles.filmCaption}>
            <span>Mirabel, in motion.</span>
            <span>✧</span>
          </p>
        </div>
        <p id={descriptionId} className={styles.srOnly}>
          A 15-second portrait montage of Mirabel in a grey outfit with long
          braids, followed by a close-up. Use the video&apos;s play, pause,
          sound, and fullscreen controls.
        </p>
      </div>
    </section>
  );
}
