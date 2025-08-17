import { NextResponse } from "next/server"
import { getProfile } from "@/shared/actions/user"

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
} as const

export async function GET() {
  try {
    const result = await getProfile()

    if (!result.success) {
      switch (result.error) {
        case "UNAUTHENTICATED":
          return NextResponse.json(
            { error: "Authentication required" },
            {
              status: 401,
              headers: {
                ...NO_STORE_HEADERS,
                "Content-Type": "application/json",
              },
            }
          )
        case "PROFILE_NOT_FOUND":
          return NextResponse.json(
            { error: "Profile not found" },
            {
              status: 404,
              headers: {
                ...NO_STORE_HEADERS,
                "Content-Type": "application/json",
              },
            }
          )
        case "DATABASE_ERROR":
          if (process.env.NODE_ENV !== "production") {
            console.error("Database error fetching profile:", result.details)
          } else {
            console.error("Database error fetching profile")
          }
          return NextResponse.json(
            { error: "Internal server error" },
            {
              status: 500,
              headers: {
                ...NO_STORE_HEADERS,
                "Content-Type": "application/json",
              },
            }
          )
        default:
          return NextResponse.json(
            { error: "Internal server error" },
            {
              status: 500,
              headers: {
                ...NO_STORE_HEADERS,
                "Content-Type": "application/json",
              },
            }
          )
      }
    }

    return NextResponse.json(result.profile, {
      headers: {
        ...NO_STORE_HEADERS,
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: {
          ...NO_STORE_HEADERS,
          "Content-Type": "application/json",
        },
      }
    )
  }
}
