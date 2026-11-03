"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import {
  ArrowUpRight,
  Check,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  Terminal,
  Trophy,
} from "lucide-react";
import styles from "./playground.module.css";

type GamePhase = "ready" | "playing" | "over";

/** A little keep-up game. The entire court is a generous, keyboard-accessible target. */
export function VolleyballGame() {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<GamePhase>("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [position, setPosition] = useState({ x: 50, y: 44, rotation: 0 });
  const courtRef = useRef<HTMLButtonElement>(null);
  const physics = useRef({ y: 44, velocity: -44, time: 0, lastHit: 0 });
  const scoreRef = useRef(0);
  const visible = useRef(true);

  useEffect(() => {
    try {
      setBest(Number(sessionStorage.getItem("mirabel-volleyball-best")) || 0);
    } catch {
      /* The game also works without storage. */
    }
    const court = courtRef.current;
    if (!court) return;
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
    });
    observer.observe(court);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    let frame = 0;
    let lastTime = 0;
    const tick = (time: number) => {
      if (document.hidden || !visible.current) {
        lastTime = time;
        frame = requestAnimationFrame(tick);
        return;
      }
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.04) : 0;
      lastTime = time;
      const state = physics.current;
      state.time += dt;
      state.velocity += (reducedMotion ? 40 : 68) * dt;
      state.y += state.velocity * dt;
      if (state.y < 8) {
        state.y = 8;
        state.velocity = Math.abs(state.velocity) * 0.55;
      }
      if (state.y >= 79) {
        setPhase("over");
        setPosition({
          x: 50 + Math.sin(state.time * 1.4) * 27,
          y: 79,
          rotation: reducedMotion ? 0 : state.time * 100,
        });
        setBest((previous) => {
          const next = Math.max(previous, scoreRef.current);
          try {
            sessionStorage.setItem("mirabel-volleyball-best", String(next));
          } catch {
            /* Optional persistence. */
          }
          return next;
        });
        return;
      }
      setPosition({
        x: 50 + Math.sin(state.time * 1.4) * (reducedMotion ? 12 : 27),
        y: state.y,
        rotation: reducedMotion ? 0 : state.time * 100,
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, reducedMotion]);

  const hit = () => {
    if (phase !== "playing") {
      physics.current = {
        y: 44,
        velocity: reducedMotion ? -32 : -44,
        time: 0,
        lastHit: performance.now(),
      };
      scoreRef.current = 0;
      setScore(0);
      setPosition({ x: 50, y: 44, rotation: 0 });
      setPhase("playing");
      return;
    }
    const now = performance.now();
    if (now - physics.current.lastHit < 160) return;
    physics.current.lastHit = now;
    physics.current.velocity = reducedMotion ? -33 : -48;
    scoreRef.current += 1;
    setScore(scoreRef.current);
  };

  return (
    <div className={styles.game}>
      <div className={styles.gameTop}>
        <span className={styles.smallLabel}>MIRABEL&apos;S MINI COURT</span>
        <span className={styles.best}>
          <Trophy size={12} aria-hidden="true" /> BEST {best}
        </span>
      </div>
      <button
        ref={courtRef}
        type="button"
        onClick={hit}
        onKeyDown={(event) => {
          if (event.repeat && (event.key === " " || event.key === "Enter"))
            event.preventDefault();
        }}
        className={styles.court}
        aria-label={
          phase === "playing"
            ? "Bump the volleyball. Tap or press Space to keep it in the air."
            : phase === "over"
              ? "Play volleyball again"
              : "Start the volleyball game"
        }
      >
        <span className={styles.courtSun} aria-hidden="true" />
        <span className={styles.cloud} aria-hidden="true" />
        <span className={styles.net} aria-hidden="true" />
        <span className={styles.courtLine} aria-hidden="true" />
        <span
          className={styles.ballShadow}
          style={{
            left: `${position.x}%`,
            opacity: 0.1 + position.y / 300,
            transform: `translateX(-50%) scale(${0.6 + position.y / 130})`,
          }}
          aria-hidden="true"
        />
        <span
          className={styles.ball}
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: `translate(-50%, -50%) rotate(${position.rotation}deg)`,
          }}
          aria-hidden="true"
        >
          🏐
        </span>
        {phase !== "playing" && (
          <span className={styles.gamePrompt}>
            {phase === "over" ? (
              <>
                <RotateCcw size={17} /> One more rally?
              </>
            ) : (
              <>
                Let&apos;s play <ArrowUpRight size={17} />
              </>
            )}
          </span>
        )}
        {phase === "playing" && (
          <span className={styles.liveScore} aria-hidden="true">
            {score}
          </span>
        )}
      </button>
      <div className={styles.gameBottom}>
        <p role="status">
          {phase === "over"
            ? `${score} ${score === 1 ? "bump" : "bumps"}! Mirabel would be proud. Probably. 😂`
            : phase === "playing"
              ? "Keep it up! Tap the court or press Space."
              : "Tap the court or press Space. Keep the ball up!"}
        </p>
        {phase === "playing" && (
          <span className={styles.scoreBadge}>
            {score} {score === 1 ? "bump" : "bumps"}
          </span>
        )}
      </div>
    </div>
  );
}

const terminalLines = [
  "Checking kindness levels… off the charts.",
  "Scanning for good energy… found everywhere.",
  "Result: the world is brighter with you in it.",
];
const extraCompliments = [
  "Your kindness is your superpower. No cape needed.",
  "Some people light up a screen. You light up a room.",
  "Compassion: installed. Thoughtfulness: always running.",
  "Friendship status: very, very appreciated.",
];

export function ComplimentTerminal() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reducedMotion = useReducedMotion();
  const [output, setOutput] = useState("");
  const [run, setRun] = useState(0);
  const [complete, setComplete] = useState(false);
  const text =
    run === 0
      ? terminalLines.join("\n")
      : extraCompliments[(run - 1) % extraCompliments.length];

  useEffect(() => {
    if (!inView) return;
    setComplete(false);
    setOutput("");
    if (reducedMotion) {
      setOutput(text);
      setComplete(true);
      return;
    }
    let index = 0;
    const timer = window.setInterval(() => {
      index += 2;
      setOutput(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(timer);
        setComplete(true);
      }
    }, 25);
    return () => clearInterval(timer);
  }, [inView, reducedMotion, run, text]);

  return (
    <div className={styles.terminal} ref={ref}>
      <div className={styles.terminalBar}>
        <span className={styles.windowDots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>
          <Terminal size={12} aria-hidden="true" /> mirabel.exe
        </span>
        <span className={styles.terminalVersion}>v.1.0</span>
      </div>
      <div className={styles.terminalBody}>
        <p className={styles.command}>
          <span>~</span> npm run appreciate-mirabel
        </p>
        <pre aria-hidden="true">
          {output}
          <span className={styles.cursor}>▋</span>
        </pre>
        <p className={styles.srOnly} role="status">
          {complete ? text : "Running appreciation diagnostics."}
        </p>
        <button
          type="button"
          className={styles.terminalButton}
          onClick={() => setRun((previous) => previous + 1)}
          disabled={!complete}
        >
          <RotateCcw size={12} aria-hidden="true" /> Run another compliment{" "}
          <span aria-hidden="true">↵</span>
        </button>
      </div>
    </div>
  );
}

type MeterProps = { onSound?: (kind: "error" | "success") => void };

export function AppreciationMeter({ onSound }: MeterProps) {
  const [amount, setAmount] = useState(100);
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [attempt, setAttempt] = useState(0);
  const reducedMotion = useReducedMotion();

  const change = useCallback(
    (direction: -1 | 1) => {
      setAttempt((previous) => previous + 1);
      if (direction === -1) {
        setStatus("error");
        onSound?.("error");
      } else {
        setAmount((previous) => Math.min(previous + 25, 10000));
        setStatus("success");
        onSound?.("success");
      }
    },
    [onSound],
  );

  return (
    <div className={styles.meter}>
      <div className={styles.meterGauge}>
        <svg
          className={styles.gaugeSvg}
          viewBox="0 0 360 215"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="appreciation-gradient"
              x1="0"
              y1="1"
              x2="1"
              y2="0"
            >
              <stop offset="0%" stopColor="#c3a5dc" />
              <stop offset="55%" stopColor="#a58bc0" />
              <stop offset="100%" stopColor="#e8b9cb" />
            </linearGradient>
          </defs>
          <path
            d="M 35 180 A 145 145 0 0 1 325 180"
            className={styles.gaugeTrack}
          />
          <motion.path
            d="M 35 180 A 145 145 0 0 1 325 180"
            className={styles.gaugeFill}
            initial={{ pathLength: reducedMotion ? 1 : 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          {Array.from({ length: 13 }, (_, i) => {
            const angle = Math.PI + (i / 12) * Math.PI;
            return (
              <line
                key={i}
                x1={180 + Math.cos(angle) * 121}
                y1={180 + Math.sin(angle) * 121}
                x2={180 + Math.cos(angle) * 115}
                y2={180 + Math.sin(angle) * 115}
                className={styles.gaugeTick}
              />
            );
          })}
        </svg>
        <div className={styles.meterNumber}>
          <Heart size={21} strokeWidth={1.3} aria-hidden="true" />
          <motion.strong
            key={attempt}
            initial={false}
            animate={
              status === "error" && !reducedMotion
                ? { x: [0, -6, 6, -4, 4, 0] }
                : { scale: [1, 1.06, 1] }
            }
            transition={{ duration: 0.4 }}
          >
            {amount}
            <span>%</span>
          </motion.strong>
          <span className={styles.smallLabel}>VERY MUCH APPRECIATED</span>
        </div>
        <span className={styles.gaugeLabelStart}>0%</span>
        <span className={styles.gaugeLabelEnd}>100% +</span>
        <span className={styles.meterSparkle} aria-hidden="true">
          ✧
        </span>
      </div>
      <div className={styles.meterControls}>
        <button
          type="button"
          onClick={() => change(-1)}
          className={styles.meterButton}
          aria-label="Try to decrease appreciation"
        >
          <Minus size={18} aria-hidden="true" />
        </button>
        <span>Go on. Try adjusting it.</span>
        <button
          type="button"
          onClick={() => change(1)}
          className={`${styles.meterButton} ${styles.meterPlus}`}
          aria-label="Increase appreciation"
        >
          <Plus size={18} aria-hidden="true" />
        </button>
      </div>
      <div className={styles.meterMessage} role="status" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.p
            key={status + attempt}
            initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={
              status === "error"
                ? styles.errorMessage
                : status === "success"
                  ? styles.successMessage
                  : ""
            }
          >
            {status === "error" ? (
              <>
                <span aria-hidden="true">↳</span> ERROR 404: Reasons not to
                appreciate Mirabel could not be found.
              </>
            ) : status === "success" ? (
              <>
                <Sparkles size={15} aria-hidden="true" /> WARNING: Appreciation
                levels exceeding safe limits!
              </>
            ) : (
              <>
                <Check size={14} aria-hidden="true" /> Calibrated with
                absolutely no scientific evidence. Just facts.
              </>
            )}
          </motion.p>
        </AnimatePresence>
      </div>
      {status === "success" && (
        <motion.div
          key={`sparkles-${attempt}`}
          className={styles.meterConfetti}
          aria-hidden="true"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.3 }}
        >
          {Array.from({ length: 7 }, (_, i) => (
            <motion.span
              key={i}
              initial={{ x: 0, y: 0, scale: 0 }}
              animate={
                reducedMotion
                  ? { opacity: 0 }
                  : {
                      x: (i - 3) * 44,
                      y: -60 - (i % 3) * 25,
                      scale: [0, 1, 0],
                      rotate: i * 40,
                    }
              }
              transition={{ duration: 1.1, ease: "easeOut" }}
            >
              ✦
            </motion.span>
          ))}
        </motion.div>
      )}
    </div>
  );
}
