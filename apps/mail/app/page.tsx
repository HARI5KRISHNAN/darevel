"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Mail, Sparkles, Shield, Zap } from "lucide-react"

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/70 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Darevel Mail</span>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
          >
            Launch App
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Email Assistant
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-gray-900">
            Smart Email
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Management
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Leverage AI to manage your inbox efficiently. Smart replies, intelligent sorting, and productivity features at your fingertips.
          </p>

          <button
            onClick={() => router.push("/dashboard")}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:shadow-xl transition"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Powerful Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "AI-Powered Replies",
                description: "Generate intelligent email responses with AI assistance",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Shield,
                title: "Smart Filtering",
                description: "Automatically organize and prioritize your emails",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Quick actions and keyboard shortcuts for power users",
                color: "from-orange-500 to-red-500",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center text-gray-600">
          <p>&copy; 2025 Darevel Mail. Part of the Darevel Suite.</p>
        </div>
      </footer>
    </div>
  )
}
