import type { Metadata, Viewport } from "next";
import "./globals.css";

const origin = "https://the-mirabel-experience.chukwumelapraise.chatgpt.site";

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: "The Mirabel Experience ✨ | A little corner, just for you",
  description:
    "An entire website. One wonderfully kind human. A little laughter, a few surprises, and a reminder that your kindness never goes unnoticed.",
  openGraph: {
    title: "The Mirabel Experience ✨",
    description:
      "An entire website. One wonderfully kind human. Made just for you, Mirabel.",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "The Mirabel Experience — a little corner of the internet, just for you.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Mirabel Experience ✨",
    images: ["/og-image.jpg"],
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
