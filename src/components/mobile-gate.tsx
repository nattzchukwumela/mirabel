"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  AlertCircle,
  Cpu,
  Eye,
  EyeOff,
  HardDrive,
  KeyRound,
  Laptop,
  Lightbulb,
  Lock,
  Monitor,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Tablet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { SoundKind } from "@/lib/use-experience-audio";

// Salted hash helper so answers never appear in code/bundles as searchable plaintext.
// Mirabel cannot find "redmi 12c", "mediatek", "3", or "64" by searching site code.
function hashAnswer(val: string, salt: number): string {
  let h1 = 0xdeadbeef ^ salt;
  let h2 = 0x41c6ce57 ^ (salt << 1);
  const s = `nattz_${salt}_${val.trim()}_mirabel`;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

// Obfuscated digests of required answers
const HASH_STEP1 = "uhvfrl9ol6"; // step 1 (redmi 12c)
const HASH_STEP2_RAM = "1eqv6wmx5my"; // 3
const HASH_STEP2_ROM_A = "19h21hxhcgz"; // 64
const HASH_STEP2_ROM_B = "1z2c662cx67"; // 64gb
const HASH_STEP3 = "e6pxx0fj9u"; // mediatek
const SESSION_TOKEN = "1f577zoxrj6";

const STORAGE_KEY = "mirabel-mobile-session-token";

export type DeviceKind =
  | "phone"
  | "phone_pc_mode"
  | "tablet"
  | "infinix"
  | "desktop";

export type DeviceDetectionResult = {
  kind: DeviceKind;
  label: string;
};

export function detectDevice(
  userAgent: string,
  model = "",
  isUADataMobile = false,
  touchPoints = 0,
  screenWidth = 1920,
  isCoarsePointer = false,
): DeviceDetectionResult {
  const combined = `${userAgent} ${model}`.trim();

  // Explicit Infinix Hot 60i detection
  if (/infinix\s*hot\s*60i|hot\s*60i|x6728|infinix/i.test(combined)) {
    return { kind: "infinix", label: "Infinix Hot 60i" };
  }

  // Tablet check
  if (
    /iPad|tablet|(android(?!.*mobile))/i.test(combined) ||
    (touchPoints > 1 && screenWidth >= 600 && screenWidth <= 1024)
  ) {
    return { kind: "tablet", label: "Tablet / iPad" };
  }

  // Normal Mobile Phone check
  const isMobileUA =
    isUADataMobile ||
    /Android.*Mobile|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone|Mobile.*Firefox|TECNO|itel|Redmi|Mobile Safari/i.test(
      combined,
    );

  if (isMobileUA) {
    return { kind: "phone", label: "Mobile Phone" };
  }

  // Phone in "PC Mode" / "Desktop site" detection:
  // Browser sends a desktop-like UA, but has touchpoints and mobile screen size or coarse pointer
  if (touchPoints > 0 && (screenWidth < 900 || isCoarsePointer)) {
    return { kind: "phone_pc_mode", label: "Phone in PC Mode" };
  }

  return { kind: "desktop", label: "Computer / PC" };
}

// Backwards compatibility wrapper for tests
export function detectMobileFromUA(
  userAgent: string,
  model = "",
  isUADataMobile = false,
) {
  const res = detectDevice(userAgent, model, isUADataMobile);
  return {
    isPhone: res.kind === "phone" || res.kind === "phone_pc_mode" || res.kind === "infinix",
    isInfinixHot60i: res.kind === "infinix",
  };
}

type MobileGateProps = {
  onSound?: (kind: SoundKind) => void;
  /** Optional override for testing */
  forceDevice?: DeviceDetectionResult | null;
  defaultOpen?: boolean;
};

export default function MobileGate({
  onSound,
  forceDevice = null,
  defaultOpen,
}: MobileGateProps) {
  const [device, setDevice] = useState<DeviceDetectionResult>({
    kind: "desktop",
    label: "Computer / PC",
  });
  const [unlocked, setUnlocked] = useState(false);
  const [caughtMirabel, setCaughtMirabel] = useState(false);

  // Multi-step stress quiz: 1 = Phone Model, 2 = RAM/ROM, 3 = CPU
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [stepSuccessMsg, setStepSuccessMsg] = useState("");

  // Step 1: Phone Model
  const [step1Input, setStep1Input] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: RAM & ROM
  const [ramInput, setRamInput] = useState(""); // numbers only
  const [romInput, setRomInput] = useState("");

  // Step 3: CPU
  const [cpuInput, setCpuInput] = useState("");

  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (forceDevice) {
      setDevice(forceDevice);
      return;
    }

    try {
      if (sessionStorage.getItem(STORAGE_KEY) === SESSION_TOKEN) {
        setUnlocked(true);
      }
    } catch {
      /* Ignore storage errors */
    }

    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const uaData =
      typeof navigator !== "undefined"
        ? (
            navigator as Navigator & {
              userAgentData?: {
                mobile?: boolean;
                platform?: string;
                getHighEntropyValues?: (
                  hints: string[],
                ) => Promise<{ model?: string; platform?: string }>;
              };
            }
          ).userAgentData
        : undefined;

    const touchPoints =
      typeof navigator !== "undefined" ? navigator.maxTouchPoints || 0 : 0;
    const screenWidth =
      typeof window !== "undefined"
        ? window.innerWidth || window.screen.width || 1920
        : 1920;
    const isCoarsePointer =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(pointer: coarse)").matches
        : false;

    const initial = detectDevice(
      ua,
      "",
      Boolean(uaData?.mobile),
      touchPoints,
      screenWidth,
      isCoarsePointer,
    );
    setDevice(initial);

    if (uaData?.getHighEntropyValues) {
      uaData
        .getHighEntropyValues(["model", "platform"])
        .then((values) => {
          if (values?.model) {
            setDevice(
              detectDevice(
                ua,
                values.model,
                Boolean(uaData?.mobile),
                touchPoints,
                screenWidth,
                isCoarsePointer,
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
  const currentKind: DeviceKind = caughtMirabel
    ? "infinix"
    : activeDevice.kind;

  // Active on all devices (phone, tab, PC, computer) unless unlocked
  const isGateBlocked = defaultOpen ?? (process.env.NODE_ENV !== "test");
  const shouldBlock = isGateBlocked && !unlocked;

  useEffect(() => {
    if (!shouldBlock) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [shouldBlock]);

  if (!shouldBlock) return null;

  const triggerShake = () => {
    setShaking(false);
    setTimeout(() => setShaking(true), 10);
    setTimeout(() => setShaking(false), 460);
  };

  // Step 1 Submission: Phone Model
  const handleStep1 = (e: FormEvent) => {
    e.preventDefault();
    const raw = step1Input.trim();

    if (!raw) {
      setError("Please enter the password to continue! 😂");
      onSound?.("error");
      triggerShake();
      return;
    }

    // Strict lowercase rule: reject ANY uppercase
    if (/[A-Z]/.test(raw)) {
      setError(
        "Uppercase letter detected! 😂 All passwords must be strictly in lowercase! No capital letters allowed.",
      );
      onSound?.("error");
      triggerShake();
      return;
    }

    // Safeguard: caught mirabel
    if (/praise|mirabel|infinix|hot\s*60/i.test(raw)) {
      onSound?.("error");
      triggerShake();
      setCaughtMirabel(true);
      return;
    }

    if (hashAnswer(raw, 1337) === HASH_STEP1) {
      setError("");
      setShowHint(false);
      onSound?.("sparkle");
      setStepSuccessMsg(
        "Wait, you actually got that?! 😂 Don't celebrate yet, you thought it was just one question? 😂 Step 2 unlocked!",
      );
      setStep(2);
    } else {
      setError(
        "Wrong password! 😂 Nice try, but you're not getting in that easily! Try again or check the hint.",
      );
      onSound?.("error");
      triggerShake();
      setStep1Input("");
    }
  };

  // Step 2 Submission: RAM & ROM
  const handleStep2 = (e: FormEvent) => {
    e.preventDefault();
    const rawRam = ramInput.trim();
    const rawRom = romInput.trim();

    if (!rawRam || !rawRom) {
      setError("Please enter both RAM and ROM amounts! 😂");
      onSound?.("error");
      triggerShake();
      return;
    }

    // RAM must be numbers only
    if (!/^\d+$/.test(rawRam)) {
      setError("RAM must be numbers only! 😂 (e.g. 3)");
      onSound?.("error");
      triggerShake();
      return;
    }

    // ROM lowercase check
    if (/[A-Z]/.test(rawRom)) {
      setError(
        "Uppercase letter detected in ROM! 😂 Everything must be strictly lowercase!",
      );
      onSound?.("error");
      triggerShake();
      return;
    }

    const ramHash = hashAnswer(rawRam, 2468);
    const romHash = hashAnswer(rawRom, 3579);

    const isRamCorrect = ramHash === HASH_STEP2_RAM;
    const isRomCorrect =
      romHash === HASH_STEP2_ROM_A || romHash === HASH_STEP2_ROM_B;

    if (isRamCorrect && isRomCorrect) {
      setError("");
      setShowHint(false);
      onSound?.("sparkle");
      setStepSuccessMsg(
        "Okay wow, you really know your phone specs 😂 But I told you I'm going to stress you! 😂 Final boss question...",
      );
      setStep(3);
    } else {
      setError(
        "Wrong RAM or ROM! 😂 Nice try though, go check the device specs or go use your PC!",
      );
      onSound?.("error");
      triggerShake();
    }
  };

  // Step 3 Submission: CPU Manufacturer
  const handleStep3 = (e: FormEvent) => {
    e.preventDefault();
    const rawCpu = cpuInput.trim();

    if (!rawCpu) {
      setError("Please enter the CPU manufacturer name! 😂");
      onSound?.("error");
      triggerShake();
      return;
    }

    // Strict lowercase rule
    if (/[A-Z]/.test(rawCpu)) {
      setError(
        "Uppercase detected! 😂 Strictly lowercase only! No capital letters allowed.",
      );
      onSound?.("error");
      triggerShake();
      return;
    }

    if (hashAnswer(rawCpu, 4680) === HASH_STEP3) {
      setError("");
      onSound?.("success");
      setStepSuccessMsg(
        "Fine, you win!! 😂 You really stressed yourself just to view this, unbelievable 😂 Enjoy the site!",
      );
      try {
        sessionStorage.setItem(STORAGE_KEY, SESSION_TOKEN);
      } catch {
        /* Ignore storage errors */
      }
      setTimeout(() => {
        setUnlocked(true);
      }, 1200);
    } else {
      setError(
        "Wrong CPU manufacturer! 😂 Go Google it or call your tech friends!",
      );
      onSound?.("error");
      triggerShake();
    }
  };

  return (
    <div
      className="mobile-gate-backdrop"
      role="region"
      aria-label="Security check required"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`mobile-gate-card ${shaking ? "secret-shake" : ""}`}
      >
        {/* Device-Specific Badge */}
        <div className="mobile-gate-badge">
          {currentKind === "infinix" ? (
            <>
              <ShieldAlert size={14} />
              <span>INFINIX HOT 60i DETECTED</span>
            </>
          ) : currentKind === "phone_pc_mode" ? (
            <>
              <ShieldAlert size={14} />
              <span>PC MODE ON PHONE DETECTED 😂</span>
            </>
          ) : currentKind === "tablet" ? (
            <>
              <Tablet size={14} />
              <span>TABLET DETECTED · VERIFICATION REQUIRED</span>
            </>
          ) : currentKind === "desktop" ? (
            <>
              <Monitor size={14} />
              <span>COMPUTER DETECTED · VERIFICATION REQUIRED</span>
            </>
          ) : (
            <>
              <Smartphone size={14} />
              <span>PHONE DETECTED · PC REQUIRED</span>
            </>
          )}
        </div>

        {/* Device Icon Visualizer */}
        <div className="mobile-gate-icon-row" aria-hidden="true">
          {currentKind === "phone" ? (
            <>
              <span className="mobile-gate-icon-phone">
                <Smartphone size={24} />
              </span>
              <span className="mobile-gate-arrow">→</span>
              <span className="mobile-gate-icon-pc">
                <Laptop size={28} />
              </span>
            </>
          ) : currentKind === "phone_pc_mode" ? (
            <>
              <span className="mobile-gate-icon-phone">
                <Smartphone size={24} />
              </span>
              <span className="mobile-gate-arrow">⚠️</span>
              <span className="mobile-gate-icon-pc">
                <Laptop size={28} />
              </span>
            </>
          ) : currentKind === "tablet" ? (
            <>
              <span className="mobile-gate-icon-pc">
                <Tablet size={26} />
              </span>
            </>
          ) : currentKind === "infinix" ? (
            <>
              <span className="mobile-gate-icon-phone">
                <Smartphone size={24} />
              </span>
            </>
          ) : (
            <>
              <span className="mobile-gate-icon-pc">
                <Monitor size={28} />
              </span>
            </>
          )}
        </div>

        {/* Content Body Based on Device / Context */}
        <div className="mobile-gate-body">
          {currentKind === "phone_pc_mode" ? (
            <>
              <h2 className="mobile-gate-title">
                Nice try using PC mode! 😂
                <br />
                <em>Did you think that would work?</em>
              </h2>
              <p className="mobile-gate-text">
                Did you really think turning on <strong>&quot;Desktop site&quot; / &quot;PC Mode&quot;</strong> on your phone would sneak you past me?! You thought you were so slick! 😂
              </p>
              <div className="mobile-gate-callout">
                <Laptop size={18} />
                <span>
                  No cheating allowed, Mirabel! Regardless of phone, tablet, or PC mode, you still have to pass my stress quiz below to enter! 😂
                </span>
              </div>
            </>
          ) : currentKind === "infinix" ? (
            <>
              <h2 className="mobile-gate-title">
                No tricks, Mirabel!
                <br />
                <em>Go use your PC.</em>
              </h2>
              <p className="mobile-gate-text">
                I see you trying to open this on your{" "}
                <strong>Infinix Hot 60i</strong>. 👀 No tricks allowed — you are
                not escaping this stress quiz! 😂
              </p>
              <div className="mobile-gate-callout">
                <Laptop size={18} />
                <span>
                  Put the Infinix Hot 60i down and use a PC, or solve all 3 stress questions below if you dare! 😂
                </span>
              </div>
            </>
          ) : currentKind === "tablet" ? (
            <>
              <h2 className="mobile-gate-title">
                Tablet detected! 😂
                <br />
                <em>Still not a PC!</em>
              </h2>
              <p className="mobile-gate-text">
                Wait, is that a tablet?! 😂 Nice attempt, but you still have to pass my stress quiz before viewing this site!
              </p>
              <div className="mobile-gate-callout">
                <Tablet size={18} />
                <span>
                  Tablet, phone, or computer—no free passes here! Answer the questions below to unlock access.
                </span>
              </div>
            </>
          ) : currentKind === "desktop" ? (
            <>
              <h2 className="mobile-gate-title">
                Computer detected! 😂
                <br />
                <em>You still have to unlock it!</em>
              </h2>
              <p className="mobile-gate-text">
                You didn&apos;t think being on a computer meant you get a free pass, did you?! 😂
              </p>
              <div className="mobile-gate-callout">
                <Laptop size={18} />
                <span>
                  No matter what device you use, you still have to solve my stress quiz below before you get to explore! 😂
                </span>
              </div>
            </>
          ) : (
            <>
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
                  Really, you are using a phone?! 😂 I told you not to cheat jeez,
                  use a PC! But if you really insist on stressing yourself, answer
                  my stress quiz below...
                </span>
              </div>
            </>
          )}

          {/* Step Progress Pills */}
          <div className="mobile-gate-steps-row">
            <span
              className={`mobile-gate-step-pill ${
                step === 1 ? "step-active" : "step-done"
              }`}
            >
              1. Phone Model {step > 1 ? "✓" : ""}
            </span>
            <span
              className={`mobile-gate-step-pill ${
                step === 2
                  ? "step-active"
                  : step > 2
                    ? "step-done"
                    : "step-pending"
              }`}
            >
              2. RAM & ROM {step > 2 ? "✓" : ""}
            </span>
            <span
              className={`mobile-gate-step-pill ${
                step === 3 ? "step-active" : "step-pending"
              }`}
            >
              3. CPU {unlocked ? "✓" : ""}
            </span>
          </div>

          {/* Laughing Feedback on Next Step */}
          <AnimatePresence>
            {stepSuccessMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mobile-gate-laugh-banner"
                role="status"
              >
                <Sparkles size={14} className="shrink-0 text-[var(--gold)]" />
                <span>{stepSuccessMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 1: Phone Model */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="mobile-gate-form">
              <label
                htmlFor="mobile-gate-password"
                className="secret-input-label"
              >
                Step 1: Access Password (lowercase only)
              </label>
              <div className="secret-input-wrapper">
                <KeyRound size={15} className="secret-input-icon" />
                <input
                  id="mobile-gate-password"
                  type={showPassword ? "text" : "password"}
                  value={step1Input}
                  onChange={(e) => {
                    setStep1Input(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter phone model in lowercase..."
                  autoComplete="off"
                  className={`secret-text-input ${
                    error ? "input-has-error" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-[92px] text-[var(--muted)] hover:text-[var(--ink)] p-1"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button type="submit" className="secret-unlock-btn">
                  <span>Next</span>
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
                <span className="secret-passcode-len">
                  Strictly lowercase!
                </span>
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
          )}

          {/* STEP 2: RAM & ROM */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="mobile-gate-form">
              <label className="secret-input-label">
                Step 2: RAM & ROM amounts for that phone
              </label>

              <div className="mobile-gate-dual-inputs">
                <div className="secret-input-wrapper">
                  <Smartphone size={15} className="secret-input-icon" />
                  <input
                    id="mobile-gate-ram"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={ramInput}
                    onChange={(e) => {
                      // Numbers only for RAM
                      setRamInput(e.target.value.replace(/[^0-9]/g, ""));
                      if (error) setError("");
                    }}
                    placeholder="RAM (numbers only)..."
                    className="secret-text-input !pr-4"
                    aria-label="RAM in GB (numbers only)"
                  />
                </div>

                <div className="secret-input-wrapper">
                  <HardDrive size={15} className="secret-input-icon" />
                  <input
                    id="mobile-gate-rom"
                    type="text"
                    value={romInput}
                    onChange={(e) => {
                      setRomInput(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="ROM in lowercase..."
                    className="secret-text-input !pr-4"
                    aria-label="ROM in GB"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="secret-unlock-btn !static !w-full !mt-1 !py-3 justify-center"
              >
                <span>Submit RAM & ROM 😂</span>
                <Sparkles size={13} />
              </button>

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
                <span className="secret-passcode-len">
                  RAM: numbers only (GB)
                </span>
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
                    Think base model specs of that phone (RAM is a single
                    digit number, ROM is standard storage size).
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          )}

          {/* STEP 3: CPU Manufacturer */}
          {step === 3 && (
            <form onSubmit={handleStep3} className="mobile-gate-form">
              <label
                htmlFor="mobile-gate-cpu"
                className="secret-input-label"
              >
                Final Step 3: CPU Manufacturer (lowercase only)
              </label>
              <div className="secret-input-wrapper">
                <Cpu size={15} className="secret-input-icon" />
                <input
                  id="mobile-gate-cpu"
                  type="text"
                  value={cpuInput}
                  onChange={(e) => {
                    setCpuInput(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter CPU manufacturer in lowercase..."
                  autoComplete="off"
                  className={`secret-text-input !pr-[110px] ${
                    error ? "input-has-error" : ""
                  }`}
                />
                <button type="submit" className="secret-unlock-btn">
                  <span>Unlock 😂</span>
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
                <span className="secret-passcode-len">
                  Starts with &apos;media&apos;
                </span>
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
                    The famous Taiwanese fabless semiconductor company that
                    powered my old phone.
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          )}
        </div>

        <div className="mobile-gate-footer">
          <span className="inline-flex items-center gap-1.5">
            <Lock size={12} /> Security Gate Active
          </span>
          <span>The Mirabel Experience</span>
        </div>
      </motion.div>
    </div>
  );
}
