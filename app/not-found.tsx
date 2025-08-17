import Link from "next/link"
import { IconArrowLeft } from "@tabler/icons-react"

import { Icons } from "@/config/icons"
import { buttonVariants } from "@/components/ui/button"
import Image from "@/components/ui/image"

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8">
      <Icons.notFound className="text-muted-foreground/20 absolute inset-0 size-full px-20" />
      <Image
        src="/images/404-error.jpg"
        alt="404 Error"
        width={500}
        height={500}
        className="relative z-10"
        style={{ color: "" }}
      />
      <Link
        href="/"
        className={`${buttonVariants({ size: "lg" })} relative z-10`}
      >
        <IconArrowLeft />
        Go back
      </Link>
    </main>
  )
}
