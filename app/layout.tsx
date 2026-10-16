import type { Metadata } from "next";

import "@fontsource-variable/playfair-display";
import "@fontsource-variable/plus-jakarta-sans";

import SiteChrome from "@/components/layout/SiteChrome";

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
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
