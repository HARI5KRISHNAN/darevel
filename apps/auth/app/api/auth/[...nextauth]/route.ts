import NextAuth from "next-auth"
import KeycloakProvider from "next-auth/providers/keycloak"
import { NextAuthOptions } from "next-auth"

const keycloakIssuer = process.env.KEYCLOAK_URL
  ? `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`
  : "http://keycloak.darevel.local:8080/realms/darevel"

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID || "darevel-auth",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "darevel-auth-secret-2025",
      issuer: keycloakIssuer,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.preferred_username || profile.name,
          email: profile.email,
          image: profile.picture ?? null,
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET || "darevel-nextauth-secret",
  },

  pages: {
    signIn: "/signin",
    error: "/signin",
  },

  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.sub,
          name: token.name,
          email: token.email,
        }
      }
      return session
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.id = profile.sub
      }
      return token
    },
  },

  debug: false, // turn on temporarily if you need to see raw logs
  secret: process.env.NEXTAUTH_SECRET || "darevel-nextauth-secret",
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
