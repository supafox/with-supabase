"use server"

import type { Profile } from "@/lib/jotai/profile"
import type { Tables } from "@/lib/supabase/database.types"
import { createClient } from "@/lib/supabase/server"

// Define result types for better error handling
export type ProfileResult =
  | { success: true; profile: Profile }
  | { success: false; error: "UNAUTHENTICATED" }
  | { success: false; error: "PROFILE_NOT_FOUND" }
  | { success: false; error: "DATABASE_ERROR"; details?: string }

export async function getProfile(): Promise<ProfileResult> {
  const supabase = await createClient()

  // Check authentication first
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) {
    return { success: false, error: "UNAUTHENTICATED" }
  }

  const user = authData.user
  const userId = user.id

  // Fetch profile data with proper typing
  const { data, error } = await supabase
    .from("profiles")
    .select("username, full_name, email, avatar_url")
    .eq("id", userId)
    .maybeSingle<
      Pick<
        Tables<"profiles">,
        "username" | "full_name" | "email" | "avatar_url"
      >
    >()

  if (error) {
    // Optionally log on the server (e.g. console.error or a logger)
    if (process.env.NODE_ENV === "production") {
      console.error("[getProfile] DB error", { code: error.code })
    }
    return {
      success: false,
      error: "DATABASE_ERROR",
      details:
        process.env.NODE_ENV !== "production" ? error.message : undefined,
    }
  }

  if (!data) {
    return { success: false, error: "PROFILE_NOT_FOUND" }
  }

  const profile: Profile = {
    username: data.username ?? null,
    fullName: data.full_name ?? null,
    email: data.email ?? null,
    avatarUrl: data.avatar_url ?? null,
  }

  return { success: true, profile }
}
