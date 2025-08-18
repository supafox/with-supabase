import type { Metadata } from "next"

import { fontMono, fontSans } from "@/config/fonts"

import "@/styles/globals.css"

import { headers } from "next/headers"
import { defaultMeta } from "@/constants/seo"
import { JotaiProvider } from "@/providers/jotai-provider"
import { ThemeProvider } from "@/providers/theme-provider"
import { getProfile } from "@/shared/actions/user"

import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  ...defaultMeta,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  const nonce = headersList.get("x-nonce") ?? undefined

  const profileResult = await getProfile()
  const profile = profileResult.success ? profileResult.profile : null

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          nonce={nonce}
        >
          <JotaiProvider initialProfile={profile}>{children}</JotaiProvider>
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}
