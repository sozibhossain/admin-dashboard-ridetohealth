import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        emailOrPhone: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.emailOrPhone || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              emailOrPhone: credentials.emailOrPhone,
              password: credentials.password,
            }),
          })

          const result = await response.json()

          if (!response.ok || !result.success) {
            throw new Error(result.message || "Login failed")
          }

          return {
            id: result.data.user.id,
            email: result.data.user.email,
            name: result.data.user.fullName,
            image: result.data.user.profileImage,
            role: result.data.user.role,
            accessToken: result.data.token,
            refreshToken: result.data.refreshToken,
            phoneNumber: result.data.user.phoneNumber,
          }
        } catch (error: any) {
          throw new Error(error.message || "Authentication failed")
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.role = user.role
        token.id = user.id
        token.phoneNumber = user.phoneNumber
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token.id as string
        session.user.role = token.role as string
        session.user.accessToken = token.accessToken as string
        session.user.phoneNumber = token.phoneNumber as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}
