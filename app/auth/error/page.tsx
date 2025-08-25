import Link from "next/link"
import { routes } from "@/constants/routes"
import { IconAlertCircle, IconArrowLeft } from "@tabler/icons-react"

import { buttonVariants } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center gap-2">
              <IconAlertCircle className="text-destructive size-10" />
              <span className="sr-only">Authentication Error</span>
            </div>
            <h1 className="heading-20">Authentication Error</h1>
            <p className="copy-14 text-center">
              There was a problem with your authentication
            </p>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="error">Error Message</Label>
            <div className="bg-destructive/10 rounded-lg p-4">
              <p className="copy-14 text-destructive">{params?.error}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href={(() => {
                const loginRoute = routes.auth.find(
                  (r) => r.label === "Login"
                )?.path
                if (!loginRoute) {
                  throw new Error("Login route not found")
                }
                return loginRoute
              })()}
              className={buttonVariants()}
            >
              <IconArrowLeft />
              Back to Login
            </Link>
            <Link
              href={routes.marketing[0].path}
              className={buttonVariants({ variant: "outline" })}
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
