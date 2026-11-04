import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat, Caveat, Inter } from "next/font/google";
import "./globals.css";

// Default fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Mupho Brand Custom Fonts
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "Mupho The Cleaner | Professional Cleaning Services",
  description: "Reliable, thorough and affordable cleaning solution for all your cleaning needs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} ${inter.variable} ${caveat.variable} h-full antialiased`}
    >
      {/* 
        We added 'font-body bg-white text-mupho-blue' here to ensure 
        the whole website inherits your brand identity by default.
      */}
      <body className="min-h-full flex flex-col font-body bg-white text-mupho-blue">
        {children}
      </body>
    </html>
  );
}
