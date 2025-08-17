"use client"

import { useEffect, useState } from "react"
import { Session } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/client"

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Create client-side Supabase instance only when needed
    const supabase = createClient()
    let isMounted = true

    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (isMounted) {
          setSession(session)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setSession(session)
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { session, isLoading }
}
