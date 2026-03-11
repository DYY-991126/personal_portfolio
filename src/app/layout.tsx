import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import SmoothScroll from "@/components/ui/SmoothScroll";
import NoiseOverlay from "@/components/ui/NoiseOverlay";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-handwriting",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Minimalist professional portfolio with Swiss style",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} antialiased selection:bg-foreground selection:text-background`}
      >
        <NoiseOverlay />
        <SmoothScroll>
          <div className="min-h-screen flex flex-col relative z-10">
            {/* Main Content */}
            <main className="flex-1">
              {children}
            </main>
          </div>
        </SmoothScroll>
      </body>
    </html>
  );
}
