import React from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"

const validateImageDimension = (value: unknown): number | null => {
  if (!value) return null
  if (typeof value === "number") return value > 0 ? value : null
  const parsed = parseInt(String(value), 10)
  return !isNaN(parsed) && parsed > 0 ? parsed : null
}

export const mdxComponents = {
  h1: ({ className, ...props }: React.ComponentProps<"h1">) => (
    <h1 className={cn("heading-48 mt-2 scroll-m-28", className)} {...props} />
  ),
  h2: ({ className, ...props }: React.ComponentProps<"h2">) => {
    return (
      <h2
        className={cn(
          "heading-40 mt-12 scroll-m-28 first:mt-0 lg:mt-20 [&+p]:!mt-4",
          className
        )}
        {...props}
      />
    )
  },
  h3: ({ className, ...props }: React.ComponentProps<"h3">) => (
    <h3 className={cn("heading-32 mt-10 scroll-m-28", className)} {...props} />
  ),
  h4: ({ className, ...props }: React.ComponentProps<"h4">) => (
    <h4 className={cn("heading-28 mt-8 scroll-m-28", className)} {...props} />
  ),
  h5: ({ className, ...props }: React.ComponentProps<"h5">) => (
    <h5 className={cn("heading-24 mt-6 scroll-m-28", className)} {...props} />
  ),
  h6: ({ className, ...props }: React.ComponentProps<"h6">) => (
    <h6 className={cn("heading-20 mt-4 scroll-m-28", className)} {...props} />
  ),
  a: ({ className, ...props }: React.ComponentProps<"a">) => (
    <a className={cn("underline underline-offset-4", className)} {...props} />
  ),
  p: ({ className, ...props }: React.ComponentProps<"p">) => (
    <p
      className={cn("copy-16 [&:not(:first-child)]:mt-6", className)}
      {...props}
    />
  ),
  strong: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className={cn("copy-14-semibold", className)} {...props} />
  ),
  ul: ({ className, ...props }: React.ComponentProps<"ul">) => (
    <ul className={cn("my-6 ml-6 list-disc", className)} {...props} />
  ),
  ol: ({ className, ...props }: React.ComponentProps<"ol">) => (
    <ol className={cn("my-6 ml-6 list-decimal", className)} {...props} />
  ),
  li: ({ className, ...props }: React.ComponentProps<"li">) => (
    <li className={cn("mt-2", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: React.ComponentProps<"blockquote">) => (
    <blockquote
      className={cn("mt-6 border-l-2 pl-6 italic", className)}
      {...props}
    />
  ),
  img: ({ className, alt, ...props }: React.ComponentProps<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={cn("rounded-md", className)} alt={alt || ""} {...props} />
  ),
  hr: ({ ...props }: React.ComponentProps<"hr">) => (
    <hr className="my-4 md:my-8" {...props} />
  ),
  table: ({ className, ...props }: React.ComponentProps<"table">) => (
    <div className="my-6 w-full overflow-y-auto">
      <table
        className={cn(
          "copy-14 relative w-full overflow-hidden border-none",
          className
        )}
        {...props}
      />
    </div>
  ),
  tr: ({ className, ...props }: React.ComponentProps<"tr">) => (
    <tr
      className={cn("last:border-b-none m-0 border-b", className)}
      {...props}
    />
  ),
  th: ({ className, ...props }: React.ComponentProps<"th">) => (
    <th
      className={cn("copy-14-semibold px-4 py-2 text-left", className)}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.ComponentProps<"td">) => (
    <td className={cn("px-4 py-2", className)} {...props} />
  ),
  pre: ({ className, children, ...props }: React.ComponentProps<"pre">) => {
    return (
      <pre
        className={cn(
          "no-scrollbar min-w-0 overflow-x-auto px-4 py-3.5 outline-none has-[[data-highlighted-line]]:px-0 has-[[data-line-numbers]]:px-0 has-[[data-slot=tabs]]:p-0",
          className
        )}
        {...props}
      >
        {children}
      </pre>
    )
  },
  code: ({ className, children, ...props }: React.ComponentProps<"code">) => {
    if (typeof children === "string") {
      return (
        <code
          className={cn(
            "bg-muted copy-14 relative rounded-md px-[0.3rem] py-[0.2rem] font-mono break-words outline-none",
            className
          )}
          {...props}
        >
          {children}
        </code>
      )
    }

    // Default codeblock for syntax highlighted code
    return (
      <code className={cn("font-mono", className)} {...props}>
        {children}
      </code>
    )
  },
  Image: ({
    src,
    className,
    width,
    height,
    alt,
    ...props
  }: React.ComponentProps<"img">) => {
    // Validate required props
    const isValidSrc = src && typeof src === "string" && src.trim() !== ""
    const validWidth = validateImageDimension(width)
    const validHeight = validateImageDimension(height)

    // Fallback dimensions if invalid
    const fallbackWidth = validWidth ?? 800
    const fallbackHeight = validHeight ?? 600

    // Handle invalid source
    if (!isValidSrc) {
      return (
        <div
          className={cn(
            "bg-muted/50 mt-6 flex h-64 w-full items-center justify-center rounded-md border border-dashed",
            className
          )}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="copy-14 text-muted-foreground">
              Invalid image source
            </div>
            <div className="copy-14 text-muted-foreground">
              {alt || "Image"}
            </div>
          </div>
        </div>
      )
    }

    return (
      <Image
        src={src}
        width={fallbackWidth}
        height={fallbackHeight}
        className={cn("mt-6 rounded-md border", className)}
        alt={alt || ""}
        loading="lazy"
        {...props}
      />
    )
  },
}
