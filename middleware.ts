export { default } from "next-auth/middleware"

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
