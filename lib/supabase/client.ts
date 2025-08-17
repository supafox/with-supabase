import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const missingVars = []
  if (!url) missingVars.push("NEXT_PUBLIC_SUPABASE_URL")
  if (!key) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Supabase environment variables: ${missingVars.join(
        ", "
      )}`
    )
  }

  return createBrowserClient(url as string, key as string)
}
