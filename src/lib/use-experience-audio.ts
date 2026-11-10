"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SoundKind =
  | "error"
  | "success"
  | "sparkle"
  | "click"
  | "tab"
  | "toggle"
  | "paper"
  | "terminal"
  | "ball_serve"
  | "ball_bump"
  | "ball_bounce"
  | "ball_drop";
type Voice = { oscillator: OscillatorNode; gain: GainNode; music: boolean };
type AudioEngine = {
  context: AudioContext;
  master: GainNode;
  voices: Set<Voice>;
  timer: ReturnType<typeof setInterval> | null;
  chord: number;
};

const VOLUME_KEY = "mirabel:volume";
const SOUND_KEY = "mirabel:sound";
const CHORD_SECONDS = 4.8;

// An original, quiet four-chord music-box loop. No audio is downloaded.
const CHORDS = [
  [261.63, 329.63, 392, 493.88],
  [220, 261.63, 329.63, 392],
  [174.61, 220, 261.63, 329.63],
  [196, 246.94, 293.66, 392],
];

function remember(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private browsing and blocked storage should not affect the experience.
  }
}

function clearMusic(engine: AudioEngine) {
  if (engine.timer !== null) {
    clearInterval(engine.timer);
    engine.timer = null;
  }
  const now = engine.context.currentTime;
  for (const voice of engine.voices) {
    if (!voice.music) continue;
    try {
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setTargetAtTime(0, now, 0.06);
      voice.oscillator.stop(now + 0.25);
    } catch {
      // A voice can have already finished while the tab was suspended.
    }
  }
}

function tone(
  engine: AudioEngine,
  frequency: number,
  start: number,
  duration: number,
  level: number,
  music: boolean,
  type: OscillatorType = "sine",
) {
  const oscillator = engine.context.createOscillator();
  const gain = engine.context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(
    level,
    start + Math.min(0.12, duration / 5),
  );
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(engine.master);
  const voice = { oscillator, gain, music };
  engine.voices.add(voice);
  oscillator.onended = () => {
    engine.voices.delete(voice);
    oscillator.disconnect();
    gain.disconnect();
  };
  oscillator.start(start);
  oscillator.stop(start + duration + 0.04);
}

function sweep(
  engine: AudioEngine,
  startFreq: number,
  endFreq: number,
  start: number,
  duration: number,
  level: number,
  type: OscillatorType = "sine",
) {
  const oscillator = engine.context.createOscillator();
  const gain = engine.context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(startFreq, start);
  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(20, endFreq),
    start + duration,
  );
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(level, start + Math.min(0.015, duration / 4));
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(engine.master);
  const voice = { oscillator, gain, music: false };
  engine.voices.add(voice);
  oscillator.onended = () => {
    engine.voices.delete(voice);
    oscillator.disconnect();
    gain.disconnect();
  };
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
}

function scheduleChord(engine: AudioEngine) {
  const start = engine.context.currentTime + 0.05;
  const notes = CHORDS[engine.chord % CHORDS.length];
  notes.forEach((frequency, index) => {
    // Soft sustained tones underneath a little ascending music-box melody.
    tone(engine, frequency / 2, start, 5.4, 0.033, true);
    tone(engine, frequency * 2, start + index * 0.48, 2.1, 0.025, true);
  });
  tone(engine, notes[2] * 2, start + 2.5, 2.0, 0.018, true);
  tone(engine, notes[1] * 2, start + 3.2, 2.0, 0.016, true);
  engine.chord += 1;
}

/**
 * One shared audio controller for the experience. Call its actions directly from
 * buttons: the AudioContext is created only by those user gestures.
 */
export function useExperienceAudio() {
  const [musicOn, setMusicOn] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [volume, setVolumeState] = useState(0.35);
  const engineRef = useRef<AudioEngine | null>(null);
  const musicWanted = useRef(false);
  const soundEnabled = useRef(true);
  const volumeRef = useRef(0.35);
  const mounted = useRef(true);

  const ensureAudio = useCallback(async (): Promise<AudioEngine | null> => {
    if (typeof window === "undefined" || !mounted.current) return null;
    try {
      if (!engineRef.current) {
        const AudioConstructor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!AudioConstructor) {
          musicWanted.current = false;
          setMusicOn(false);
          soundEnabled.current = false;
          setSoundOn(false);
          return null;
        }
        const context = new AudioConstructor();
        const master = context.createGain();
        master.gain.value = soundEnabled.current ? volumeRef.current : 0;
        master.connect(context.destination);
        engineRef.current = {
          context,
          master,
          voices: new Set(),
          timer: null,
          chord: 0,
        };
      }
      const engine = engineRef.current;
      if (engine.context.state === "suspended") await engine.context.resume();
      if (!mounted.current) return null;
      if (engine.context.state !== "running") {
        musicWanted.current = false;
        setMusicOn(false);
        return null;
      }
      return engine;
    } catch {
      if (mounted.current) {
        musicWanted.current = false;
        setMusicOn(false);
      }
      return null;
    }
  }, []);

  const startMusic = useCallback((engine: AudioEngine) => {
    if (
      !musicWanted.current ||
      !soundEnabled.current ||
      document.hidden ||
      engine.timer !== null
    )
      return;
    scheduleChord(engine);
    engine.timer = setInterval(() => {
      if (!musicWanted.current || !soundEnabled.current || document.hidden) {
        clearMusic(engine);
        return;
      }
      scheduleChord(engine);
    }, CHORD_SECONDS * 1000);
  }, []);

  const toggleMusic = useCallback(() => {
    const wantsMusic = !musicWanted.current;
    musicWanted.current = wantsMusic;
    if (!wantsMusic) {
      setMusicOn(false);
      if (engineRef.current) clearMusic(engineRef.current);
      return;
    }
    // Pressing play is an explicit request to hear the music.
    soundEnabled.current = true;
    setSoundOn(true);
    remember(SOUND_KEY, "on");
    void ensureAudio().then((engine) => {
      if (!engine || !mounted.current) {
        if (mounted.current) setMusicOn(false);
        musicWanted.current = false;
        return;
      }
      engine.master.gain.setTargetAtTime(
        soundEnabled.current ? volumeRef.current : 0,
        engine.context.currentTime,
        0.08,
      );
      if (musicWanted.current) {
        setMusicOn(true);
        startMusic(engine);
      }
    });
  }, [ensureAudio, startMusic]);

  const toggleSound = useCallback(() => {
    const enabled = !soundEnabled.current;
    soundEnabled.current = enabled;
    setSoundOn(enabled);
    remember(SOUND_KEY, enabled ? "on" : "off");
    const engine = engineRef.current;
    if (!engine) return;
    engine.master.gain.setTargetAtTime(
      enabled ? volumeRef.current : 0,
      engine.context.currentTime,
      0.04,
    );
    if (!enabled) {
      clearMusic(engine);
    } else if (musicWanted.current) {
      void ensureAudio().then((ready) => {
        if (ready && mounted.current) startMusic(ready);
      });
    }
  }, [ensureAudio, startMusic]);

  const setVolume = useCallback((next: number) => {
    if (!Number.isFinite(next)) return;
    const normalized = Math.max(0, Math.min(1, next));
    volumeRef.current = normalized;
    setVolumeState(normalized);
    remember(VOLUME_KEY, String(normalized));
    const engine = engineRef.current;
    if (engine) {
      engine.master.gain.setTargetAtTime(
        soundEnabled.current ? normalized : 0,
        engine.context.currentTime,
        0.04,
      );
    }
  }, []);

  const playEffect = useCallback(
    (kind: SoundKind) => {
      if (!soundEnabled.current || document.hidden) return;
      void ensureAudio().then((engine) => {
        if (
          !engine ||
          !mounted.current ||
          !soundEnabled.current ||
          document.hidden
        )
          return;
        const start = engine.context.currentTime + 0.01;
        switch (kind) {
          case "click":
            // Crisp, warm tactile UI tap
            sweep(engine, 640, 360, start, 0.045, 0.065, "sine");
            break;
          case "tab":
            // Gentle two-note kalimba chime
            tone(engine, 440, start, 0.14, 0.06, false, "sine");
            tone(engine, 554.37, start + 0.055, 0.18, 0.055, false, "sine");
            break;
          case "toggle":
            // Soft bubble pop
            sweep(engine, 380, 587.33, start, 0.085, 0.07, "sine");
            break;
          case "paper":
            // Soft three-note warm unfold chord
            [329.63, 392, 523.25].forEach((freq, idx) => {
              tone(engine, freq, start + idx * 0.045, 0.28, 0.055, false, "sine");
            });
            break;
          case "terminal":
            // Retro soft computer chirp
            tone(engine, 783.99, start, 0.07, 0.055, false, "triangle");
            tone(engine, 987.77, start + 0.06, 0.09, 0.055, false, "triangle");
            break;
          case "ball_serve":
            // Cheerful upward serve pop
            sweep(engine, 310, 520, start, 0.13, 0.1, "triangle");
            tone(engine, 659.25, start + 0.06, 0.16, 0.06, false, "sine");
            break;
          case "ball_bump":
            // Hollow resonant volleyball bump ("pock" / thump)
            sweep(engine, 220, 125, start, 0.11, 0.14, "triangle");
            sweep(engine, 440, 260, start, 0.06, 0.065, "sine");
            break;
          case "ball_bounce":
            // Soft high rebound off the top boundary
            sweep(engine, 300, 190, start, 0.075, 0.075, "sine");
            break;
          case "ball_drop":
            // Double floor thud when the ball lands on the court
            sweep(engine, 160, 62, start, 0.16, 0.14, "triangle");
            sweep(engine, 125, 55, start + 0.13, 0.11, 0.08, "sine");
            break;
          case "error":
            [293.66, 220].forEach((frequency, index) => {
              tone(engine, frequency, start + index * 0.09, 0.4, 0.09, false);
            });
            break;
          case "success":
            [523.25, 659.25, 783.99].forEach((frequency, index) => {
              tone(engine, frequency, start + index * 0.09, 0.4, 0.09, false);
            });
            break;
          case "sparkle":
          default:
            [659.25, 987.77, 1318.51].forEach((frequency, index) => {
              tone(engine, frequency, start + index * 0.09, 0.4, 0.09, false);
            });
            break;
        }
      });
    },
    [ensureAudio],
  );

  useEffect(() => {
    mounted.current = true;
    try {
      const storedVolume = localStorage.getItem(VOLUME_KEY);
      if (storedVolume !== null) {
        const parsed = Number(storedVolume);
        if (Number.isFinite(parsed)) {
          volumeRef.current = Math.max(0, Math.min(1, parsed));
          setVolumeState(volumeRef.current);
        }
      }
      const storedSound = localStorage.getItem(SOUND_KEY);
      if (storedSound === "off") {
        soundEnabled.current = false;
        setSoundOn(false);
      }
    } catch {
      // Storage is optional; music always starts off even if previously enabled.
    }
    const onVisibilityChange = () => {
      const engine = engineRef.current;
      if (!engine) return;
      if (document.hidden) {
        clearMusic(engine);
        void engine.context.suspend().catch(() => {});
      } else if (musicWanted.current && soundEnabled.current) {
        // Resuming is permitted only after an earlier explicit play gesture.
        void ensureAudio().then((ready) => {
          if (ready && mounted.current) startMusic(ready);
        });
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      mounted.current = false;
      musicWanted.current = false;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      const engine = engineRef.current;
      if (engine) {
        clearMusic(engine);
        for (const voice of engine.voices) {
          try {
            voice.oscillator.stop();
          } catch {
            /* Already stopped. */
          }
        }
        void engine.context.close().catch(() => {});
        engineRef.current = null;
      }
    };
  }, [ensureAudio, startMusic]);

  return {
    musicOn,
    soundOn,
    volume,
    toggleMusic,
    toggleSound,
    setVolume,
    playEffect,
  };
}
