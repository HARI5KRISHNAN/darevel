'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { motion } from 'framer-motion'
import {
  MessageCircle,
  Send,
  Loader2,
  Search,
  Plus,
  User,
  X
} from "lucide-react"
import Header from '../components/Header'
import '../../styles/glass.css'

interface Message {
  id: number
  conversationId: number
  senderEmail: string
  senderName?: string
  content: string
  createdAt: string
  isRead: boolean
}

interface Conversation {
  id: number
  participantEmail: string
  participantName?: string
  lastMessage?: string
  lastMessageAt?: string
  unreadCount: number
}

export default function ChatPage() {
  const { data: session, status } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [newChatOpen, setNewChatOpen] = useState(false)
  const [newChatEmail, setNewChatEmail] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/api/auth/signin")
    }
  }, [status])

  useEffect(() => {
    if (status === "authenticated") {
      loadConversations()
    }
  }, [status])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadConversations = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:8081/api/chat/conversations", {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      if (!response.ok) throw new Error("Failed to load conversations")

      const result = await response.json()
      setConversations(result.data || [])
    } catch (err) {
      console.error("Error loading conversations:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: number) => {
    try {
      setMessagesLoading(true)
      const response = await fetch(
        `http://localhost:8081/api/chat/conversations/${conversationId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      )

      if (!response.ok) throw new Error("Failed to load messages")

      const result = await response.json()
      setMessages(result.data.content || [])
    } catch (err) {
      console.error("Error loading messages:", err)
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      setSending(true)
      const response = await fetch(
        `http://localhost:8081/api/chat/conversations/${selectedConversation.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            content: newMessage,
          }),
        }
      )

      if (!response.ok) throw new Error("Failed to send message")

      const result = await response.json()
      setMessages([...messages, result.data])
      setNewMessage('')

      // Refresh conversations to update last message
      loadConversations()
    } catch (err: any) {
      alert("Failed to send message: " + err.message)
    } finally {
      setSending(false)
    }
  }

  const handleStartNewChat = async () => {
    if (!newChatEmail.trim()) {
      alert("Please enter an email address")
      return
    }

    try {
      const response = await fetch("http://localhost:8081/api/chat/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          participantEmail: newChatEmail,
        }),
      })

      if (!response.ok) throw new Error("Failed to start conversation")

      const result = await response.json()
      setConversations([result.data, ...conversations])
      setSelectedConversation(result.data)
      setNewChatOpen(false)
      setNewChatEmail('')
    } catch (err: any) {
      alert("Failed to start chat: " + err.message)
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
              Darevel Chat
            </h1>
            <p className="text-gray-300">Real-time messaging and collaboration</p>
          </div>

          {/* Chat Interface */}
          <div className="backdrop-blur-2xl bg-white/10 rounded-3xl border border-white/10 shadow-xl overflow-hidden glass-shimmer">
            <div className="flex h-[600px]">
              {/* Conversations Sidebar */}
              <div className="w-80 border-r border-white/10 flex flex-col">
                <div className="p-4 border-b border-white/10">
                  <button
                    onClick={() => setNewChatOpen(true)}
                    className="w-full bg-gradient-to-r from-purple-500 to-sky-400 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New Chat
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
                      <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                      <p className="text-center">No conversations yet</p>
                      <p className="text-xs text-center mt-2">Start a new chat to get started</p>
                    </div>
                  ) : (
                    conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition ${
                          selectedConversation?.id === conversation.id ? 'bg-white/10' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-sky-400 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">
                              {conversation.participantName || conversation.participantEmail}
                            </p>
                            {conversation.lastMessage && (
                              <p className="text-sm text-gray-400 truncate">
                                {conversation.lastMessage}
                              </p>
                            )}
                            {conversation.lastMessageAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(conversation.lastMessageAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          {conversation.unreadCount > 0 && (
                            <div className="bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-sky-400 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">
                            {selectedConversation.participantName || selectedConversation.participantEmail}
                          </h3>
                          <p className="text-xs text-gray-400">
                            {selectedConversation.participantEmail}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {messagesLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <div className="text-center">
                            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No messages yet</p>
                            <p className="text-xs mt-1">Send a message to start the conversation</p>
                          </div>
                        </div>
                      ) : (
                        messages.map((message) => {
                          const isMine = message.senderEmail === session?.user?.email
                          return (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                                  isMine
                                    ? 'bg-gradient-to-r from-purple-500 to-sky-400 text-white'
                                    : 'bg-white/20 text-white'
                                }`}
                              >
                                {!isMine && (
                                  <p className="text-xs text-gray-300 mb-1">
                                    {message.senderName || message.senderEmail}
                                  </p>
                                )}
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                <p className={`text-xs mt-1 ${isMine ? 'text-white/70' : 'text-gray-400'}`}>
                                  {new Date(message.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </motion.div>
                          )
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-white/10">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSendMessage()
                            }
                          }}
                          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={sending || !newMessage.trim()}
                          className="bg-gradient-to-r from-purple-500 to-sky-400 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
                        >
                          {sending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>Select a conversation to start messaging</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* New Chat Modal */}
      {newChatOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 shadow-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">New Chat</h3>
              <button
                onClick={() => setNewChatOpen(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="email"
                placeholder="Enter email address"
                value={newChatEmail}
                onChange={(e) => setNewChatEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleStartNewChat()
                  }
                }}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleStartNewChat}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-sky-400 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Start Chat
                </button>
                <button
                  onClick={() => {
                    setNewChatOpen(false)
                    setNewChatEmail('')
                  }}
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
