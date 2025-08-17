"use client"

import Link from "next/link"
import { routes } from "@/constants/routes"
import { useLogout } from "@/shared/hooks/use-logout"
import { useSession } from "@/shared/hooks/use-session"
import { IconLogout, IconUser } from "@tabler/icons-react"

import { Button, buttonVariants } from "@/components/ui/button"

export default function NavAuth() {
  const { session, isLoading } = useSession()
  const { handleLogout, isLoggingOut } = useLogout()

  // Get routes from constants
  const loginRoute =
    routes.auth.find((r) => r.label === "Login")?.path || "/auth/login"
  const profileRoute =
    routes.protected.find((r) => r.label === "Profile")?.path || "/profile"

  if (isLoading) {
    return (
      <div className={buttonVariants({ variant: "outline" })}>Loading...</div>
    )
  }

  if (!session) {
    return (
      <Link href={loginRoute} className={buttonVariants()}>
        Login
      </Link>
    )
  }

  return (
    <nav aria-label="User account" className="flex items-center gap-4">
      <Link href={profileRoute} className={buttonVariants()}>
        <IconUser aria-hidden="true" />
        Profile
      </Link>
      <Button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        variant="outline"
        aria-busy={isLoggingOut}
      >
        <IconLogout aria-hidden="true" />
        {isLoggingOut ? "Logging out..." : "Logout"}
      </Button>
    </nav>
  )
}
