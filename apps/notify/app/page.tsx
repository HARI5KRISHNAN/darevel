"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export default function NotifyPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/api/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-blue-900">
              Darevel Notify
            </h1>
            <button
              onClick={() => signOut({ callbackUrl: "/api/auth/signin" })}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
            >
              Sign Out
            </button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-semibold">
              ✓ Successfully authenticated with SSO!
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
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Real-time Notifications
          </h2>
          <p className="text-gray-600 mb-6">
            Stay updated with real-time notifications across all apps. Coming soon!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                🔔 Instant Alerts
              </h3>
              <p className="text-sm text-gray-600">
                Get notified instantly about important updates
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                📊 Activity Feed
              </h3>
              <p className="text-sm text-gray-600">
                Track all activities across your workspace
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Other Darevel Apps
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: "Suite", port: 3000 },
                { name: "Slides", port: 3001 },
                { name: "Chat", port: 3002 },
                { name: "Mail", port: 3003 },
                { name: "Excel", port: 3004 },
                { name: "Auth", port: 3005 },
                { name: "Drive", port: 3006 },
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
    </div>
  );
}
