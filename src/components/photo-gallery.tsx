"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Expand, Sparkles, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import photos from "../../public/images/manifest.json";
import styles from "./photo-gallery.module.css";

const ROTATIONS = [-3, 2, -1.8, 3, -2.4, 1.6, -2, 2.5, -1];

export default function PhotoGallery() {
  const railRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [canPrevious, setCanPrevious] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateScroll = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setCanPrevious(rail.scrollLeft > 6);
    setCanNext(rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 6);
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
    const photo = rail.querySelector<HTMLButtonElement>("button");
    const distance = (photo?.offsetWidth ?? 260) + 28;
    rail.scrollBy({
      left: direction * distance,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  const changePhoto = (direction: number) => {
    setSelected((current) =>
      current === null
        ? 0
        : (current + direction + photos.length) % photos.length,
    );
  };

  const close = () => dialogRef.current?.close();
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
              style={
                {
                  "--rotation": `${ROTATIONS[index % ROTATIONS.length]}deg`,
                } as CSSProperties
              }
              aria-label={`Enlarge photograph ${index + 1}: ${item.alt}`}
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                setSelected(index);
              }}
            >
              <span className={styles.photo}>
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 600px) 65vw, (max-width: 900px) 36vw, 290px"
                  style={{ objectPosition: item.objectPosition }}
                />
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
            A little collection of very good energy.{" "}
            <span>Swipe to see more.</span>
          </p>
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
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 700px) 90vw, 650px"
              style={{ objectFit: "contain" }}
            />
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
