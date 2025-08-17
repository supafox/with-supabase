import { NextResponse, type NextRequest } from "next/server"
import { routes } from "@/constants/routes"
import { createServerClient } from "@supabase/ssr"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Validate required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL environment variable is not defined. Please check your environment configuration."
    )
  }

  if (!supabaseAnonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is not defined. Please check your environment configuration."
    )
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims
  const currentPath = request.nextUrl.pathname

  // Helper function to check if path matches any route in a category
  const isPathInCategory = (category: keyof typeof routes) => {
    return routes[category].some(
      (route) =>
        currentPath === route.path ||
        (route.allowSubpaths !== false &&
          currentPath.startsWith(route.path + "/"))
    )
  }

  // Check if current path is in auth routes
  const isAuthRoute = isPathInCategory("auth")

  // Check if current path is in protected routes
  const isProtectedRoute = isPathInCategory("protected")

  // If user is authenticated and trying to access auth routes, redirect to protected
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = routes.protected[0].path
    return NextResponse.redirect(url)
  }

  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    const loginRoute = routes.auth.find((r) => r.label === "Login")?.path
    if (!loginRoute) {
      throw new Error("Login route not found")
    }
    url.pathname = loginRoute
    return NextResponse.redirect(url)
  }

  // For marketing and documentation routes, allow access regardless of auth status
  // For protected routes with authenticated user, allow access
  // For auth routes with unauthenticated user, allow access
  // All other cases are handled above

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
