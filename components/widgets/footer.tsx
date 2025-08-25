import Link from "next/link"
import { externalRoutes } from "@/constants/external-routes"

import { Icons } from "@/config/icons"
import { buttonVariants } from "@/components/ui/button"

export default function Footer() {
  return (
    <footer className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 mt-auto border-t backdrop-blur">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center md:gap-8">
          <nav
            className="flex flex-col items-center gap-4 md:flex-row md:gap-6"
            role="navigation"
            aria-label="Footer navigation"
          >
            <Link
              className={buttonVariants({ variant: "link", size: "sm" })}
              href={externalRoutes.learn}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Learn Next.js (opens in new tab)"
            >
              <Icons.file
                className="text-muted-foreground size-4"
                aria-hidden="true"
              />
              Learn
            </Link>
            <Link
              className={buttonVariants({ variant: "link", size: "sm" })}
              href={externalRoutes.templates}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Next.js templates (opens in new tab)"
            >
              <Icons.window
                className="text-muted-foreground size-4"
                aria-hidden="true"
              />
              Templates
            </Link>
            <Link
              className={buttonVariants({ variant: "link", size: "sm" })}
              href={externalRoutes.nextjs}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Next.js website (opens in new tab)"
            >
              <Icons.globe
                className="text-muted-foreground size-4"
                aria-hidden="true"
              />
              Go to nextjs.org
              <span aria-hidden="true">→</span>
            </Link>
          </nav>
        </div>
        <div className="mt-6 text-center">
          <p className="copy-14 text-muted-foreground">
            Built with Next.js and Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  )
}
