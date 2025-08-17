import type { MetadataRoute } from "next"

import { baseUrl } from "@/lib/utils"

/**
 * Generates robots.txt rules and sitemap URL for the application.
 *
 * Returns a configuration object specifying user-agent-specific crawling rules and the absolute sitemap URL, based on the application's base URL from the environment.
 *
 * @returns A {@link MetadataRoute.Robots} object containing robots.txt directives and sitemap location.
 *
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: "/nogooglebot/",
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: "/nobingbot/",
      },
      {
        userAgent: "Slurp",
        allow: "/",
        disallow: "/noslurp/",
      },
      {
        userAgent: "Yandex",
        allow: "/",
        disallow: "/noyandexbot/",
      },
      {
        userAgent: "DuckDuckBot",
        allow: "/",
        disallow: "/noduckduckbot/",
      },
      {
        userAgent: "Baiduspider",
        allow: "/",
        disallow: "/nobaidubot/",
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/private/", "/_next/", "/_static/"],
      },
    ],
    sitemap: new URL("/sitemap.xml", baseUrl()).toString(),
  }
}
