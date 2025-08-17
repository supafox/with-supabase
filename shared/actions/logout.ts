"use server"

import { createClient } from "@/lib/supabase/server"

export async function logout(): Promise<{
  success: boolean
  error?: { message: string; status?: number }
}> {
  const supabase = await createClient()

  // Perform server-side signOut to clear HttpOnly cookies set by your SSR/middleware
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Logout failed:", error)
    // Treat "not authenticated" as idempotent success
    if ((error as { status?: unknown })?.status === 401) {
      return { success: true }
    }
    const maybeStatus = (error as { status?: unknown })?.status
    const status = typeof maybeStatus === "number" ? maybeStatus : undefined
    return {
      success: false,
      error: { message: error.message, status },
    }
  }

  return { success: true }
}
