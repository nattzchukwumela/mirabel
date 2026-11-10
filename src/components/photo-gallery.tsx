"use client";

import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Expand,
  ImageOff,
  LoaderCircle,
  Sparkles,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import photos from "../../public/images/manifest.json";
import VideoKeepsake from "./video-keepsake";
import styles from "./photo-gallery.module.css";
import type { SoundKind } from "@/lib/use-experience-audio";

const ROTATIONS = [-3, 2, -1.8, 3, -2.4, 1.6, -2, 2.5, -1];

type PhotoGalleryProps = {
  soundOn?: boolean;
  volume?: number;
  onVideoPlay?: () => void;
  onSound?: (kind: SoundKind) => void;
};

export default function PhotoGallery({
  soundOn = true,
  volume = 0.35,
  onVideoPlay,
  onSound,
}: PhotoGalleryProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [canPrevious, setCanPrevious] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [visibleRange, setVisibleRange] = useState({ start: 1, end: 1 });
  const [failedThumbnails, setFailedThumbnails] = useState<Set<string>>(
    new Set(),
  );
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [retry, setRetry] = useState(0);

  const updateScroll = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setCanPrevious(rail.scrollLeft > 6);
    setCanNext(rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 6);
    const items = Array.from(
      rail.querySelectorAll<HTMLButtonElement>("[data-gallery-photo]"),
    );
    const visible = items.filter(
      (item) =>
        item.offsetLeft + item.offsetWidth > rail.scrollLeft + 2 &&
        item.offsetLeft < rail.scrollLeft + rail.clientWidth - 2,
    );
    if (visible.length) {
      const start = items.indexOf(visible[0]) + 1;
      const end = items.indexOf(visible[visible.length - 1]) + 1;
      setVisibleRange((previous) =>
        previous.start === start && previous.end === end
          ? previous
          : { start, end },
      );
    }
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    updateScroll();
    const observer = new ResizeObserver(updateScroll);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [updateScroll]);

  useEffect(() => {
    if (selected === null) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selected]);

  const scroll = (direction: number) => {
    const rail = railRef.current;
    if (!rail) return;
    onSound?.("click");
    const items = Array.from(
      rail.querySelectorAll<HTMLButtonElement>("[data-gallery-photo]"),
    );
    if (!items.length) return;
    const padding = parseFloat(window.getComputedStyle(rail).paddingLeft) || 0;
    const current = items.reduce(
      (nearest, item, index) =>
        Math.abs(item.offsetLeft - padding - rail.scrollLeft) <
        Math.abs(items[nearest].offsetLeft - padding - rail.scrollLeft)
          ? index
          : nearest,
      0,
    );
    const next = Math.max(0, Math.min(items.length - 1, current + direction));
    rail.scrollTo({
      left: Math.max(
        0,
        Math.min(
          items[next].offsetLeft - padding,
          rail.scrollWidth - rail.clientWidth,
        ),
      ),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  const openPhoto = (index: number, trigger: HTMLButtonElement) => {
    onSound?.("paper");
    triggerRef.current = trigger;
    setImageLoading(true);
    setImageError(false);
    setRetry(0);
    setSelected(index);
  };

  const changePhoto = (direction: number) => {
    onSound?.("click");
    setImageLoading(true);
    setImageError(false);
    setRetry(0);
    setSelected((current) =>
      current === null
        ? 0
        : (current + direction + photos.length) % photos.length,
    );
  };

  const close = () => {
    onSound?.("click");
    dialogRef.current?.close();
  };
  const photo = photos[selected ?? 0];

  return (
    <section
      id="memories"
      className={styles.section}
      aria-labelledby="memories-title"
    >
      <div className={styles.container}>
        <div className={styles.headingRow}>
          <div>
            <p className={styles.eyebrow}>
              <span /> A LITTLE INTERMISSION
            </p>
            <h2 id="memories-title">
              A few frames.
              <br />
              <em>So much Mirabel.</em>
            </h2>
          </div>
          <p className={styles.note}>
            <Sparkles size={24} strokeWidth={1.1} aria-hidden="true" />
            Proof that the main character energy
            <br className={styles.desktopBreak} /> was never in question.
          </p>
        </div>

        <div
          className={styles.rail}
          ref={railRef}
          onScroll={updateScroll}
          role="region"
          aria-label="Photographs of Mirabel"
          tabIndex={0}
        >
          {photos.map((item, index) => (
            <button
              key={item.src}
              type="button"
              className={styles.polaroid}
              data-gallery-photo
              style={
                {
                  "--rotation": `${ROTATIONS[index % ROTATIONS.length]}deg`,
                } as CSSProperties
              }
              aria-label={`Enlarge photograph ${index + 1}: ${item.alt}`}
              onClick={(event) => {
                openPhoto(index, event.currentTarget);
              }}
            >
              <span className={styles.photo}>
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="(max-width: 600px) 65vw, (max-width: 900px) 36vw, 290px"
                  style={{ objectPosition: item.objectPosition }}
                  onError={() =>
                    setFailedThumbnails((previous) =>
                      new Set(previous).add(item.src),
                    )
                  }
                  onLoad={() =>
                    setFailedThumbnails((previous) => {
                      if (!previous.has(item.src)) return previous;
                      const next = new Set(previous);
                      next.delete(item.src);
                      return next;
                    })
                  }
                />
                {index === 0 && (
                  <span className={styles.newest}>Newest photo</span>
                )}
                {failedThumbnails.has(item.src) && (
                  <span className={styles.thumbnailError}>
                    <ImageOff size={22} aria-hidden="true" />
                    <span>Tap to open photo</span>
                  </span>
                )}
                <span className={styles.expand}>
                  <Expand size={16} aria-hidden="true" />
                </span>
              </span>
              <span className={styles.caption}>{item.caption}</span>
              <span className={styles.photoNumber}>
                {String(index + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>

        <div className={styles.footer}>
          <p>
            <span
              className={styles.position}
              aria-live="polite"
              aria-atomic="true"
            >
              Showing {visibleRange.start}
              {visibleRange.end > visibleRange.start
                ? `–${visibleRange.end}`
                : ""}{" "}
              of {photos.length} photos
            </span>
            <span>Swipe to see more.</span>
          </p>
          <button
            type="button"
            className={styles.viewAll}
            onClick={(event) => openPhoto(0, event.currentTarget)}
          >
            View all {photos.length} photos{" "}
            <Expand size={13} aria-hidden="true" />
          </button>
          <div className={styles.arrows}>
            <button
              type="button"
              onClick={() => scroll(-1)}
              disabled={!canPrevious}
              aria-label="Previous photographs"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              disabled={!canNext}
              aria-label="Next photographs"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
        <VideoKeepsake soundOn={soundOn} volume={volume} onPlay={onVideoPlay} />
      </div>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="photo-caption"
        onClose={() => {
          setSelected(null);
          triggerRef.current?.focus({ preventScroll: true });
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            changePhoto(-1);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            changePhoto(1);
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className={styles.lightbox}>
          <button
            type="button"
            className={styles.close}
            aria-label="Close photograph"
            onClick={close}
            autoFocus
          >
            <X size={22} />
          </button>
          <div className={styles.lightboxPhoto}>
            <Image
              key={`${photo.src}-${retry}`}
              src={retry ? `${photo.src}?retry=${retry}` : photo.src}
              alt={photo.alt}
              fill
              loading="eager"
              sizes="(max-width: 700px) 90vw, 650px"
              style={{
                objectFit: "contain",
                visibility: imageError ? "hidden" : "visible",
              }}
              onLoad={() => {
                setImageLoading(false);
                setImageError(false);
              }}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
            {imageLoading && (
              <span className={styles.loadingPhoto} role="status">
                <LoaderCircle size={22} aria-hidden="true" /> Loading photo…
              </span>
            )}
            {imageError && (
              <div className={styles.imageError} role="alert">
                <ImageOff size={30} aria-hidden="true" />
                <p>This photo couldn&apos;t load.</p>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setImageError(false);
                      setImageLoading(true);
                      setRetry((previous) => previous + 1);
                    }}
                  >
                    Try again
                  </button>
                  <a href={photo.src} target="_blank" rel="noreferrer">
                    Open photo
                  </a>
                </div>
              </div>
            )}
          </div>
          <div className={styles.lightboxFooter}>
            <button
              type="button"
              onClick={() => changePhoto(-1)}
              aria-label="Previous photograph"
            >
              <ArrowLeft size={19} />
            </button>
            <div aria-live="polite" aria-atomic="true">
              <p id="photo-caption">{photo.caption}</p>
              <span>
                {(selected ?? 0) + 1} / {photos.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => changePhoto(1)}
              aria-label="Next photograph"
            >
              <ArrowRight size={19} />
            </button>
          </div>
        </div>
      </dialog>
    </section>
  );
}
