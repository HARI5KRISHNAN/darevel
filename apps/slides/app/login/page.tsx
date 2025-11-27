"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/editor";
  const error = searchParams.get("error");

  const handleKeycloakLogin = () => {
    signIn("keycloak", { callbackUrl });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Darevel Slides</h1>
          <p className="text-slate-400">Sign in to create presentations</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
            <p className="text-red-400 text-sm">
              {error === "OAuthSignin" && "Error starting authentication"}
              {error === "OAuthCallback" && "Error during authentication callback"}
              {error === "OAuthCreateAccount" && "Error creating account"}
              {error === "Callback" && "Authentication callback error"}
              {error === "AccessDenied" && "Access denied"}
              {error === "Configuration" && "Server configuration error"}
              {!["OAuthSignin", "OAuthCallback", "OAuthCreateAccount", "Callback", "AccessDenied", "Configuration"].includes(error) && "An error occurred during sign in"}
            </p>
          </div>
        )}

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-xl">
          <button
            onClick={handleKeycloakLogin}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
            Sign in with Darevel SSO
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-800/50 text-slate-500">Secure SSO Login</span>
            </div>
          </div>

          <p className="text-center text-slate-500 text-sm">
            Single Sign-On across all Darevel apps
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
