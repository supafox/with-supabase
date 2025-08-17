import Link from "next/link"
import { notFound } from "next/navigation"
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"
import { findNeighbour } from "fumadocs-core/server"

import { source } from "@/lib/fumadocs/source"
import { absoluteUrl } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { mdxComponents } from "@/components/mdx-components"

/**
 * Generates an Open Graph image URL with encoded title and description parameters
 */
function generateOgImageUrl(title: string, description: string): string {
  return `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`
}

export function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>
}) {
  const params = await props.params
  const page = source.getPage(params.slug)

  if (!page) {
    notFound()
  }

  const doc = page.data

  if (!doc.title || !doc.description) {
    notFound()
  }

  const ogImageUrl = generateOgImageUrl(doc.title, doc.description)

  return {
    title: doc.title,
    description: doc.description,
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000"
    ),
    openGraph: {
      title: doc.title,
      description: doc.description,
      type: "article",
      url: absoluteUrl(page.url),
      images: [
        {
          url: ogImageUrl,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: doc.title,
      description: doc.description,
      images: [
        {
          url: ogImageUrl,
        },
      ],
      creator: process.env.NEXT_PUBLIC_TWITTER_CREATOR,
    },
  }
}

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>
}) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) {
    notFound()
  }

  const doc = page.data
  const MDX = doc.body
  const neighbours = await findNeighbour(source.pageTree, page.url)

  return (
    <div
      data-slot="docs"
      className="container mx-auto flex flex-col gap-16 pt-36 pb-20"
    >
      <div className="flex items-start justify-between gap-16 md:items-center">
        <div className="flex flex-col">
          <h1 className="text-heading-56">{doc.title}</h1>
          <p className="text-copy-20 text-muted-foreground">
            {doc.description}
          </p>
        </div>
        <div className="flex max-w-2xl gap-2">
          {neighbours.previous && (
            <Link
              href={neighbours.previous.url}
              className={buttonVariants({ variant: "secondary", size: "icon" })}
            >
              <IconArrowLeft />
            </Link>
          )}

          {neighbours.next && (
            <Link
              href={neighbours.next.url}
              className={buttonVariants({ variant: "secondary", size: "icon" })}
            >
              <IconArrowRight />
            </Link>
          )}
        </div>
      </div>
      <div className="w-full flex-1">
        <MDX components={mdxComponents} />
      </div>
      <div className="flex items-center justify-between">
        {neighbours.previous && (
          <Link
            href={neighbours.previous.url}
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            <IconArrowLeft />
            {neighbours.previous.name}
          </Link>
        )}
        {neighbours.next && (
          <Link
            href={neighbours.next.url}
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            {neighbours.next.name}
            <IconArrowRight />
          </Link>
        )}
      </div>
    </div>
  )
}
