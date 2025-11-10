import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Loft at Jindabyne",
  description:
    "Luxury alpine rental overlooking Lake Jindabyne with panoramic views, curated interiors, and effortless access to the Snowy Mountains.",
  metadataBase: new URL("https://theloftjindabyne.com"),
  openGraph: {
    title: "The Loft at Jindabyne",
    description:
      "Luxury alpine rental overlooking Lake Jindabyne with panoramic views and curated interiors.",
    url: "https://theloftjindabyne.com",
    siteName: "The Loft at Jindabyne",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Loft at Jindabyne",
    description:
      "Stay above the lake with alpine luxury, panoramic views, and Snowy Mountains adventures.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-slate-100">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
