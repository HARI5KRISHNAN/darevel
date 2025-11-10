'use client'

import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-[#3b0a68] via-[#2b004a] to-[#16002b] text-white shadow-lg border-b border-white/10">
      <div className="flex justify-between items-center px-10 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-sky-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">⚡</span>
          </div>
          <span className="text-xl font-semibold">Darevel</span>
        </div>

        {/* Nav Links */}
        <nav className="flex items-center gap-8 text-sm font-medium">
          <Link href="#" className="flex items-center gap-1 hover:text-purple-300 transition">
            Features <ChevronDown className="w-4 h-4" />
          </Link>
          <Link href="#" className="flex items-center gap-1 hover:text-purple-300 transition">
            Solutions <ChevronDown className="w-4 h-4" />
          </Link>
          <Link href="#" className="flex items-center gap-1 hover:text-purple-300 transition">
            Learn <ChevronDown className="w-4 h-4" />
          </Link>
          <Link href="#" className="hover:text-purple-300 transition">For Teams</Link>
          <Link href="#" className="hover:text-purple-300 transition">For Developers</Link>
          <Link href="#" className="hover:text-purple-300 transition">Pricing</Link>
          <Link href="#" className="hover:text-purple-300 transition">Contact</Link>
        </nav>

        {/* Launch Button */}
        <Link
          href="/"
          className="border border-white/30 px-5 py-2 rounded-full text-sm hover:bg-white/10 transition"
        >
          Launch App
        </Link>
      </div>
    </header>
  )
}
