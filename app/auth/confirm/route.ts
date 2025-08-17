import { NextResponse, type NextRequest } from "next/server"
import { routes } from "@/constants/routes"

import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? routes.protected[0].path

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(
    `${origin}/auth/error?error=${encodeURIComponent("No token hash or type")}`
  )
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const email = formData.get("email") as string
    const otp = formData.get("otp") as string

    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    })

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({ data })
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 })
  }
}
