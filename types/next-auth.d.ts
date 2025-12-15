import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    id: string
    role: string
    accessToken: string
    refreshToken: string
    phoneNumber?: string
  }

  interface Session {
    user: {
      _id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      accessToken: string
      phoneNumber?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    accessToken: string
    refreshToken: string
    phoneNumber?: string
  }
}
