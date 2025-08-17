import Link from "next/link"
import { externalRoutes } from "@/constants/external-routes"

import { Icons } from "@/config/icons"
import { buttonVariants } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 sm:p-20">
      <div className="row-start-2 flex flex-col items-center gap-[32px] sm:items-start">
        <Icons.next className="w-45" />
        <ol className="list-inside list-decimal text-center sm:text-left">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="rounded bg-black/[.05] px-1 py-0.5 font-mono dark:bg-white/[.06]">
              app/(public)/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            className={buttonVariants()}
            href={externalRoutes.deploy}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icons.vercel />
            Deploy now
          </Link>
          <Link
            className={buttonVariants({ variant: "outline" })}
            href={externalRoutes.nextjs}
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </Link>
        </div>
      </div>
    </main>
  )
}
