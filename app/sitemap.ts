import type { MetadataRoute } from "next"
import { routes } from "@/constants/routes"

import { baseUrl } from "@/lib/utils"

/**
 * Generates a sitemap containing multiple entries for marketing and documentation pages.
 *
 * @returns An array of sitemap entries including:
 * - Marketing pages with yearly change frequency and priorities (1.0 for home, 0.8 for others)
 * - Documentation pages with yearly change frequency and priorities (0.8 for home, 0.6 for others)
 * Each entry includes the full URL, current date as last modified, change frequency, and priority.
 *
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = baseUrl().toString()

  // Create sitemap entries for all marketing pages
  const marketingEntries = routes.marketing.map((route) => ({
    url: `${base}${route.path}`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: route.path === "/" ? 1 : 0.8,
  }))

  // Create sitemap entries for all doc pages
  const docEntries = routes.documentation.map((route) => ({
    url: `${base}${route.path}`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: route.path === "/docs" ? 0.8 : 0.6,
  }))

  return [...marketingEntries, ...docEntries]
}
