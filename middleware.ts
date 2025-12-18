import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // This avoids Edge Runtime incompatibility issues with OpenID Client
  const sessionCookie =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value

  // Protect admin routes
  if (pathname.startsWith("/") || pathname.startsWith("/")) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith("/auth/") && sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/services/:path*",
    "/taxi/:path*",
    "/drivers/:path*",
    "/users-profile/:path*",
    "/driver-request/:path*",
    "/ride-history/:path*",
    "/promo-code/:path*",
    "/commission/:path*",
    "/settings/:path*",
  ],
}
