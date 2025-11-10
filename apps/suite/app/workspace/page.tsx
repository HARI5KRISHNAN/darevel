'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Header from '../components/Header'
import '../../styles/glass.css'

export default function WorkspacePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#1a093f] to-[#0a001f] text-white">
      <Header />

      {/* Page content starts below header */}
      <main className="pt-32 flex flex-col items-center text-center px-6">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-sky-400 bg-clip-text text-transparent">
            Darevel Workspace
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mb-16">
            Your unified dashboard for managing all Darevel tools and productivity apps.
          </p>

          <div className="backdrop-blur-2xl bg-white/10 p-6 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden glass-shimmer max-w-5xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-sky-400/10 blur-3xl"></div>
            <Image
              src="/images/dummy-workspace-ui.png"
              alt="Darevel Workspace Preview"
              width={1200}
              height={700}
              className="rounded-2xl object-cover relative z-10"
            />
            <div className="glass-shimmer-overlay"></div>
          </div>

          <p className="text-gray-400 mt-8 text-sm">
            🚀 Replace this mockup with your real Darevel Workspace interface.
          </p>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="mt-24 py-8 text-center text-gray-400 border-t border-white/10 bg-white/5 backdrop-blur-lg">
        © 2025 <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-sky-400">Darevel</span> — Unified Workspace for the Future.
      </footer>
    </div>
  )
}
