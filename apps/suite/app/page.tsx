"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export default function SuitePage() {
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

  const apps = [
    {
      name: "Slides",
      port: 3001,
      icon: "📊",
      description: "Create stunning presentations",
      color: "from-purple-500 to-pink-500"
    },
    {
      name: "Chat",
      port: 3002,
      icon: "💬",
      description: "Team communication",
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Mail",
      port: 3003,
      icon: "✉️",
      description: "Email management",
      color: "from-red-500 to-orange-500"
    },
    {
      name: "Excel",
      port: 3004,
      icon: "📈",
      description: "Spreadsheet & data analysis",
      color: "from-green-500 to-emerald-500"
    },
    {
      name: "Auth",
      port: 3005,
      icon: "🔐",
      description: "Authentication center",
      color: "from-indigo-500 to-purple-500"
    },
    {
      name: "Drive",
      port: 3006,
      icon: "📁",
      description: "File storage & sharing",
      color: "from-yellow-500 to-orange-500"
    },
    {
      name: "Notify",
      port: 3007,
      icon: "🔔",
      description: "Real-time notifications",
      color: "from-blue-500 to-indigo-500"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Darevel Suite
              </h1>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/api/auth/signin" })}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-semibold">
              ✓ Successfully authenticated with SSO!
            </p>
          </div>

          {session?.user && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome, {session.user.name || session.user.email}!
              </h2>
              <p className="text-gray-600">
                You have access to all Darevel productivity apps with single sign-on
              </p>
              <div className="mt-4 bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-gray-700">
                  <span className="font-semibold">Email:</span> {session.user.email || "N/A"}
                </p>
                {session.user.name && (
                  <p className="text-gray-700">
                    <span className="font-semibold">Name:</span> {session.user.name}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Your Productivity Apps
          </h2>
          <p className="text-gray-600">
            Click any app to launch it in a new window. Your session is shared across all apps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <a
              key={app.name}
              href={`http://localhost:${app.port}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
            >
              <div className={`h-2 bg-gradient-to-r ${app.color}`}></div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="text-4xl mr-4">{app.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {app.name}
                    </h3>
                    <p className="text-sm text-gray-500">Port {app.port}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  {app.description}
                </p>
                <div className="mt-4 flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                  Launch App
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            🎯 Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="text-2xl mr-3">🔐</div>
              <div>
                <h4 className="font-semibold text-gray-900">Single Sign-On</h4>
                <p className="text-sm text-gray-600">Login once, access all apps seamlessly</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-2xl mr-3">⚡</div>
              <div>
                <h4 className="font-semibold text-gray-900">Fast & Secure</h4>
                <p className="text-sm text-gray-600">Powered by Keycloak authentication</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-2xl mr-3">🚀</div>
              <div>
                <h4 className="font-semibold text-gray-900">Modern Stack</h4>
                <p className="text-sm text-gray-600">Built with Next.js and React</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-2xl mr-3">🎨</div>
              <div>
                <h4 className="font-semibold text-gray-900">Beautiful UI</h4>
                <p className="text-sm text-gray-600">Designed with Tailwind CSS</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
