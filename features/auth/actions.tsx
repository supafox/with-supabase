"use server"

import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { absoluteUrl } from "@/lib/utils"

export async function requestOtp(formData: FormData) {
  const emailEntry = formData.get("email")
  if (typeof emailEntry !== "string" || emailEntry.trim() === "") {
    throw new Error("Email is required")
  }
  const email = emailEntry.trim().toLowerCase()

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: absoluteUrl("auth/confirm"),
    },
  })

  if (error) {
    throw error
  }

  return data
}

export async function signInWithGithub() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: absoluteUrl("auth/confirm"),
    },
  })
  if (error) {
    throw error
  }
  if (data.url) {
    redirect(data.url)
  }
}
