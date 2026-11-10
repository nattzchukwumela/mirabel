"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Music2, Play, VolumeX, X, Sparkles } from "lucide-react";

interface MusicPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  musicOn: boolean;
}

export default function MusicPromptDialog({
  isOpen,
  onClose,
  onAccept,
  musicOn,
}: MusicPromptDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="secret-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          role="presentation"
        >
          <motion.div
            ref={dialogRef}
            className="music-prompt-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="music-prompt-heading"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
          >
            <button
              className="secret-close-btn"
              onClick={onClose}
              aria-label="Close music prompt"
            >
              <X size={18} strokeWidth={1.5} />
            </button>

            <div className="music-prompt-icon-wrap">
              <motion.div
                className="music-prompt-icon"
                animate={{ rotate: [0, -6, 6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Music2 size={26} strokeWidth={1.6} />
              </motion.div>
            </div>

            <p className="secret-eyebrow">
              <Sparkles size={11} className="inline mr-1 text-[var(--gold)]" />
              SET THE ATMOSPHERE
              <Sparkles size={11} className="inline ml-1 text-[var(--gold)]" />
            </p>

            <h2 id="music-prompt-heading" className="music-prompt-title">
              A Little Music for Mirabel?
            </h2>

            <p className="music-prompt-desc">
              This experience features a soft, original music-box melody composed
              specifically for this page. Would you like to listen to the music while
              you explore?
            </p>

            <div className="music-prompt-actions">
              <button
                type="button"
                className="music-prompt-btn-primary"
                onClick={onAccept}
                autoFocus
              >
                <Play size={15} fill="currentColor" />
                <span>{musicOn ? "Keep music playing" : "Yes, play the music"}</span>
              </button>
              <button
                type="button"
                className="music-prompt-btn-secondary"
                onClick={onClose}
              >
                <VolumeX size={15} />
                <span>Keep it quiet</span>
              </button>
            </div>

            <p className="music-prompt-hint">
              You can always adjust the volume or mute anytime with the floating mood
              pill at the bottom. ✧
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

