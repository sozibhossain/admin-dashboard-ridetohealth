import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware() {
    // you can add custom logic here later if needed
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

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
