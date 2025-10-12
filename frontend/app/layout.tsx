import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/providers";
import LayoutNavigation from "@/components/LayoutNavigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TourismToolKit - Your Travel Companion",
  description: "A comprehensive tourism app with language translation, OCR, speech-to-text, and travel assistance features",
  keywords: "tourism, travel, translation, OCR, speech-to-text, India, language learning",
  authors: [{ name: "TourismToolKit Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
