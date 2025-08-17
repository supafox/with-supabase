import { NextRequest, NextResponse } from "next/server"
import {
  deleteAvatar,
  updateUserProfile,
  uploadAvatar,
} from "@/features/user-profile/actions"
import type { ActionResult } from "@/features/user-profile/actions"

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
} as const

const ACTIONS = {
  UPDATE_PROFILE: "updateProfile",
  UPLOAD_AVATAR: "uploadAvatar",
  DELETE_AVATAR: "deleteAvatar",
} as const

type ActionType = (typeof ACTIONS)[keyof typeof ACTIONS]

// Type guard function to validate action
function isValidAction(action: string): action is ActionType {
  return Object.values(ACTIONS).includes(action as ActionType)
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    // CSRF protection: ensure same-origin POST
    const forwardedHost = request.headers.get("x-forwarded-host")
    const host = forwardedHost ?? request.headers.get("host")
    const originOrRef =
      request.headers.get("origin") ?? request.headers.get("referer")
    if (originOrRef && host) {
      try {
        const reqHost = request.nextUrl?.host ?? host
        const refHost = new URL(originOrRef).host
        if (refHost !== reqHost) {
          return NextResponse.json(
            { error: "Invalid origin" },
            {
              status: 403,
              headers: {
                ...NO_STORE_HEADERS,
                "Content-Type": "application/json",
              },
            }
          )
        }
      } catch {
        // Treat unparsable Origin/Referer as invalid
        return NextResponse.json(
          { error: "Invalid origin" },
          {
            status: 403,
            headers: {
              ...NO_STORE_HEADERS,
              "Content-Type": "application/json",
            },
          }
        )
      }
    }
    const action = formData.get("action")
    // Validate the incoming action against known actions
    if (typeof action !== "string" || !isValidAction(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        {
          status: 400,
          headers: {
            ...NO_STORE_HEADERS,
            "Content-Type": "application/json",
          },
        }
      )
    }
    const typedAction: ActionType = action

    let result: ActionResult

    switch (typedAction) {
      case ACTIONS.UPDATE_PROFILE:
        result = await updateUserProfile(formData)
        break
      case ACTIONS.UPLOAD_AVATAR:
        result = await uploadAvatar(formData)
        break
      case ACTIONS.DELETE_AVATAR:
        result = await deleteAvatar()
        break
      default: {
        const _exhaustiveCheck: never = typedAction
        console.error("Unhandled action:", _exhaustiveCheck)
        return NextResponse.json(
          { error: "Unhandled action" },
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

    // Handle unauthenticated case (result === null)
    if (result === null) {
      return NextResponse.json(
        { error: "Not authenticated" },
        {
          status: 401,
          headers: {
            ...NO_STORE_HEADERS,
            "Content-Type": "application/json",
          },
        }
      )
    }

    // Handle DELETE_AVATAR no-op case (no avatar to delete)
    if (
      typedAction === ACTIONS.DELETE_AVATAR &&
      "data" in result &&
      result.data === null
    ) {
      return NextResponse.json(
        { message: "No avatar to delete", data: null },
        {
          status: 200,
          headers: {
            ...NO_STORE_HEADERS,
            "Content-Type": "application/json",
          },
        }
      )
    }

    // Handle error cases
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        {
          status: 400,
          headers: {
            ...NO_STORE_HEADERS,
            "Content-Type": "application/json",
          },
        }
      )
    }

    // At this point, result must be { data: unknown }
    return NextResponse.json(
      { message: "Operation completed successfully", data: result.data },
      {
        status: 200,
        headers: {
          ...NO_STORE_HEADERS,
          "Content-Type": "application/json",
        },
      }
    )
  } catch (error) {
    console.error("Profile update failed:", error)
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
