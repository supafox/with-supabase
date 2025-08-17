"use client"

import { useEffect, useMemo } from "react"
import { createStore, Provider as JotaiRootProvider, useSetAtom } from "jotai"

import { profileAtom, type Profile } from "@/lib/jotai/profile"
import { createClient } from "@/lib/supabase/client"

type Props = {
  children: React.ReactNode
  initialProfile: Profile | null
}

function JotaiHydrator({ initialProfile }: { initialProfile: Profile | null }) {
  const setProfile = useSetAtom(profileAtom)

  useEffect(() => {
    const fetchAndSetProfile = async () => {
      try {
        // Check if user is authenticated before making the API call
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          setProfile(null)
          return
        }

        const response = await fetch("/profile/get-profile", {
          headers: {
            Accept: "application/json",
          },
        })

        // Check if response is JSON
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          console.warn(
            "Profile response is not JSON, likely a redirect:",
            contentType
          )
          setProfile(null)
          return
        }

        if (response.ok) {
          const profile = await response.json()
          setProfile(profile)
        } else if (response.status === 401) {
          // User is not authenticated, clear profile
          setProfile(null)
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        setProfile(null)
      }
    }

    // Create client-side Supabase instance only for auth state changes
    const supabase = createClient()

    // Only fetch profile if we don't have an initial profile
    if (!initialProfile) {
      // Add a small delay to ensure auth state is properly established
      setTimeout(async () => {
        // Double-check authentication before fetching
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.user) {
          fetchAndSetProfile()
        }
      }, 100)
    } else {
      // If we have an initial profile, set it immediately
      setProfile(initialProfile)
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (
          event === "INITIAL_SESSION" ||
          event === "SIGNED_IN" ||
          event === "USER_UPDATED"
        ) {
          // Only fetch if we don't already have a profile
          if (!initialProfile) {
            // Double-check authentication before fetching
            const {
              data: { session },
            } = await supabase.auth.getSession()
            if (session?.user) {
              await fetchAndSetProfile()
            }
          }
        } else if (event === "SIGNED_OUT") {
          setProfile(null)
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [initialProfile, setProfile])

  return null
}

export function JotaiProvider({ children, initialProfile }: Props) {
  const store = useMemo(() => {
    const newStore = createStore()
    newStore.set(profileAtom, initialProfile)
    return newStore
  }, [initialProfile])

  return (
    <JotaiRootProvider store={store}>
      <JotaiHydrator initialProfile={initialProfile} />
      {children}
    </JotaiRootProvider>
  )
}
