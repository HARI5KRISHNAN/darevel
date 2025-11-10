"use client"

import { ArrowRight, Zap, TrendingUp, Camera, Sparkles, Palette, Printer, Building2 } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

const SolutionsDropdown = ({ isOpen }: { isOpen: boolean }) => {
  const solutions = [
    {
      title: "Chat",
      desc: "AI-powered conversations to enhance collaboration.",
      icon: TrendingUp,
      color: "from-magenta-500 to-pink-500",
    },
    {
      title: "Mail",
      desc: "Intelligent email tools for productivity.",
      icon: Camera,
      color: "from-cyan-500 to-blue-500",
    },
    {
      title: "Spreadsheet",
      desc: "Smart data management with AI insights.",
      icon: Sparkles,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "PowerPoint",
      desc: "Create stunning presentations instantly.",
      icon: Palette,
      color: "from-purple-400 to-magenta-500",
    },
    {
      title: "Printing",
      desc: "Effortless document printing with AI optimization.",
      icon: Printer,
      color: "from-green-500 to-blue-500",
    },
    {
      title: "Business",
      desc: "AI-driven solutions for businesses of all sizes.",
      icon: Building2,
      color: "from-yellow-500 to-orange-500",
    },
  ]

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-screen max-w-2xl"
    >
      <div className="mx-auto px-6">
        <div
          className="rounded-2xl p-8 backdrop-blur-xl border border-white/20"
          style={{
            background: "rgba(0, 0, 0, 0.95)",
            boxShadow: "0 8px 32px 0 rgba(168, 85, 247, 0.25)",
          }}
        >
          <div className="grid grid-cols-2 gap-6">
            {solutions.map((solution, idx) => {
              const IconComponent = solution.icon
              return (
                <motion.div key={idx} whileHover={{ x: 5 }} className="flex items-start gap-4 cursor-pointer group">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${solution.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition`}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1 group-hover:text-purple-300 transition">
                      {solution.title}
                    </h3>
                    <p className="text-sm text-gray-300 group-hover:text-gray-200 transition">{solution.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Home() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-gradient-to-r from-purple-600/30 via-purple-500/20 to-pink-500/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-bold">Darevel</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm relative">
            <div className="relative group">
              <button
                className="hover:text-purple-300 transition flex items-center gap-1"
                onMouseEnter={() => setOpenDropdown("features")}
              >
                Features
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </div>

            <div className="relative group" onMouseLeave={() => setOpenDropdown(null)}>
              <button
                className="hover:text-purple-300 transition flex items-center gap-1"
                onMouseEnter={() => setOpenDropdown("solutions")}
              >
                Solutions
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              <SolutionsDropdown isOpen={openDropdown === "solutions"} />
            </div>

            <div className="relative group">
              <button
                className="hover:text-purple-300 transition flex items-center gap-1"
                onMouseEnter={() => setOpenDropdown("learn")}
              >
                Learn
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </div>

            <a href="#" className="hover:text-purple-300 transition">
              For Teams
            </a>
            <a href="#" className="hover:text-purple-300 transition">
              For Developers
            </a>
            <a href="#" className="hover:text-purple-300 transition">
              Pricing
            </a>
            <a href="#" className="hover:text-purple-300 transition">
              Contact
            </a>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 rounded-full border border-white/30 hover:border-purple-400 transition text-sm hover:bg-white/10 cursor-pointer"
          >
            Launch App
          </button>
        </div>
      </nav>

      {/* Hero Section with Floating Images */}
      <section className="relative min-h-screen pt-24 px-6 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-black to-pink-900/40">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(45deg, transparent 24%, rgba(168, 85, 247, 0.1) 25%, rgba(168, 85, 247, 0.1) 26%, transparent 27%, transparent 74%, rgba(168, 85, 247, 0.1) 75%, rgba(168, 85, 247, 0.1) 76%, transparent 77%, transparent), linear-gradient(-45deg, transparent 24%, rgba(168, 85, 247, 0.1) 25%, rgba(168, 85, 247, 0.1) 26%, transparent 27%, transparent 74%, rgba(168, 85, 247, 0.1) 75%, rgba(168, 85, 247, 0.1) 76%, transparent 77%, transparent)",
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>

        {/* Floating Images - Left side */}
        <motion.div
          className="absolute left-0 top-32 w-64 h-80 rounded-3xl overflow-hidden border-2 border-purple-500/50 shadow-2xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
          style={{ transform: "perspective(1000px) rotateY(-30deg) rotateX(5deg)" }}
        >
          <img src="/colorful-portrait-art.jpg" alt="AI art 1" className="w-full h-full object-cover" />
        </motion.div>

        {/* Floating Images - Bottom Left */}
        <motion.div
          className="absolute left-20 bottom-0 w-56 h-64 rounded-3xl overflow-hidden border-2 border-purple-400/50 shadow-2xl"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
          style={{ transform: "perspective(1000px) rotateY(25deg) rotateX(-10deg)" }}
        >
          <img src="/landscape-photography-warm-sunset.jpg" alt="AI art 2" className="w-full h-full object-cover" />
        </motion.div>

        {/* Floating Images - Right side */}
        <motion.div
          className="absolute right-0 top-40 w-64 h-80 rounded-3xl overflow-hidden border-2 border-cyan-500/50 shadow-2xl"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 4.5, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
          style={{ transform: "perspective(1000px) rotateY(30deg) rotateX(5deg)" }}
        >
          <img src="/nature-wildlife-animal-tiger.jpg" alt="AI art 3" className="w-full h-full object-cover" />
        </motion.div>

        {/* Floating Images - Bottom Right */}
        <motion.div
          className="absolute right-20 bottom-20 w-56 h-64 rounded-3xl overflow-hidden border-2 border-pink-400/50 shadow-2xl"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5.5, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
          style={{ transform: "perspective(1000px) rotateY(-25deg) rotateX(-5deg)" }}
        >
          <img src="/black-and-white-dramatic-moody.jpg" alt="AI art 4" className="w-full h-full object-cover" />
        </motion.div>

        {/* Center Content */}
        <div className="relative z-20 max-w-4xl mx-auto text-center">
          <motion.h1
            className="text-7xl md:text-8xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Creativity,
            <br />
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
              Unleashed.
            </span>
          </motion.h1>

          <motion.p
            className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Leverage generative AI with a unique suite of tools to convey your ideas to the world.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex gap-4 justify-center items-center flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <button className="px-8 py-3 rounded-full border border-white/30 hover:border-purple-400 transition font-semibold">
              Get Started
            </button>
            <button className="flex items-center gap-2 text-white/70 hover:text-white transition">
              Developer API <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Center Dashboard - Large preview */}
          <motion.div
            className="mt-16 relative z-30 mx-auto max-w-3xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div
              className="rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl"
              style={{
                border: "2px solid",
                borderImage: "linear-gradient(135deg, rgba(168, 85, 247, 0.8) 0%, rgba(34, 211, 238, 0.8) 100%)",
                borderImageSlice: 1,
                boxShadow: "0 8px 32px 0 rgba(168, 85, 247, 0.3), inset 0 0 20px rgba(168, 85, 247, 0.1)",
              }}
            >
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-NVV6SvcAqNNWpnoBVXhr9Io8J9ytZC.png"
                alt="Darevel Dashboard Interface"
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Rest of the page sections */}
      <section className="px-6 py-20 relative z-10 bg-gradient-to-b from-transparent via-black to-black">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                For Creators,
              </span>
              <br />
              Teams & Developers
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mt-4">
              Darevel adapts to your workflow, empowering you to create at scale with cutting-edge AI.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {[
              {
                title: "For Creators",
                desc: "Create production-quality content for your projects with unprecedented speed.",
              },
              {
                title: "For Teams",
                desc: "Bring your team's best ideas to life at scale with our intuitive AI-first suite.",
              },
              { title: "For Developers", desc: "Experience content creation excellence with Darevel's API." },
            ].map((item, idx) => (
              <div key={idx} className="glass p-8 rounded-2xl hover:border-purple-500/50 transition">
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-300">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-20 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold">Join millions using Darevel</h2>
            <p className="text-gray-400 mt-4">Our users love creating with us. Here's what they say:</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "Darevel gave me a way to express myself in completely new ways.",
                author: "Creative Designer",
              },
              {
                quote: "Perfect for those starting their journey with AI. Wide range of tools included.",
                author: "Tech Entrepreneur",
              },
              {
                quote: "With its powerful models, Darevel makes everything a breeze. Amazing community!",
                author: "Digital Artist",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="glass p-6 rounded-xl"
              >
                <p className="text-gray-300 italic mb-4">"{item.quote}"</p>
                <p className="font-semibold text-sm">{item.author}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="px-6 py-20 text-center border-t border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-bold mb-6">
            Create your next
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              masterpiece
            </span>
          </h2>
          <p className="text-gray-300 text-lg mb-8">With the power of Darevel. No credit card needed.</p>
          <button className="bg-gradient-to-r from-purple-600 to-purple-500 px-8 py-4 rounded-full font-bold text-white text-lg hover:shadow-lg hover:shadow-purple-500/50 transition">
            Get started free
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-12 bg-black/50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-semibold mb-4">Darevel</h4>
            <p className="text-gray-400 text-sm">Empowering creativity with AI.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Security
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2025 Darevel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
