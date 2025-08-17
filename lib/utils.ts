import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Route utilities are now centralized in @/constants/routes
// - Use isRouteActive(currentPath, routePath, allowSubpaths) for consistent active state logic
// - Import sidebarData for centralized sidebar navigation
// - All route definitions are now in one place to avoid duplication

export function baseUrl() {
  const appUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://localhost:3000"

  const baseUrl = new URL(
    appUrl.startsWith("http") ? appUrl : `https://${appUrl}`
  )
  return baseUrl
}

export function absoluteUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return new URL(normalizedPath, baseUrl()).toString()
}
