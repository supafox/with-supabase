import Link from "next/link"

import { source } from "@/lib/fumadocs/source"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export default function Docs() {
  const tree = source.pageTree

  return (
    <div className="container mx-auto flex flex-col gap-16 pt-36 pb-20">
      <div className="flex flex-col">
        <h1 className="heading-56">Docs</h1>
        <p className="copy-20 text-muted-foreground">
          Documentation for the project
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {tree?.children?.map(
          (item) =>
            item.type === "page" && (
              <div
                key={item.$id}
                className="border-border flex flex-col gap-4 rounded-lg border p-6"
              >
                <div className="flex flex-col gap-2">
                  <h2 className="heading-20">{item.name}</h2>
                  <p className="copy-16 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <Link
                  href={item.url}
                  className={cn(
                    buttonVariants({ variant: "link" }),
                    "w-fit pl-0"
                  )}
                >
                  Read more
                </Link>
              </div>
            )
        )}
      </div>
    </div>
  )
}
