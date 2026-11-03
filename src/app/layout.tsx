import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ||
    "https://the-mirabel-experience.chukwumelapraise.chatgpt.site",
);
const shareImage = {
  url: new URL("/og.jpg", siteUrl).toString(),
  width: 1600,
  height: 840,
  type: "image/jpeg",
  alt: "The Mirabel Experience — a lavender and pink scrapbook celebrating a friend who makes the world a little kinder.",
};

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "The Mirabel Experience ✨ | A little corner, just for you",
  description:
    "An entire website. One wonderfully kind human. A little laughter, a few surprises, and a reminder that your kindness never goes unnoticed.",
  openGraph: {
    url: siteUrl.toString(),
    siteName: "The Mirabel Experience",
    title: "The Mirabel Experience ✨",
    description:
      "An entire website. One wonderfully kind human. Made just for you, Mirabel.",
    type: "website",
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Mirabel Experience ✨",
    description:
      "An entire website. One wonderfully kind human. Made just for you, Mirabel.",
    images: [{ url: shareImage.url, alt: shareImage.alt }],
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf7f2",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.dataset.theme=localStorage.getItem('mirabel-theme')==='night'?'night':'day'}catch{}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
