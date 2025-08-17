import { NextRequest, NextResponse } from "next/server"

import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  // Update Supabase session first
  const supabaseResponse = await updateSession(request)

  // Generate a random CSP nonce
  const nonceBytes = new Uint8Array(16)
  crypto.getRandomValues(nonceBytes)
  // Convert to base64 without using Buffer (Edge runtime compatible)
  const nonce = btoa(
    Array.from(nonceBytes, (byte) => String.fromCharCode(byte)).join("")
  )

  const cspHeader = `
    default-src 'self';
    script-src 'strict-dynamic' 'nonce-${nonce}' ${
      process.env.NODE_ENV === "production" ? "" : `'unsafe-eval'`
    };
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://avatar.vercel.sh https://avatars.githubusercontent.com${
      process.env.NEXT_PUBLIC_SUPABASE_URL
        ? " " + new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
        : ""
    };
    font-src 'self';
    connect-src 'self'${
      process.env.NEXT_PUBLIC_SUPABASE_URL
        ? " " +
          new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin +
          " wss://" +
          new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
        : ""
    } https://vitals.vercel-insights.com https://cdn.vercel-insights.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim()

  // Clone request headers and set x-nonce so Server Components can read it
  const forwardedRequestHeaders = new Headers(request.headers)
  forwardedRequestHeaders.set("x-nonce", nonce)

  // If Supabase requested a redirect, return it directly with headers set
  const isRedirect =
    supabaseResponse.headers.has("location") &&
    supabaseResponse.status >= 300 &&
    supabaseResponse.status < 400

  if (isRedirect) {
    supabaseResponse.headers.set("x-nonce", nonce)
    supabaseResponse.headers.set("Content-Security-Policy", cspHeader)
    return supabaseResponse
  }

  // For normal flows, pass the cloned headers (with nonce) forward
  const response = NextResponse.next({
    request: { headers: forwardedRequestHeaders },
  })

  // Preserve cookies set by Supabase
  for (const cookie of supabaseResponse.cookies.getAll()) {
    response.cookies.set(cookie)
  }

  // Set security headers on the response
  response.headers.set("x-nonce", nonce)
  response.headers.set("Content-Security-Policy", cspHeader)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source:
        "/((?!api|_next/static|_next/image|favicon|web-app|opengraph|images).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}
