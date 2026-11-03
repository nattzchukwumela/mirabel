# The Mirabel Experience

A playful, personal appreciation website celebrating Mirabel's kindness and friendship. The story moves from a teasing welcome through her personality and interests, into a sincere letter, a joyful surprise, and a quiet final reminder. The tone is explicitly about gratitude and friendship.

The complete application lives in **`experience/`**, with all supplied photographs inside `public/images/`. It uses Next.js App Router, TypeScript, Tailwind CSS, Motion, and Lucide icons. There is no database, application login, payment system, or backend.

## Run locally

From the repository root:

```bash
cd experience
pnpm install
pnpm dev
```

Open `http://localhost:3000`. Use Node.js 20.9 or newer.

```bash
pnpm typecheck
pnpm test
pnpm build
```

The production build is a **static export in `out/`**. Serve that directory with any static host. For a local production preview, `npx serve out` works. This project does not require a running Next.js server in production.

## The experience

- An animated welcome, photo keepsake, handwritten notes, scroll progress, chapter navigation, and smooth transitions.
- A playful character dossier with animated personality statistics and a hidden note.
- Four interactive interest chapters: a touch- and keyboard-friendly volleyball keep-up game, a virtual Navessa Allen bookshelf, a compliment terminal, and a warm faith scene.
- A swipeable 13-photo scrapbook with full-size viewing, arrow-key navigation, and accessible dialog controls.
- An envelope that opens into the complete appreciation letter. The letter unfolds progressively, with a **Read it all** control to reveal it immediately.
- A humorous appreciation meter that refuses to go below 100%, celebrates increases, and plays optional sound effects.
- An animated mystery present, sparkles, and confetti. Its reveal keeps the physical gift secret.
- A starry final scene, native sharing where supported, and clipboard/manual link-copy fallbacks.
- Three hidden notes and a secret **The Lullaby** corner, discoverable through the moon near the ending.
- Soft daylight and magical nighttime themes, a brief loading animation, and optional original background music with play/pause, volume, and mute controls.

Music is **off on every initial visit** and starts only after an explicit press of the play control. The original ambient music-box melody and interaction sounds are generated locally with Web Audio; no music file or streaming service is needed. Mute and volume preferences can be saved locally. The theme preference is also saved locally, and the volleyball best score lasts for the browser session. These are optional browser conveniences; the website works when storage is unavailable.

## Personalize the photographs

All 13 supplied originals have been moved from the former `her/` folder into **`public/images/originals/`**, preserving their filenames and file contents. The gallery uses smaller, descriptively named JPEGs directly in **`public/images/`**. The deleted photograph has been removed from both the gallery and its optimized assets. Optimized JPEGs have no EXIF metadata; black bars and the screenshot footer are cropped where applicable.

The gallery reads **`public/images/manifest.json`**. Each entry contains:

```json
{
  "src": "/images/your-photo.jpg",
  "alt": "A clear description of the photograph",
  "width": 960,
  "height": 1280,
  "objectPosition": "50% 42%",
  "caption": "A little moment worth keeping."
}
```

Put display photos in `public/images/`, then add or update their entries in the manifest, including dimensions, alt text, focal position, and `caption`. Keep original files in `public/images/originals/`. The gallery reads captions from the manifest and repeats its decorative rotations automatically, so it supports additional photos without editing component arrays. Remove a photograph's manifest entry and its display file to take it out of the gallery.

The welcome uses `/images/hero.jpg`, and the profile uses `/images/mirabel-headphones.jpg`. Replace those files directly or update the corresponding `Image` references and alt text in **`src/components/experience.tsx`**. `public/og-image.jpg` is the custom 1200 × 630 share preview with Mirabel's actual portrait.

## Add the original lullaby

Edit **`src/lib/personalization.ts`**:

```ts
export const lullaby = {
  title: "The Lullaby",
  lyrics: `Your original lyrics go here.\nA second line can follow.`,
  audioSrc: "/audio/mirabel-lullaby.mp3",
};
```

Create `public/audio/` and add the recording there. Leave `audioSrc` empty to show lyrics without a player, or leave both fields empty to retain the intentional secret-track placeholder. An added recording uses a native audio player and does not autoplay. The same personalization file contains the complete letter text.

The gift's physical details are intentionally absent. Edit the reveal copy in `src/components/experience.tsx` if you later want to add collection instructions.

## Accessibility and privacy

The design responds to mobile screens, supports keyboard navigation and visible focus indicators, provides image descriptions, and uses native dialogs for full-size photos and the lullaby. The experience respects **`prefers-reduced-motion`**: decorative movement is reduced, and the letter can appear immediately. The optional volleyball game remains interactive.

Fonts are hosted locally in `public/fonts/`; no Google Fonts request is needed at runtime. Their SIL Open Font licenses are included in `public/fonts/FONT-LICENSES.txt`.

The Sites deployment is **private and owner-only** unless its sharing settings are changed. The share control copies the current link; copying it does not grant access to another person. Change the Site's sharing/audience settings before sending it to Mirabel. This privacy is supplied by hosting, not by an application login. The site also asks search engines not to index or follow it.

If you move to another host or domain, update `metadataBase` in `src/app/layout.tsx` so social previews resolve correctly, then rebuild. Anyone granted access can view the photographs served by that deployment.

## Verification

Ten automated interaction tests cover the letter, appreciation meter, interest tabs, gift reveal, theme, hidden ability, gallery, lullaby, sound-panel keyboard focus, and volleyball keyboard controls. Run them with `pnpm test`. These use jsdom and do not replace visual device testing. Browser visual QA was unavailable in the build environment.

The build uses Next.js’s supported Webpack compiler and in-process TypeScript checking for compatibility with restricted environments.
