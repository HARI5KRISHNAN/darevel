"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Darevel Auth
          </h1>
          <p className="text-gray-600">
            Sign in to access all Darevel apps
          </p>
        </div>

        <button
          onClick={() => signIn("keycloak", { callbackUrl })}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
        >
          Sign in with Keycloak
        </button>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Single Sign-On for all Darevel applications</p>
        </div>
      </div>
    </div>
  );
}
