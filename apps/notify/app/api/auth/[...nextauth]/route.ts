import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID || "darevel-notify",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "darevel-notify-secret-2025",
      issuer: process.env.KEYCLOAK_ISSUER || "http://localhost:8080/realms/pilot180",
    }),
  ],
  cookies: {
    sessionToken: {
      name: `next-auth.session-token.notify`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
        domain: ".darevel.local",
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url.notify`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
        domain: ".darevel.local",
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token.notify`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
        domain: ".darevel.local",
      }
    },
    pkceCodeVerifier: {
      name: `next-auth.pkce.code_verifier.notify`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
        domain: ".darevel.local",
      }
    },
    state: {
      name: `next-auth.state.notify`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
        domain: ".darevel.local",
      }
    },
    nonce: {
      name: `next-auth.nonce.notify`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
        domain: ".darevel.local",
      }
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, account, profile }) {
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
      // Allow redirects to any *.darevel.local subdomain for SSO
      else if (url.includes('.darevel.local')) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/signin",
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
