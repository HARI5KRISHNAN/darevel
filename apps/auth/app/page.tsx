"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Darevel Auth
          </h1>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-semibold">
              ✓ Successfully authenticated!
            </p>
          </div>

          {session?.user && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                User Information
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-gray-700">
                  <span className="font-semibold">Name:</span>{" "}
                  {session.user.name || "N/A"}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Email:</span>{" "}
                  {session.user.email || "N/A"}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/signin" })}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
          >
            Sign Out
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Darevel Apps
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Suite", port: 3000 },
              { name: "Slides", port: 3001 },
              { name: "Chat", port: 3002 },
              { name: "Mail", port: 3003 },
              { name: "Excel", port: 3004 },
              { name: "Drive", port: 3006 },
              { name: "Notify", port: 3007 },
            ].map((app) => (
              <a
                key={app.name}
                href={`http://localhost:${app.port}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg p-4 text-center transition duration-200"
              >
                <div className="font-semibold text-indigo-900">{app.name}</div>
                <div className="text-sm text-indigo-600">:{app.port}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
