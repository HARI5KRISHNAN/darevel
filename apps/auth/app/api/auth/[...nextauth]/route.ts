import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  jwt: {
    // Enable JWT encryption to prevent "Invalid Compact JWE" errors
    encryption: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Host-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        // Use localhost for development to avoid cookie domain issues
        domain: process.env.NEXTAUTH_COOKIE_DOMAIN || undefined,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      },
    },
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and refresh_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
      }
      if (profile) {
        token.email = profile.email;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.user.id = token.sub;
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/error",
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
