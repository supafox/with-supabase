import type { NextConfig } from "next"
import { createMDX } from "fumadocs-mdx/next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
      ...(process.env.NEXT_PUBLIC_SUPABASE_URL
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
              pathname: "/**",
            },
          ]
        : []),
    ],
  },
}

const withMDX = createMDX({
  /* config options here */
})

export default withMDX(nextConfig)
