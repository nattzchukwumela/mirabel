import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom has no layout/animation engine. Keep the actual interactive components,
// while replacing animation wrappers with their equivalent native elements.
vi.mock("motion/react", async () => {
  const React = await import("react");
  const cache = new Map<
    string,
    ReturnType<typeof React.forwardRef<HTMLElement, Record<string, unknown>>>
  >();
  const motionProps = new Set([
    "initial",
    "animate",
    "exit",
    "transition",
    "viewport",
    "variants",
    "whileInView",
    "whileHover",
    "whileTap",
    "layout",
    "layoutId",
  ]);
  const motion = new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        if (!cache.has(tag)) {
          const Component = React.forwardRef<
            HTMLElement,
            Record<string, unknown>
          >((props, ref) => {
            const nativeProps = Object.fromEntries(
              Object.entries(props).filter(([key]) => !motionProps.has(key)),
            );
            return React.createElement(tag, { ...nativeProps, ref });
          });
          Component.displayName = `MotionMock.${tag}`;
          cache.set(tag, Component);
        }
        return cache.get(tag);
      },
    },
  );
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children);
  return {
    motion,
    AnimatePresence: Wrapper,
    MotionConfig: Wrapper,
    useReducedMotion: () => true,
    useInView: () => true,
    useScroll: () => ({ scrollYProgress: 0, scrollY: 0 }),
    useSpring: (value: number) => value,
    useTransform: () => 0,
  };
});

vi.mock("next/image", async () => {
  const React = await import("react");
  return {
    default: ({
      fill: _fill,
      priority: _priority,
      ...props
    }: {
      fill?: boolean;
      priority?: boolean;
      [key: string]: unknown;
    }) => React.createElement("img", props),
  };
});

class TestIntersectionObserver {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly thresholds = [0];
  constructor(private callback: IntersectionObserverCallback) {}
  observe(target: Element) {
    this.callback(
      [
        {
          target,
          isIntersecting: true,
          intersectionRatio: 1,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    );
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn((query: string) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.stubGlobal("IntersectionObserver", TestIntersectionObserver);
vi.stubGlobal("ResizeObserver", TestResizeObserver);
vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
  window.setTimeout(() => callback(performance.now()), 16),
);
vi.stubGlobal("cancelAnimationFrame", (id: number) => window.clearTimeout(id));
Object.defineProperty(window, "scrollTo", {
  configurable: true,
  value: vi.fn(),
});
Object.defineProperty(HTMLElement.prototype, "scrollBy", {
  configurable: true,
  value: vi.fn(),
});
Object.defineProperty(HTMLElement.prototype, "scrollTo", {
  configurable: true,
  value: vi.fn(),
});
Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
  configurable: true,
  value: vi.fn(),
});
// jsdom cannot decode media. These stubs let the UI's mute, retry, and pause
// behavior run while leaving actual browser playback outside this test suite.
Object.defineProperty(HTMLMediaElement.prototype, "pause", {
  configurable: true,
  value: vi.fn(),
});
Object.defineProperty(HTMLMediaElement.prototype, "load", {
  configurable: true,
  value: vi.fn(),
});

// Model native dialog opening, focus restoration, and the close event. The app
// continues to own its selected-photo state and body-scroll cleanup.
const dialogTriggers = new WeakMap<HTMLDialogElement, Element | null>();
Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
  configurable: true,
  value(this: HTMLDialogElement) {
    dialogTriggers.set(this, document.activeElement);
    this.setAttribute("open", "");
    this.querySelector<HTMLElement>(
      "[autofocus], button, input, audio",
    )?.focus();
  },
});
Object.defineProperty(HTMLDialogElement.prototype, "close", {
  configurable: true,
  value(this: HTMLDialogElement) {
    if (!this.open) return;
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
    const trigger = dialogTriggers.get(this);
    if (trigger instanceof HTMLElement) trigger.focus({ preventScroll: true });
  },
});

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  delete document.documentElement.dataset.theme;
  document.body.style.overflow = "";
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  document.body.style.overflow = "";
});
