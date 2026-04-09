import "./globals.css";
import type { Metadata } from "next";
import {
  Inter,
  Cinzel_Decorative,
  Cinzel,
  Crimson_Text,
  IBM_Plex_Mono,
} from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HtmlThemeSync } from "@/components/providers/HtmlThemeSync";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzelDeco = Cinzel_Decorative({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-cinzel-deco",
});
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });
const crimson = Crimson_Text({
  weight: ["400", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-crimson",
});
const ibmMono = IBM_Plex_Mono({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "The Watchtower — Tzaphah",
  description: "Prophetic Intelligence for Scattered Israel",
  manifest: "/manifest.json",
};

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bodyClass = `${inter.variable} ${cinzelDeco.variable} ${cinzel.variable} ${crimson.variable} ${ibmMono.variable} min-h-screen flex flex-col bg-background-base`;

  const inner = (
    <>
      <HtmlThemeSync />
      <Header showAuth={hasClerk} />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );

  return (
    <html lang="en" className="dark">
      <body className={bodyClass}>
        {hasClerk ? (
          <ClerkProvider afterSignOutUrl="/">{inner}</ClerkProvider>
        ) : (
          inner
        )}
      </body>
    </html>
  );
}
