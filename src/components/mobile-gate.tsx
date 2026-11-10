"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  Laptop,
  Lightbulb,
  Lock,
  ShieldAlert,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { SoundKind } from "@/lib/use-experience-audio";

const MOBILE_BYPASS_PASSWORD = "redmi 12c";
const STORAGE_KEY = "mirabel-mobile-unlocked";

export type MobileDeviceState = {
  isPhone: boolean;
  isInfinixHot60i: boolean;
};

type NavigatorUAData = {
  mobile?: boolean;
  platform?: string;
  getHighEntropyValues?: (
    hints: string[],
  ) => Promise<{ model?: string; platform?: string }>;
};

export function detectMobileFromUA(
  userAgent: string,
  model = "",
  isUADataMobile = false,
): MobileDeviceState {
  const combined = `${userAgent} ${model}`.trim();

  const isInfinixHot60i =
    /infinix\s*hot\s*60i|hot\s*60i|x6728|infinix/i.test(combined);

  const isPhoneUA =
    isUADataMobile ||
    isInfinixHot60i ||
    /Android.*Mobile|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone|Mobile.*Firefox|TECNO|itel|Redmi|Mobile Safari/i.test(
      combined,
    );

  return {
    isPhone: isPhoneUA,
    isInfinixHot60i,
  };
}

type MobileGateProps = {
  onSound?: (kind: SoundKind) => void;
  /** Optional override for testing */
  forceDevice?: MobileDeviceState | null;
};

export default function MobileGate({
  onSound,
  forceDevice = null,
}: MobileGateProps) {
  const [device, setDevice] = useState<MobileDeviceState>({
    isPhone: false,
    isInfinixHot60i: false,
  });
  const [unlocked, setUnlocked] = useState(false);
  const [caughtMirabel, setCaughtMirabel] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (forceDevice) {
      setDevice(forceDevice);
      return;
    }

    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "true") {
        setUnlocked(true);
      }
    } catch {
      /* Ignore storage errors */
    }

    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const uaData =
      typeof navigator !== "undefined"
        ? (navigator as Navigator & { userAgentData?: NavigatorUAData })
            .userAgentData
        : undefined;

    const initial = detectMobileFromUA(ua, "", Boolean(uaData?.mobile));
    setDevice(initial);

    if (uaData?.getHighEntropyValues) {
      uaData
        .getHighEntropyValues(["model", "platform"])
        .then((values) => {
          if (values?.model) {
            setDevice(
              detectMobileFromUA(
                ua,
                values.model,
                Boolean(uaData?.mobile),
              ),
            );
          }
        })
        .catch(() => {
          /* High-entropy hints are optional */
        });
    }
  }, [forceDevice]);

  const activeDevice = forceDevice ?? device;
  const isInfinix = activeDevice.isInfinixHot60i || caughtMirabel;
  const shouldBlock = activeDevice.isPhone && !unlocked;

  useEffect(() => {
    if (!shouldBlock) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [shouldBlock]);

  if (!shouldBlock) return null;

  const handleUnlock = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = password.trim().toLowerCase();

    if (!cleaned) {
      setError("Please enter the password or switch to a PC.");
      onSound?.("error");
      triggerShake();
      return;
    }

    if (cleaned === MOBILE_BYPASS_PASSWORD) {
      setError("");
      onSound?.("success");
      setUnlocked(true);
      try {
        sessionStorage.setItem(STORAGE_KEY, "true");
      } catch {
        /* Ignore storage errors */
      }
      return;
    }

    if (/praise|mirabel|infinix|hot\s*60/i.test(cleaned)) {
      onSound?.("error");
      triggerShake();
      setCaughtMirabel(true);
      return;
    }

    setError(
      "Wrong password! Please use a PC to view this site, or enter the valid mobile password.",
    );
    onSound?.("error");
    triggerShake();
    setPassword("");
  };

  const triggerShake = () => {
    setShaking(false);
    setTimeout(() => setShaking(true), 10);
    setTimeout(() => setShaking(false), 460);
  };

  return (
    <div
      className="mobile-gate-backdrop"
      role="region"
      aria-label="Desktop experience required"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`mobile-gate-card ${shaking ? "secret-shake" : ""}`}
      >
        <div className="mobile-gate-badge">
          {isInfinix ? (
            <>
              <ShieldAlert size={14} />
              <span>INFINIX HOT 60i DETECTED</span>
            </>
          ) : (
            <>
              <Smartphone size={14} />
              <span>PHONE DETECTED · PC REQUIRED</span>
            </>
          )}
        </div>

        <div className="mobile-gate-icon-row" aria-hidden="true">
          <span className="mobile-gate-icon-phone">
            <Smartphone size={24} />
          </span>
          <span className="mobile-gate-arrow">→</span>
          <span className="mobile-gate-icon-pc">
            <Laptop size={28} />
          </span>
        </div>

        {isInfinix ? (
          <div className="mobile-gate-body">
            <h2 className="mobile-gate-title">
              No tricks, Mirabel!
              <br />
              <em>Go use your PC.</em>
            </h2>
            <p className="mobile-gate-text">
              I see you trying to open this on your{" "}
              <strong>Infinix Hot 60i</strong>. 👀 No tricks allowed — you are
              not viewing this from your phone!
            </p>
            <div className="mobile-gate-callout">
              <Laptop size={18} />
              <span>
                Put the Infinix Hot 60i down and open this link on your{" "}
                <strong>PC</strong> to see what I made for you.
              </span>
            </div>
            <p className="mobile-gate-signature handwritten">
              Nice try though. Go get your laptop! ✨
            </p>
          </div>
        ) : (
          <div className="mobile-gate-body">
            <h2 className="mobile-gate-title">
              Please use a PC
              <br />
              <em>to view this site.</em>
            </h2>
            <p className="mobile-gate-text">
              Phones are blocked for this experience. Please open this website
              on a <strong>PC or laptop</strong> to view it properly.
            </p>
            <div className="mobile-gate-callout">
              <Laptop size={18} />
              <span>
                Best experienced on a PC screen. Or enter the mobile password
                below to unlock phone access.
              </span>
            </div>

            <form onSubmit={handleUnlock} className="mobile-gate-form">
              <label
                htmlFor="mobile-gate-password"
                className="secret-input-label"
              >
                Mobile Access Password
              </label>
              <div className="secret-input-wrapper">
                <KeyRound size={15} className="secret-input-icon" />
                <input
                  id="mobile-gate-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter password to use on phone..."
                  autoComplete="off"
                  className={`secret-text-input ${error ? "input-has-error" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-[92px] text-[var(--muted)] hover:text-[var(--ink)] p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button type="submit" className="secret-unlock-btn">
                  <span>Unlock</span>
                  <Sparkles size={13} />
                </button>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="secret-feedback-error"
                    role="alert"
                  >
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="secret-clue-bar">
                <button
                  type="button"
                  className="secret-clue-btn"
                  onClick={() => {
                    setShowHint((prev) => !prev);
                    onSound?.("sparkle");
                  }}
                >
                  <Lightbulb size={13} />
                  <span>{showHint ? "Hide hint" : "Need a hint?"}</span>
                </button>
              </div>

              <AnimatePresence>
                {showHint && (
                  <motion.div
                    className="secret-hint-box"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 6 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  >
                    <span className="font-semibold text-[var(--gold)]">
                      💡 Hint:
                    </span>{" "}
                    the name of my old phone
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        )}

        <div className="mobile-gate-footer">
          <span className="inline-flex items-center gap-1.5">
            <Lock size={12} /> Mobile Blocker Active
          </span>
          <span>The Mirabel Experience</span>
        </div>
      </motion.div>
    </div>
  );
}
