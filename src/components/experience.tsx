"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  Gift,
  Heart,
  Menu,
  Moon,
  Music2,
  Pause,
  Play,
  Share2,
  Sparkles,
  Star,
  Sun,
  Volume2,
  VolumeX,
  Volleyball,
  X,
} from "lucide-react";
import {
  AppreciationMeter,
  ComplimentTerminal,
  VolleyballGame,
} from "./playground";
import PhotoGallery from "./photo-gallery";
import { useExperienceAudio } from "@/lib/use-experience-audio";
import { letter, lullaby } from "@/lib/personalization";

const chapters = [
  { id: "files", label: "The Mirabel files", short: "The files" },
  { id: "universe", label: "Her little universe", short: "Her universe" },
  { id: "letter", label: "A little note", short: "A little note" },
  { id: "surprise", label: "The surprise", short: "The surprise" },
];

function Asterisk({ className = "", ...props }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 60 60"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M30 3v54M3 30h54M11 11l38 38M11 49l38-38"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="m20 5 20 50M5 20l50 20M5 40 55 20M20 55 40 5"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

function Flower({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 90 90"
      fill="none"
      aria-hidden="true"
    >
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse
          key={i}
          cx="45"
          cy="25"
          rx="10"
          ry="21"
          transform={`rotate(${i * 45} 45 45)`}
          fill="var(--surface)"
          stroke="currentColor"
          strokeWidth="1.1"
        />
      ))}
      <circle
        cx="45"
        cy="45"
        r="11"
        fill="#e8c884"
        stroke="currentColor"
        strokeWidth="1.1"
      />
    </svg>
  );
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Chapter({
  number,
  children,
}: {
  number: string;
  children: ReactNode;
}) {
  return (
    <p className="eyebrow chapter-label">
      <span>{number}</span>
      <span className="chapter-line" />
      {children}
    </p>
  );
}

function SecretStar({
  id,
  onFind,
  className = "",
}: {
  id: number;
  onFind: (id: number) => void;
  className?: string;
}) {
  return (
    <button
      className={`secret-star ${className}`}
      type="button"
      onClick={() => onFind(id)}
      aria-label={`Discover little note ${id}`}
      title="Psst. Try tapping me."
    >
      <Sparkles size={24} strokeWidth={1.2} />
    </button>
  );
}

function Confetti({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  if (!active || reduced) return null;
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 58 }, (_, i) => (
        <motion.i
          key={i}
          initial={{ y: -30, x: 0, rotate: 0, opacity: 1 }}
          animate={{
            y: "110vh",
            x: Math.sin(i * 1.7) * 180,
            rotate: (i % 2 ? 1 : -1) * (260 + i * 9),
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 3.5 + (i % 4) * 0.5,
            delay: (i % 9) * 0.08,
            ease: [0.2, 0.5, 0.7, 1],
          }}
          style={{
            left: `${(i * 37) % 100}%`,
            background: ["#c8a9df", "#e8bdcb", "#dfc083", "#e3d7ed", "#fff8e7"][
              i % 5
            ],
            width: i % 3 === 0 ? 7 : 5,
            height: i % 3 === 0 ? 7 : 13,
            borderRadius: i % 3 === 0 ? "50%" : 1,
          }}
        />
      ))}
    </div>
  );
}

function PersonalityFiles({ onFind }: { onFind: (id: number) => void }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <section
      className="files-section section-space"
      id="files"
      aria-labelledby="files-heading"
    >
      <div className="page-container files-layout">
        <Reveal className="files-intro">
          <Chapter number="02">THE MIRABEL FILES</Chapter>
          <h2 id="files-heading">
            Some people have <br />a personality.
            <br />
            <em>
              You have a whole <br />
              experience.
            </em>
          </h2>
          <p>
            A very unofficial, suspiciously accurate field guide to the person
            behind all that sunshine.
          </p>
          <div className="scribble-note">
            <span>filed under: one of a kind</span>
            <svg viewBox="0 0 88 40" aria-hidden="true">
              <path d="M3 8c31-12 28 32 75 15M65 12l14 11-10 12" />
            </svg>
          </div>
          <SecretStar id={1} onFind={onFind} className="files-secret" />
        </Reveal>
        <Reveal className="dossier" delay={0.12}>
          <div className="dossier-tab">VERY IMPORTANT HUMAN</div>
          <div className="dossier-top">
            <span className="eyebrow">SUBJECT NO. 001</span>
            <span className="dossier-stamp">
              ONE OF
              <br />A KIND <Sparkles size={13} />
            </span>
          </div>
          <div className="dossier-identity">
            <Image
              src="/images/mirabel-headphones.jpg"
              alt="Mirabel smiling with headphones on"
              width={90}
              height={104}
              className="dossier-photo"
            />
            <div>
              <span className="eyebrow">MEET THE HUMAN</span>
              <h3>Mirabel.</h3>
              <span className="dossier-status">
                <i /> Professional Room Brightener
              </span>
            </div>
          </div>
          <dl className="profile-details">
            <div>
              <dt>Superpower</dt>
              <dd>Making people feel loved and appreciated</dd>
            </div>
            <div>
              <dt>Special talent</dt>
              <dd>Showing up when people need her</dd>
            </div>
            <div>
              <dt>Personality</dt>
              <dd>Jovial, compassionate, kindhearted, cheerful, and caring</dd>
            </div>
            <div>
              <dt>Known weakness</dt>
              <dd>Crying over almost anything 😂</dd>
            </div>
          </dl>
          <div className="personality-stats">
            {[
              { label: "Kindness", value: 100 },
              { label: "Showing up", value: 100 },
              { label: "Tear resistance", value: 2 },
            ].map((stat, i) => (
              <div className="personality-stat" key={stat.label}>
                <span>{stat.label}</span>
                <div className="stat-track">
                  <motion.i
                    initial={{ width: 0 }}
                    whileInView={{ width: `${stat.value}%` }}
                    transition={{ duration: 1.1, delay: i * 0.15 }}
                    viewport={{ once: true }}
                  />
                </div>
                <span>{stat.value}%</span>
              </div>
            ))}
          </div>
          <button
            className="hidden-ability"
            aria-expanded={flipped}
            onClick={() => setFlipped(!flipped)}
          >
            <Sparkles size={15} />
            <span>
              {flipped
                ? "Making even difficult people feel appreciated. Yes, even me."
                : "Tap to uncover her hidden ability"}
            </span>
            <ChevronRight size={15} className={flipped ? "rotated" : ""} />
          </button>
          <div className="dossier-footer">
            <span>VERIFIED BY AN OCCASIONALLY TROUBLESOME FRIEND</span>
            <span>✳</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const interests = [
  {
    id: "volleyball",
    name: "Volleyball",
    icon: Volleyball,
    label: "A LITTLE COMPETITIVE SPIRIT",
    title: "Good energy.\nGreat serves.",
    text: "Life is apparently better when you're hitting a ball over a net.",
    note: "Your court. Your rules. (Mostly.)",
  },
  {
    id: "books",
    name: "Books",
    icon: BookOpen,
    label: "JUST ONE MORE CHAPTER",
    title: "Between the pages,\nin her element.",
    text: "A little suspense, a lot of plot, and absolutely no promises about putting the book down.",
    note: "Her kind of page-turners.",
  },
  {
    id: "technology",
    name: "Technology",
    icon: Code2,
    label: "GOOD HEART. SHARP MIND.",
    title: "A tech girl?\nWe love to see it.",
    text: "Smart, curious, and into computers. We respect a tech girl around here.",
    note: "Running on curiosity & good energy.",
  },
  {
    id: "faith",
    name: "Faith",
    icon: Sparkles,
    label: "THE QUIET, BEAUTIFUL FOUNDATION",
    title: "Rooted in faith.\nGrowing in kindness.",
    text: "A girl who loves God, serves with her heart, and finds joy in helping others.",
    note: "A generous heart is a beautiful thing.",
  },
];

function Bookshelf() {
  const [selected, setSelected] = useState<number | null>(null);
  const books = ["Lights Out", "Caught Up", "Game On"];
  return (
    <div className="bookshelf">
      <p className="eyebrow">ON MIRABEL&apos;S SHELF</p>
      <div className="book-row">
        {books.map((book, i) => (
          <button
            type="button"
            className={`book book-${i} ${selected === i ? "book-selected" : ""}`}
            key={book}
            onClick={() => setSelected(selected === i ? null : i)}
            aria-pressed={selected === i}
            aria-label={`Explore ${book} by Navessa Allen`}
          >
            <span className="book-author">NAVESSA ALLEN</span>
            <span className="book-ornament">
              {i === 0 ? "✧" : i === 1 ? "✳" : "♧"}
            </span>
            <span className="book-title">{book}</span>
            <span className="book-series">INTO DARKNESS</span>
          </button>
        ))}
      </div>
      <div className="shelf-edge" />
      <p className="bookshelf-caption" role="status">
        {selected === null
          ? "Pick a book. We know you want to."
          : `${books[selected]} · Navessa Allen · Into Darkness series`}
      </p>
      <span className="book-art-note">
        A little shelf inspired by her reading universe.
      </span>
    </div>
  );
}

function FaithScene() {
  return (
    <div className="faith-scene">
      <svg
        viewBox="0 0 400 240"
        role="img"
        aria-label="A warm sunrise over gentle hills"
      >
        <defs>
          <linearGradient id="faith-sky" x2="0" y2="1">
            <stop stopColor="#eee3f0" />
            <stop offset="1" stopColor="#f9e6ca" />
          </linearGradient>
        </defs>
        <rect width="400" height="240" rx="100" fill="url(#faith-sky)" />
        <circle cx="200" cy="126" r="43" fill="#fff4d6" />
        <g stroke="#c7a56d" strokeWidth="1" opacity=".65">
          {Array.from({ length: 9 }, (_, i) => (
            <path
              key={i}
              d="M200 62v-14"
              transform={`rotate(${(i - 4) * 24} 200 126)`}
            />
          ))}
        </g>
        <path d="M0 170q100-68 200 0t200-13v83H0" fill="#c6b7cd" />
        <path d="M0 201q110-67 225-7t175 3v43H0" fill="#a999b5" />
        <path d="M0 224q140-47 270-7t130-2v25H0" fill="#92849e" />
      </svg>
      <p className="handwritten">Faith in her heart. Kindness in her hands.</p>
      <span>Quiet strength. Everyday grace.</span>
    </div>
  );
}

function LittleUniverse() {
  const [active, setActive] = useState(0);
  const item = interests[active];
  const select = (index: number, focus = false) => {
    setActive(index);
    if (focus) document.getElementById(`interest-tab-${index}`)?.focus();
  };
  return (
    <section
      className="universe-section section-space"
      id="universe"
      aria-labelledby="universe-heading"
    >
      <div className="page-container">
        <Reveal className="section-heading universe-heading">
          <div>
            <Chapter number="03">HER LITTLE UNIVERSE</Chapter>
            <h2 id="universe-heading">
              The things that
              <br />
              <em>make her, her.</em>
            </h2>
          </div>
          <p>
            A few of her favourite things.
            <br />A few more reasons she&apos;s pretty wonderful.
          </p>
          <Asterisk className="universe-asterisk" />
        </Reveal>
        <div
          className="interest-tabs"
          role="tablist"
          aria-label="Explore Mirabel’s interests"
        >
          {interests.map((interest, i) => (
            <button
              role="tab"
              aria-selected={active === i}
              aria-controls={`interest-panel-${interest.id}`}
              id={`interest-tab-${i}`}
              tabIndex={active === i ? 0 : -1}
              key={interest.id}
              onClick={() => select(i)}
              onKeyDown={(e) => {
                let next = i;
                if (e.key === "ArrowRight") next = (i + 1) % 4;
                else if (e.key === "ArrowLeft") next = (i + 3) % 4;
                else if (e.key === "Home") next = 0;
                else if (e.key === "End") next = 3;
                else return;
                e.preventDefault();
                select(next, true);
              }}
            >
              <interest.icon size={19} strokeWidth={1.4} />
              <span>{interest.name}</span>
              <span className="interest-number">0{i + 1}</span>
            </button>
          ))}
        </div>
        <div
          className="interest-panel"
          role="tabpanel"
          id={`interest-panel-${item.id}`}
          aria-labelledby={`interest-tab-${active}`}
          tabIndex={0}
        >
          <AnimatePresence mode="wait">
            <motion.div
              className="interest-copy"
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <p className="eyebrow">{item.label}</p>
              <h3>
                {item.title.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </h3>
              <p>{item.text}</p>
              <span className="handwritten interest-note">{item.note}</span>
            </motion.div>
          </AnimatePresence>
          <div className="interest-playground" key={item.id}>
            {active === 0 ? (
              <VolleyballGame />
            ) : active === 1 ? (
              <Bookshelf />
            ) : active === 2 ? (
              <ComplimentTerminal />
            ) : (
              <FaithScene />
            )}
          </div>
        </div>
        <p className="tiny-footnote">
          <Sparkles size={12} /> Multifaceted. Mildly dramatic. Entirely
          Mirabel.
        </p>
      </div>
    </section>
  );
}

function AppreciationLetter() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(1);
  const reduced = useReducedMotion();
  const readAll = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    if (reduced) {
      setVisible(letter.length);
      return;
    }
    const timer = window.setInterval(
      () =>
        setVisible((current) => {
          if (current >= letter.length) {
            clearInterval(timer);
            return current;
          }
          return current + 1;
        }),
      1450,
    );
    return () => clearInterval(timer);
  }, [open, reduced]);
  return (
    <section
      className="letter-section section-space"
      id="letter"
      aria-labelledby="letter-heading"
    >
      <div className="page-container">
        <Reveal className="letter-heading">
          <Chapter number="04">FROM YOUR FRIEND, WITH GRATITUDE</Chapter>
          <h2 id="letter-heading">
            Okay, jokes aside.
            <br />
            <em>This part is from the heart.</em>
          </h2>
          <p>Some things deserve a little more than a thank you.</p>
        </Reveal>
        {!open ? (
          <Reveal className="envelope-area">
            <button
              className="envelope"
              onClick={() => {
                setOpen(true);
                window.setTimeout(
                  () => readAll.current?.focus({ preventScroll: true }),
                  50,
                );
              }}
              aria-label="Open your appreciation letter"
            >
              <span className="envelope-back" />
              <span className="envelope-page">
                <span className="handwritten">Dear Mirabel,</span>
                <span>A little something I wanted you to know…</span>
              </span>
              <span className="envelope-front" />
              <span className="envelope-flap" />
              <span className="wax-seal">M</span>
              <span className="envelope-address handwritten">
                for you, Mirabel.
              </span>
            </button>
            <span className="envelope-hint">
              <span>Go on, open it.</span>
              <ArrowUp size={18} strokeWidth={1} />
            </span>
            <button
              className="text-button"
              onClick={() => {
                setOpen(true);
                window.setTimeout(
                  () => readAll.current?.focus({ preventScroll: true }),
                  50,
                );
              }}
            >
              Open your letter <ArrowUpRight size={15} />
            </button>
          </Reveal>
        ) : (
          <motion.article
            className="letter-paper"
            initial={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            aria-label="A personal letter to Mirabel"
          >
            <div className="letter-paper-top">
              <span className="eyebrow">A NOTE WORTH KEEPING</span>
              <button
                ref={readAll}
                className="text-button"
                onClick={() => setVisible(letter.length)}
                aria-disabled={visible >= letter.length}
              >
                {visible >= letter.length ? (
                  <>
                    <Check size={13} /> All here, just for you
                  </>
                ) : (
                  <>
                    Read it all <ArrowDown size={13} />
                  </>
                )}
              </button>
            </div>
            <div className="letter-text">
              {letter.slice(0, visible).map((paragraph, i) => (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7 }}
                  key={i}
                  className={`${i === 0 ? "letter-greeting" : ""} ${[9, 13, 14, 15].includes(i) ? "letter-emphasis" : ""} ${i === letter.length - 1 ? "letter-signature" : ""}`}
                >
                  {paragraph}
                </motion.p>
              ))}
              {visible < letter.length && (
                <span
                  className="writing-dots"
                  aria-label="The letter is unfolding"
                >
                  <i />
                  <i />
                  <i />
                </span>
              )}
            </div>
            <Asterisk className="letter-flower" />
          </motion.article>
        )}
        <p className="letter-postscript handwritten">
          P.S. The tissue budget is still zero.
        </p>
      </div>
    </section>
  );
}

function Surprise({
  onReveal,
  opened,
}: {
  onReveal: () => void;
  opened: boolean;
}) {
  const reduced = useReducedMotion();
  return (
    <section
      className="surprise-section section-space"
      id="surprise"
      aria-labelledby="surprise-heading"
    >
      <div className="page-container surprise-layout">
        <Reveal className="surprise-copy">
          <Chapter number="06">A LITTLE SURPRISE</Chapter>
          <h2 id="surprise-heading">
            And because
            <br />
            <em>
              you deserve <br />
              beautiful things.
            </em>
          </h2>
          <p>
            Wait, you thought I built an entire website just to tease you and
            make you emotional?
          </p>
          <span className="handwritten">There&apos;s one more thing…</span>
        </Reveal>
        <div className={`gift-scene ${opened ? "gift-opened" : ""}`}>
          <div className="gift-halo" />
          <span className="gift-star gift-star-one" aria-hidden="true">
            ✧
          </span>
          <span className="gift-star gift-star-two" aria-hidden="true">
            ✦
          </span>
          <motion.div
            className="gift-box"
            animate={
              opened || reduced
                ? {}
                : { y: [0, -8, 0], rotate: [0, -2, 0, 2, 0] }
            }
            transition={{ duration: 4, repeat: Infinity }}
            aria-hidden="true"
          >
            <div className="gift-body">
              <div className="gift-ribbon" />
              <span className="gift-tag handwritten">M</span>
            </div>
            <motion.div
              className="gift-lid"
              animate={
                opened
                  ? {
                      y: reduced ? -30 : -115,
                      rotate: reduced ? 0 : -22,
                      x: reduced ? 0 : -35,
                      opacity: 0,
                    }
                  : { y: 0, rotate: 0, x: 0, opacity: 1 }
              }
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="gift-bow">
                <i />
                <i />
                <span />
              </div>
              <span />
            </motion.div>
            <AnimatePresence>
              {opened && (
                <motion.div
                  className="gift-magic"
                  initial={{ y: 20, opacity: 0, scale: 0 }}
                  animate={{ y: -45, opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <Sparkles size={65} strokeWidth={1} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <AnimatePresence mode="wait">
            {!opened ? (
              <motion.div
                key="open"
                className="gift-action"
                exit={{ opacity: 0 }}
              >
                <button className="primary-button" onClick={onReveal}>
                  Open My Surprise <Gift size={17} strokeWidth={1.5} />
                </button>
                <span className="gift-hint">
                  No shaking. No peeking. Okay, maybe a little.
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="message"
                className="surprise-message"
                role="status"
                initial={{ opacity: 0, y: reduced ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="eyebrow">A LITTLE JOY, BEYOND THE SCREEN</p>
                <h3>
                  The surprise continues
                  <br />
                  <em>in the real world.</em>
                </h3>
                <p>
                  Somewhere outside this website, there&apos;s a little
                  something waiting for you. Because you deserve to be
                  appreciated in the real world too.
                </p>
                <span className="handwritten">
                  Some surprises are worth the wait. ✨
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default function Experience() {
  const [theme, setTheme] = useState("day");
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundPanel, setSoundPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [opened, setOpened] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [found, setFound] = useState<number[]>([]);
  const [toast, setToast] = useState("");
  const [secretOpen, setSecretOpen] = useState(false);
  const [shareFallback, setShareFallback] = useState("");
  const secretDialog = useRef<HTMLDialogElement>(null);
  const soundTrigger = useRef<HTMLButtonElement | null>(null);
  const soundPlayButton = useRef<HTMLButtonElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const shareInput = useRef<HTMLInputElement>(null);
  const lullabyAudio = useRef<HTMLAudioElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confettiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audio = useExperienceAudio();
  const reduced = useReducedMotion();
  const { scrollYProgress, scrollY } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const photoY = useTransform(scrollY, [0, 900], [0, reduced ? 0 : 65]);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme || "day");
    const timer = setTimeout(() => setLoading(false), 650);
    return () => {
      clearTimeout(timer);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (confettiTimer.current) clearTimeout(confettiTimer.current);
    };
  }, []);

  useEffect(() => {
    const dialog = secretDialog.current;
    if (!dialog) return;
    if (secretOpen) {
      dialog.showModal();
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
    if (dialog.open) dialog.close();
  }, [secretOpen]);

  const closeSoundPanel = useCallback(() => {
    setSoundPanel(false);
    soundTrigger.current?.focus({ preventScroll: true });
  }, []);

  const toggleSoundPanel = (trigger: HTMLButtonElement) => {
    if (soundPanel) {
      closeSoundPanel();
      return;
    }
    soundTrigger.current = trigger;
    setSoundPanel(true);
  };

  useEffect(() => {
    if (soundPanel) soundPlayButton.current?.focus({ preventScroll: true });
  }, [soundPanel]);

  useEffect(() => {
    if (shareFallback) {
      shareInput.current?.focus();
      shareInput.current?.select();
    }
  }, [shareFallback]);

  useEffect(() => {
    if (lullabyAudio.current) lullabyAudio.current.volume = audio.volume;
  }, [audio.volume, secretOpen]);

  useEffect(() => {
    if (!menuOpen && !soundPanel) return;
    const close = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (soundPanel) closeSoundPanel();
      if (menuOpen) {
        setMenuOpen(false);
        menuTrigger.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menuOpen, soundPanel, closeSoundPanel]);

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 6500);
  }, []);

  const findStar = (id: number) => {
    if (found.includes(id)) {
      notify("This little note is already in your pocket. ✨");
      return;
    }
    const next = [...found, id];
    setFound(next);
    audio.playEffect("sparkle");
    const notes = [
      "Little note 1/3: Your kindness never goes unnoticed. ✨",
      "Little note 2/3: You make being a friend look effortless. ✨",
      "Little note 3/3: You deserve the kindness you give so freely. ✨",
    ];
    notify(
      next.length === 3
        ? "All three little notes found! A secret lullaby is hiding by the moon below. 🌙"
        : notes[id - 1],
    );
  };

  const toggleTheme = () => {
    const next = theme === "day" ? "night" : "day";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("mirabel-theme", next);
    } catch {
      /* Preferences are optional. */
    }
  };

  const share = async () => {
    const url = window.location.href.split("#")[0];
    if (navigator.share) {
      try {
        await navigator.share({
          title: "The Mirabel Experience ✨",
          text: "A little corner of the internet celebrating a wonderfully kind human.",
          url,
        });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      notify("A little joy, ready to share. Link copied! ✨");
    } catch {
      setShareFallback(url);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#files">
        Skip to the experience
      </a>
      <AnimatePresence>
        {loading && (
          <motion.div
            className="loading-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            aria-hidden="true"
          >
            <motion.div
              animate={reduced ? {} : { rotate: 180 }}
              transition={{ duration: 1.4 }}
            >
              <Asterisk />
            </motion.div>
            <span>A little something, just for you.</span>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className="reading-progress"
        style={{ scaleX: progress }}
        aria-hidden="true"
      />
      <header className="site-header">
        <div className="page-container header-inner">
          <a
            href="#welcome"
            className="brand"
            aria-label="The Mirabel Experience, back to welcome"
          >
            <Asterisk />
            <span>
              the mirabel
              <br />
              <em>experience</em>
              <span className="brand-dot">.</span>
            </span>
          </a>
          <nav className="desktop-nav" aria-label="Chapters">
            {chapters.map((c) => (
              <a key={c.id} href={`#${c.id}`}>
                {c.short}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="icon-button"
              onClick={toggleTheme}
              aria-label={
                theme === "day"
                  ? "Switch to magical nighttime"
                  : "Switch to soft daylight"
              }
              title={
                theme === "day"
                  ? "A little nighttime magic"
                  : "Let the sunshine in"
              }
            >
              {theme === "day" ? (
                <Moon size={18} strokeWidth={1.4} />
              ) : (
                <Sun size={18} strokeWidth={1.4} />
              )}
            </button>
            <span className="control-divider" />
            <button
              className="icon-button"
              onClick={(e) => toggleSoundPanel(e.currentTarget)}
              aria-expanded={soundPanel}
              aria-controls="sound-settings"
              aria-label="Sound settings"
            >
              {audio.soundOn ? (
                <Volume2 size={18} strokeWidth={1.4} />
              ) : (
                <VolumeX size={18} strokeWidth={1.4} />
              )}
            </button>
            <button
              ref={menuTrigger}
              className="icon-button mobile-menu-button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close chapter menu" : "Open chapter menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              className="mobile-nav"
              id="mobile-nav"
              aria-label="Mobile chapters"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {chapters.map((c, i) => (
                <a
                  href={`#${c.id}`}
                  key={c.id}
                  onClick={() => setMenuOpen(false)}
                >
                  <span>0{i + 1}</span>
                  {c.label}
                  <ArrowUpRight size={16} />
                </a>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {soundPanel && (
            <motion.div
              className="sound-panel"
              id="sound-settings"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <div className="sound-panel-title">
                <span>
                  <Music2 size={15} /> A little atmosphere
                </span>
                <button
                  className="icon-button"
                  onClick={closeSoundPanel}
                  aria-label="Close sound settings"
                >
                  <X size={15} />
                </button>
              </div>
              <p>A soft, original music-box melody. Only if you&apos;d like.</p>
              <button
                ref={soundPlayButton}
                className="music-play"
                onClick={audio.toggleMusic}
                aria-pressed={audio.musicOn}
              >
                {audio.musicOn ? <Pause size={16} /> : <Play size={16} />}
                {audio.musicOn ? "Pause the music" : "Play a little music"}
              </button>
              <label className="volume-control">
                <span>Volume</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audio.volume}
                  onChange={(e) => audio.setVolume(Number(e.target.value))}
                  aria-label="Music and sound effects volume"
                />
                <span>{Math.round(audio.volume * 100)}%</span>
              </label>
              <button
                className="sound-toggle"
                onClick={audio.toggleSound}
                aria-pressed={!audio.soundOn}
              >
                {audio.soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
                {audio.soundOn ? "Mute all sounds" : "Unmute sounds"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <main>
        <section
          className="hero"
          id="welcome"
          aria-labelledby="welcome-heading"
        >
          <div className="hero-glow" aria-hidden="true" />
          <div className="floating-particles" aria-hidden="true">
            {Array.from({ length: 11 }, (_, i) => (
              <i
                key={i}
                style={{
                  left: `${(i * 29 + 7) % 98}%`,
                  top: `${(i * 17 + 3) % 95}%`,
                  animationDelay: `${i * -0.7}s`,
                }}
              >
                ✦
              </i>
            ))}
          </div>
          <div className="page-container hero-layout">
            <div className="hero-copy">
              <motion.p
                className="eyebrow hero-eyebrow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="tiny-star">✦</span> A LITTLE CORNER OF THE
                INTERNET, JUST FOR YOU
              </motion.p>
              <motion.h1
                id="welcome-heading"
                initial={{ opacity: 0, y: reduced ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.65 }}
              >
                Oh, look who <br />
                finally
                <br />
                <em>showed up.</em>
                <span className="hero-eyes" aria-label="eyes">
                  👀
                </span>
              </motion.h1>
              <motion.div
                className="hero-description"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <p>
                  Mirabel, before you start asking questions, yes, I made an
                  entire website about you.
                </p>
                <p>Don&apos;t let it get to your head. 😂</p>
              </motion.div>
              <motion.div
                className="hero-cta"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                <a className="primary-button" href="#files">
                  Fine, I&apos;m curious{" "}
                  <Sparkles size={16} strokeWidth={1.5} />
                  <ArrowRight size={17} />
                </a>
                <span className="cta-note handwritten">
                  a very good decision, btw.
                  <svg viewBox="0 0 48 25" aria-hidden="true">
                    <path d="M45 4C30 22 13 24 3 12m0 0 1 10M3 12l11 2" />
                  </svg>
                </span>
              </motion.div>
            </div>
            <motion.div
              className="hero-scrapbook"
              style={{ y: photoY }}
              initial={{ opacity: 0, rotate: reduced ? 0 : 4 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ duration: 1.2, delay: 0.7 }}
            >
              <div className="photo-paper-back" />
              <div className="hero-polaroid">
                <span className="photo-tape" />
                <div className="hero-photo-wrap">
                  <Image
                    src="/images/hero.jpg"
                    alt="The one and only Mirabel, wearing a cream top and long braids"
                    fill
                    priority
                    sizes="(max-width: 600px) 78vw, (max-width: 1000px) 40vw, 360px"
                    style={{ objectFit: "cover", objectPosition: "50% 42%" }}
                  />
                </div>
                <div className="polaroid-caption">
                  <span className="handwritten">the one & only, Mirabel.</span>
                  <Heart size={20} strokeWidth={1} />
                </div>
              </div>
              <div className="sunshine-badge">
                <Sun size={19} strokeWidth={1} />
                <span>
                  CERTIFIED
                  <br />
                  <strong>SUNSHINE</strong>
                  <span>in human form</span>
                </span>
              </div>
              <Flower className="hero-flower" />
              <Asterisk className="hero-asterisk" />
              <span className="photo-side-note handwritten">
                main character
                <br />
                energy, always.
              </span>
              <div className="photo-count">
                <span>01</span> / A ONE-OF-A-KIND HUMAN
              </div>
            </motion.div>
          </div>
          <div className="page-container hero-bottom">
            <a href="#files">
              <span className="scroll-circle">
                <ArrowDown size={16} strokeWidth={1.3} />
              </span>
              <span>SCROLL A LITTLE. SMILE A LOT.</span>
            </a>
            <span className="hero-dedication">
              Made with gratitude. And a little mischief. <span>✧</span>
            </span>
          </div>
        </section>
        <div
          className="qualities-ribbon"
          aria-label="Kindhearted, joyfully herself, a little dramatic, endlessly appreciated"
        >
          <div>
            {Array.from({ length: 3 }, (_, i) => (
              <span key={i} aria-hidden={i > 0}>
                {[
                  "KINDHEARTED",
                  "JOYFULLY HERSELF",
                  "A LITTLE DRAMATIC",
                  "ENDLESSLY APPRECIATED",
                ].map((q) => (
                  <span key={q}>
                    {q}
                    <Asterisk />
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
        <PersonalityFiles onFind={findStar} />
        <LittleUniverse />
        <PhotoGallery />
        <AppreciationLetter />
        <section
          className="meter-section section-space"
          id="appreciation"
          aria-labelledby="meter-heading"
        >
          <div className="page-container meter-layout">
            <Reveal className="meter-copy">
              <Chapter number="05">LET&apos;S PUT A NUMBER ON IT</Chapter>
              <h2 id="meter-heading">
                The appreciation
                <br />
                <em>is off the charts.</em>
              </h2>
              <p>
                In case the entire website wasn&apos;t obvious enough,
                here&apos;s some very serious data.
              </p>
              <span className="handwritten">
                Try turning it down. I dare you.
              </span>
              <SecretStar id={2} onFind={findStar} className="meter-secret" />
            </Reveal>
            <Reveal>
              <AppreciationMeter onSound={audio.playEffect} />
            </Reveal>
          </div>
        </section>
        <Surprise
          opened={opened}
          onReveal={() => {
            setOpened(true);
            setConfetti(true);
            audio.playEffect("sparkle");
            confettiTimer.current = setTimeout(() => setConfetti(false), 6500);
          }}
        />
        <section
          className="final-section"
          id="a-little-reminder"
          aria-labelledby="final-heading"
        >
          <div className="night-stars" aria-hidden="true">
            {Array.from({ length: 35 }, (_, i) => (
              <i
                key={i}
                style={{
                  left: `${(i * 37 + 3) % 100}%`,
                  top: `${(i * 23 + 4) % 96}%`,
                  animationDelay: `${-i * 0.35}s`,
                  width: i % 5 === 0 ? 3 : 2,
                  height: i % 5 === 0 ? 3 : 2,
                }}
              />
            ))}
          </div>
          <svg
            className="constellation"
            viewBox="0 0 1000 500"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="m80 290 90-60 80 60 65-175M720 145l90 40 80-55 65 100"
              stroke="currentColor"
              strokeWidth=".7"
            />
            {[
              [80, 290],
              [170, 230],
              [250, 290],
              [315, 115],
              [720, 145],
              [810, 185],
              [890, 130],
              [955, 230],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="3" fill="currentColor" />
            ))}
          </svg>
          <div className="final-content">
            <Reveal>
              <p className="eyebrow">
                07 <span>✦</span> ONE LAST LITTLE REMINDER
              </p>
              <Asterisk className="final-asterisk" />
              <h2 id="final-heading">
                The world has enough reasons
                <br />
                to make people feel small.
              </h2>
              <p className="final-quote">
                I hope this little corner of it reminds you
                <br className="desktop-break" /> how much you matter.
              </p>
              <p className="final-keep">
                Keep being wonderfully,
                <br />
                <em>unapologetically Mirabel.</em>
              </p>
              <p className="final-joke">
                Okay, you can stop smiling at your screen now. 😂
              </p>
              <div className="final-actions">
                <button onClick={share}>
                  <Share2 size={15} /> Keep a little joy. Share a little joy.
                </button>
                <a href="#welcome" aria-label="Back to the beginning">
                  <ArrowUp size={17} />
                </a>
              </div>
              {shareFallback && (
                <label className="share-fallback">
                  Copy this little corner&apos;s address
                  <input
                    ref={shareInput}
                    readOnly
                    value={shareFallback}
                    onFocus={(e) => e.target.select()}
                    aria-label="Website link to copy"
                  />
                </label>
              )}
            </Reveal>
          </div>
          <SecretStar id={3} onFind={findStar} className="final-secret" />
          <div className="secret-corner">
            <button
              onClick={() => setSecretOpen(true)}
              aria-label="Discover the secret lullaby"
            >
              <Moon size={18} strokeWidth={1.2} />
              <span>
                {found.length === 3
                  ? "You found a quieter corner. Come in."
                  : "Psst… a little secret lives here."}
              </span>
            </button>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="page-container">
          <a className="footer-brand" href="#welcome">
            <Asterisk /> the mirabel experience.
          </a>
          <span>For a friend who makes the world a little kinder.</span>
          <span className="footer-end">
            A one-of-one edition. <span>✧</span>
          </span>
        </div>
      </footer>
      <button
        className={`mood-pill ${audio.musicOn && audio.soundOn ? "music-active" : ""}`}
        onClick={(e) => toggleSoundPanel(e.currentTarget)}
        aria-label="Open music and volume controls"
        aria-expanded={soundPanel}
        aria-controls="sound-settings"
      >
        <span className="music-bars" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span>
          {audio.musicOn && audio.soundOn
            ? "a little atmosphere"
            : "set the mood"}
        </span>
        <Music2 size={13} />
      </button>
      <div className="toast-region" role="status" aria-live="polite">
        <AnimatePresence>
          {toast && (
            <motion.div
              className="toast"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <Sparkles size={17} />
              <span>{toast}</span>
              <button
                onClick={() => setToast("")}
                aria-label="Dismiss little note"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <dialog
        ref={secretDialog}
        className="lullaby-dialog"
        onClose={() => setSecretOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSecretOpen(false);
        }}
        aria-labelledby="lullaby-heading"
      >
        <button
          className="icon-button dialog-close"
          onClick={() => setSecretOpen(false)}
          aria-label="Close the lullaby"
        >
          <X size={20} />
        </button>
        <Moon className="lullaby-moon" size={38} strokeWidth={1} />
        <p className="eyebrow">YOU FOUND A QUIETER CORNER</p>
        <h2 id="lullaby-heading">
          {lullaby.title}
          <em>.</em>
        </h2>
        <p>Some words are better sung.</p>
        {lullaby.lyrics ? (
          <div className="lullaby-lyrics">{lullaby.lyrics}</div>
        ) : (
          <div className="lullaby-placeholder">
            <span>♪</span>
            <p>
              A little space saved for an original lullaby,
              <br />
              written just for you.
            </p>
            <span className="handwritten">
              Every good story has a secret track.
            </span>
          </div>
        )}
        {lullaby.audioSrc && (
          <audio
            ref={lullabyAudio}
            controls
            muted={!audio.soundOn}
            onPlay={() => {
              if (audio.musicOn) audio.toggleMusic();
            }}
            preload="none"
            src={lullaby.audioSrc}
            aria-label="Play the original lullaby"
          >
            Your browser does not support audio playback.
          </audio>
        )}
        <span className="lullaby-stars" aria-hidden="true">
          ✧ · ✦ · ✧
        </span>
      </dialog>
      <Confetti active={confetti} />
    </MotionConfig>
  );
}
