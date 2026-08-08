import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/providers";
import { cookies } from "next/headers";
import { THEME_COOKIE, themeInitScript } from "@/lib/theme";
import LayoutNavigation from "@/components/LayoutNavigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TourismToolKit - Your Travel Companion",
  description:
    "Translation, speech, OCR and a personal phrasebook for travelling India in thirteen languages.",
  keywords: "tourism, travel, translation, OCR, speech-to-text, India, language learning",
  authors: [{ name: "TourismToolKit" }],
  // app/icon.png, app/apple-icon.png and app/favicon.ico are picked up by the
  // App Router automatically; these are declared for the manifest and for
  // crawlers that look for explicit links.
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "TourismToolKit",
    description:
      "Translation, speech, OCR and a personal phrasebook for travelling India.",
    images: ["/logo.png"],
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Rendering the class server-side is what removes the flash: previously the
  // blocking script set it, hydration reconciled <html> against a server render
  // that had no class and stripped it, then an effect put it back - visibly.
  const stored = (await cookies()).get(THEME_COOKIE)?.value;
  const theme = stored === 'dark' ? 'dark' : 'light';

  return (
    <html lang="en" className={theme} data-theme={theme} suppressHydrationWarning>
      <head>
        {/* Applies the stored theme before first paint. Without this the theme is
            only read in an effect, i.e. after the page has already painted light. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <LayoutNavigation>
            {children}
          </LayoutNavigation>
        </Providers>
      </body>
    </html>
  );
}
