import type { Metadata } from "next";

import "@fontsource-variable/playfair-display";
import "@fontsource-variable/plus-jakarta-sans";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Zaram Hotels & Garden",
    template: "%s | Zaram Hotels & Garden",
  },
  description:
    "Comfortable rooms, warm hospitality and a relaxing stay at Zaram Hotels & Garden.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
