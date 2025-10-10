// app/layout.jsx

import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import PWAFeatures from "@/components/PWAFeatures";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PodCastify: Your Podcast Streaming Platform",
  description:
    "Stream podcasts, read blogs, and discover advertisements in one place",
  manifest: "/manifest.json",
  themeColor: "#7C3AED",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PodCastify",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LayoutWrapper>{children}</LayoutWrapper>
        <PWAFeatures />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
