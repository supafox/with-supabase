import type { Metadata } from "next"
import { brand } from "@/constants/brand"

import { baseUrl } from "@/lib/utils"

const site = baseUrl()

export const defaultMeta: Metadata = {
  metadataBase: site,
  title: {
    default: brand.name,
    template: "%s | " + brand.name,
  },
  description: brand.description,
  authors: [{ name: brand.name, url: site.href }],
  creator: process.env.NEXT_PUBLIC_TWITTER_CREATOR ?? brand.twitterHandle,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: brand.name,
    description: brand.description,
    url: site.href,
    siteName: brand.name,
    images: [
      {
        url: new URL("/opengraph/og-image.jpg", site).toString(),
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: brand.name,
    description: brand.description,
    site: process.env.NEXT_PUBLIC_TWITTER_SITE ?? brand.twitterHandle,
    creator: process.env.NEXT_PUBLIC_TWITTER_CREATOR ?? brand.twitterHandle,
    images: [
      {
        url: new URL("/opengraph/twitter-image.jpg", site).toString(),
        width: 1600,
        height: 800,
      },
    ],
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any", type: "image/x-icon" },
      { url: "/favicon/icon0.svg", type: "image/svg+xml" },
      { url: "/favicon/icon1.png", type: "image/png" },
    ],
    apple: [
      {
        url: "/favicon/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "android-chrome",
        url: "/web-app/web-app-manifest-192x192.png",
        sizes: "192x192",
      },
      {
        rel: "android-chrome",
        url: "/web-app/web-app-manifest-512x512.png",
        sizes: "512x512",
      },
    ],
  },
  manifest: "/web-app/manifest.json",
  appleWebApp: {
    title: brand.name,
    statusBarStyle: "black-translucent",
    capable: true,
  },
}
