"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { logout } from "@/shared/actions/logout"
import { toast } from "sonner"

export function useLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  const handleLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true)
      const result = await logout()

      if (result.success) {
        toast.success("Successfully logged out")
        router.replace("/auth/login")
        router.refresh()
      } else {
        toast.error("Failed to log out. Please try again.")
        console.error("Logout failed:", result.error)
      }
    } catch (error) {
      toast.error("An unexpected error occurred during logout")
      console.error("Logout failed:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }, [router])

  return { handleLogout, isLoggingOut }
}
