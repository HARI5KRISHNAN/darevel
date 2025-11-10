import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID || "darevel-auth",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "darevel-auth-secret-2025",
      issuer: process.env.KEYCLOAK_ISSUER || "http://localhost:8080/realms/pilot180",
    }),
  ],
  cookies: {
    sessionToken: {
      name: `next-auth.session-token.auth`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
      }
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and user info to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }

      if (profile) {
        token.email = profile.email;
        token.name = profile.name;
        token.sub = profile.sub;
      }

      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string;
      session.idToken = token.idToken as string;
      session.user = {
        ...session.user,
        id: token.sub as string,
      };
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
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
