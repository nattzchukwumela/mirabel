"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock,
  Unlock,
  KeyRound,
  Heart,
  Sparkles,
  Lightbulb,
  Check,
  Copy,
  X,
  Music2,
  Volume2,
  VolumeX,
  ShieldCheck,
  ArrowRight,
  Pause,
  Play,
} from "lucide-react";

interface SecretDialogueProps {
  isOpen: boolean;
  onClose: () => void;
  audio: {
    musicOn: boolean;
    soundOn: boolean;
    toggleMusic: () => void;
    toggleSound: () => void;
    playEffect: (kind: "error" | "success" | "sparkle") => void;
  };
  onTriggerConfetti?: () => void;
  onOpenMusicPrompt?: () => void;
}

const FUNNY_ERRORS = [
  "Nice try, Mirabel! You know me better than that.",
  "Wrong! Think about the other guy...",
  "Access Denied! Give me back my sweatshirts first.",
  "Nope! That's not the password, detective.",
  "Incorrect. Call the other guy for help maybe?",
];

const LETTER_TEXT = `Hey Mirabel,

I know I can be a handful and I know I don't always say much—half the time that’s why I cut conversations short—but I need you to know something: I genuinely care about you. Honestly, I love you.

I see the way you treat me, the subtle ways you look out for me, and how much you care. None of it goes unnoticed, and I truly appreciate having you in my corner.

From your end, expect to see even more moving forward. Because even when words fail me, showing up and showing love is what I actually know how to do best.

Hope you enjoy this little surprise.

Always yours,
Nattz`;

export default function SecretDialogue({
  isOpen,
  onClose,
  audio,
  onTriggerConfetti,
  onOpenMusicPrompt,
}: SecretDialogueProps) {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shaking, setShaking] = useState(false);
  const errorIndexRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isUnlocked) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isUnlocked]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleUnlockAttempt = () => {
    const clean = password.trim().toLowerCase();

    // Required password: praise
    if (clean === "praise") {
      audio.playEffect("success");
      onTriggerConfetti?.();
      setIsUnlocked(true);
      setErrorMsg("");

      // Prompt for music if music is currently off
      if (!audio.musicOn && onOpenMusicPrompt) {
        setTimeout(() => {
          onOpenMusicPrompt();
        }, 1200);
      }
    } else {
      audio.playEffect("error");
      setShaking(true);
      setTimeout(() => setShaking(false), 450);

      const nextMsg =
        FUNNY_ERRORS[errorIndexRef.current % FUNNY_ERRORS.length];
      errorIndexRef.current += 1;
      setErrorMsg(nextMsg);
      inputRef.current?.focus();
    }
  };

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(LETTER_TEXT);
      } else {
        const dummy = document.createElement("textarea");
        document.body.appendChild(dummy);
        dummy.value = LETTER_TEXT;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
      }
      setCopied(true);
      audio.playEffect("sparkle");
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // Fallback
    }
  };

  const handleRelock = () => {
    audio.playEffect("sparkle");
    setIsUnlocked(false);
    setPassword("");
    setErrorMsg("");
    setShowHint(false);
  };

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
            ref={cardRef}
            className={`secret-card ${shaking ? "secret-shake" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="secret-card-title"
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 14 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            {/* Header Ornament */}
            <div className="secret-card-header">
              <div className="secret-header-left">
                <div
                  className={`secret-avatar ${isUnlocked ? "secret-avatar-unlocked" : "secret-avatar-locked"
                    }`}
                >
                  {isUnlocked ? (
                    <Heart size={20} className="heart-pulse text-[var(--gold)]" />
                  ) : (
                    <Lock size={19} className="text-[var(--purple)]" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="secret-sender-name">From: Nattz</span>
                    <span className="secret-pill-badge">Special Delivery</span>
                  </div>
                  <p className="secret-recipient-sub">
                    To: Mirabel •{" "}
                    <span className="italic">Personal Access Only</span>
                  </p>
                </div>
              </div>

              <div className="secret-header-right">
                <span
                  className={`secret-status-tag ${isUnlocked ? "status-unlocked" : "status-locked"
                    }`}
                >
                  {isUnlocked ? (
                    <>
                      <ShieldCheck size={12} /> Decrypted
                    </>
                  ) : (
                    <>
                      <Lock size={11} /> Locked
                    </>
                  )}
                </span>
                <button
                  type="button"
                  className="secret-close-btn"
                  onClick={onClose}
                  aria-label="Close dialogue"
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Music notification bar inside dialogue */}
            <div className="secret-music-banner">
              <div className="flex items-center gap-2">
                <Music2
                  size={15}
                  className={
                    audio.musicOn
                      ? "text-[var(--purple)] animate-pulse"
                      : "text-[var(--muted)]"
                  }
                />
                <span className="text-xs text-[var(--muted)] font-medium">
                  {audio.musicOn
                    ? "Soundtrack playing in background"
                    : "Want some background music while you read?"}
                </span>
              </div>
              <button
                type="button"
                className="secret-music-toggle-btn"
                onClick={audio.toggleMusic}
                aria-label={audio.musicOn ? "Pause music" : "Play music"}
              >
                {audio.musicOn ? (
                  <>
                    <Pause size={12} />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={12} fill="currentColor" />
                    <span>Play music</span>
                  </>
                )}
              </button>
            </div>

            {/* VIEW 1: LOCKED VIEW */}
            {!isUnlocked && (
              <div className="secret-locked-view">
                {/* Teaser note */}
                <div className="secret-teaser-bubble">
                  <p className="font-semibold text-[var(--ink)]">Hey Mirabel,</p>
                  <p>
                    Because I am the way I am, there’s no way I’m letting you get
                    to the juicy details without earning it. Consider this sweet
                    payback for taking my earpiece and my two sweatshirts.
                  </p>
                  <p className="text-[var(--muted)] text-xs italic">
                    I’m Nattz, and you already know I never do anything without
                    making it just a little difficult for the people I actually
                    care about.
                  </p>
                </div>

                {/* Password form */}
                <div className="secret-form-section">
                  <label
                    htmlFor="secretPasswordInput"
                    className="secret-input-label"
                  >
                    Enter Secret Password to Decrypt:
                  </label>

                  <div className="secret-input-wrapper">
                    <KeyRound size={15} className="secret-input-icon" />
                    <input
                      id="secretPasswordInput"
                      ref={inputRef}
                      type="text"
                      autoComplete="off"
                      placeholder="Enter the magic password..."
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMsg) setErrorMsg("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUnlockAttempt();
                      }}
                      className={`secret-text-input ${errorMsg ? "input-has-error" : ""
                        }`}
                      aria-label="Secret password"
                    />
                    <button
                      type="button"
                      className="secret-unlock-btn"
                      onClick={handleUnlockAttempt}
                    >
                      <span>Unlock</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  {/* Dynamic error feedback */}
                  {errorMsg && (
                    <motion.div
                      className="secret-feedback-error"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Sparkles size={13} className="text-rose-500 shrink-0" />
                      <span>{errorMsg}</span>
                    </motion.div>
                  )}

                  {/* Hint toggle */}
                  <div className="secret-clue-bar">
                    <button
                      type="button"
                      className="secret-clue-btn"
                      onClick={() => {
                        setShowHint(!showHint);
                        audio.playEffect("sparkle");
                      }}
                    >
                      <Lightbulb size={13} />
                      <span>{showHint ? "Hide clue" : "Need a clue?"}</span>
                    </button>
                    <span className="secret-passcode-len">
                      Passcode length: 6 letters
                    </span>
                  </div>

                  {/* Revealed Hint */}
                  <AnimatePresence>
                    {showHint && (
                      <motion.div
                        className="secret-hint-box"
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      >
                        <span className="font-semibold text-[var(--gold)]">
                          💡 Hint:
                        </span>{" "}
                        the name of the other guy
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* VIEW 2: UNLOCKED VIEW */}
            {isUnlocked && (
              <motion.div
                className="secret-unlocked-view"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
              >
                {/* Heart Banner */}
                <div className="secret-unlocked-banner">
                  <div className="secret-heart-bubble">
                    <Heart size={26} className="text-[var(--gold)] fill-[var(--gold)]" />
                  </div>
                  <p className="secret-eyebrow">
                    ✧ DECRYPTED NOTE ✧
                  </p>
                  <h2 id="secret-card-title" className="secret-unlocked-title">
                    Straight From The Heart
                  </h2>
                </div>

                {/* Heartfelt refined letter */}
                <div className="secret-letter-card">
                  <p className="font-semibold text-[var(--purple)] text-base">
                    Hey Mirabel,
                  </p>

                  <p>
                    I know I can be a handful and I know I don't always say
                    much—half the time that’s why I cut conversations short—but
                    I need you to know something:{" "}
                    <span className="secret-letter-highlight">
                      I genuinely care about you. Honestly, I love you.
                    </span>
                  </p>

                  <p className="text-[var(--ink)]/90">
                    I see the way you treat me, the subtle ways you look out
                    for me, and how much you care. None of it goes unnoticed,
                    and I truly appreciate having you in my corner.
                  </p>

                  <p className="text-[var(--ink)]/90">
                    From your end, expect to see even more moving forward. Because
                    even when words fail me, showing up and showing love is what
                    I actually know how to do best.
                  </p>

                  <p className="italic text-[var(--purple)] pt-1 font-medium">
                    Hope you enjoy this little surprise.
                  </p>

                  <div className="secret-signature-box">
                    <div>
                      <span className="block text-xs text-[var(--muted)]">
                        Always yours,
                      </span>
                      <span className="secret-handwritten-signature">Nattz</span>
                    </div>
                    <div className="secret-signature-flourish">❦</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="secret-actions-row">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="secret-action-btn action-copy"
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="text-emerald-500" />
                        <span>Copied to Clipboard! ✨</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Letter</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleRelock}
                    className="secret-action-btn action-relock"
                  >
                    <Lock size={14} />
                    <span>Lock Back Up</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="secret-action-btn action-explore"
                  >
                    <Sparkles size={14} />
                    <span>Explore Page</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Footer micro note */}
            <div className="secret-card-footer">
              <span>P.S. Yes, I still want my sweatshirts back.</span>
              <span>✨ Made with love</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

