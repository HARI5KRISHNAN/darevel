'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { motion } from 'framer-motion'
import {
  Mail,
  Inbox,
  Send,
  FileText,
  Star,
  Trash2,
  Plus,
  Loader2,
  Search,
  Paperclip,
  X
} from "lucide-react"
import Header from '../components/Header'
import '../../styles/glass.css'

interface Email {
  id: number
  fromEmail: string
  fromName: string
  toEmail: string
  subject: string
  body: string
  isRead: boolean
  isStarred: boolean
  folder: string
  createdAt: string
}

export default function MailPage() {
  const { data: session, status } = useSession()
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [folder, setFolder] = useState('inbox')
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [composing, setComposing] = useState(false)
  const [composeData, setComposeData] = useState({
    toEmail: '',
    subject: '',
    body: ''
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/api/auth/signin")
    }
  }, [status])

  useEffect(() => {
    if (status === "authenticated") {
      loadEmails()
    }
  }, [status, folder])

  const loadEmails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8081/api/mail/${folder}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      if (!response.ok) throw new Error("Failed to load emails")

      const result = await response.json()
      setEmails(result.data.content || [])
    } catch (err) {
      console.error("Error loading emails:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCompose = async () => {
    if (!composeData.toEmail || !composeData.subject) {
      alert("Please fill in recipient and subject")
      return
    }

    try {
      setComposing(true)
      const response = await fetch("http://localhost:8081/api/mail/compose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          ...composeData,
          isDraft: false
        }),
      })

      if (!response.ok) throw new Error("Failed to send email")

      setComposeOpen(false)
      setComposeData({ toEmail: '', subject: '', body: '' })
      alert("Email sent successfully!")
      if (folder === 'sent') loadEmails()
    } catch (err: any) {
      alert("Failed to send email: " + err.message)
    } finally {
      setComposing(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this email?")) return

    try {
      const response = await fetch(`http://localhost:8081/api/mail/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      if (!response.ok) throw new Error("Failed to delete")

      setEmails(emails.filter(e => e.id !== id))
      setSelectedEmail(null)
    } catch (err: any) {
      alert("Failed to delete: " + err.message)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a093f] to-[#0a001f]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#1a093f] to-[#0a001f] text-white">
      <Header />

      <main className="pt-24 px-6 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-sky-400 bg-clip-text text-transparent">
              Darevel Mail
            </h1>
            <p className="text-gray-300">Manage your emails securely</p>
          </div>

          {/* Mail Interface */}
          <div className="backdrop-blur-2xl bg-white/10 rounded-3xl border border-white/10 shadow-xl overflow-hidden glass-shimmer">
            <div className="flex h-[600px]">
              {/* Sidebar */}
              <div className="w-64 border-r border-white/10 p-4">
                <button
                  onClick={() => setComposeOpen(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-sky-400 text-white py-3 rounded-lg font-semibold mb-6 hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Compose
                </button>

                <div className="space-y-1">
                  {[
                    { id: 'inbox', label: 'Inbox', icon: Inbox },
                    { id: 'sent', label: 'Sent', icon: Send },
                    { id: 'drafts', label: 'Drafts', icon: FileText },
                    { id: 'starred', label: 'Starred', icon: Star },
                    { id: 'trash', label: 'Trash', icon: Trash2 },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { setFolder(item.id); setSelectedEmail(null) }}
                      className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition ${
                        folder === item.id
                          ? 'bg-white/20 text-white'
                          : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email List */}
              <div className="w-80 border-r border-white/10 overflow-y-auto">
                {emails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Mail className="w-12 h-12 mb-2 opacity-50" />
                    <p>No emails in {folder}</p>
                  </div>
                ) : (
                  emails.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={`p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition ${
                        selectedEmail?.id === email.id ? 'bg-white/10' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className={`font-semibold ${email.isRead ? 'text-gray-300' : 'text-white'}`}>
                          {email.fromName || email.fromEmail}
                        </p>
                        {email.isStarred && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                      </div>
                      <p className="text-sm text-gray-400 truncate">{email.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(email.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Email Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {selectedEmail ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{selectedEmail.subject}</h2>
                        <p className="text-gray-300">
                          From: <span className="text-purple-400">{selectedEmail.fromName || selectedEmail.fromEmail}</span>
                        </p>
                        <p className="text-gray-300">
                          To: <span className="text-sky-400">{selectedEmail.toEmail}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(selectedEmail.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(selectedEmail.id)}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-200 whitespace-pre-wrap">{selectedEmail.body}</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <Mail className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>Select an email to read</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Compose Modal */}
      {composeOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 shadow-2xl w-full max-w-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">New Message</h3>
              <button
                onClick={() => setComposeOpen(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="email"
                placeholder="To"
                value={composeData.toEmail}
                onChange={(e) => setComposeData({ ...composeData, toEmail: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <input
                type="text"
                placeholder="Subject"
                value={composeData.subject}
                onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <textarea
                placeholder="Message"
                value={composeData.body}
                onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                rows={10}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleCompose}
                  disabled={composing}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-sky-400 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {composing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send
                    </>
                  )}
                </button>
                <button
                  onClick={() => setComposeOpen(false)}
                  className="px-6 py-3 border border-white/20 rounded-lg text-white hover:bg-white/10 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <footer className="mt-12 py-8 text-center text-gray-400 border-t border-white/10 bg-white/5 backdrop-blur-lg">
        © 2025 <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-sky-400">Darevel</span> — Unified Workspace for the Future.
      </footer>
    </div>
  )
}
