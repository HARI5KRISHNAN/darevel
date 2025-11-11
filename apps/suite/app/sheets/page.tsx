'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { motion } from 'framer-motion'
import {
  Table,
  Plus,
  Loader2,
  FileSpreadsheet,
  Trash2,
  Calendar,
  X,
  Download,
  Share2
} from "lucide-react"
import Header from '../components/Header'
import '../../styles/glass.css'

interface Spreadsheet {
  id: number
  title: string
  content: string // JSON string of cells data
  rowCount: number
  columnCount: number
  isShared: boolean
  sharedWith?: string
  createdAt: string
  updatedAt: string
}

export default function SheetsPage() {
  const { data: session, status } = useSession()
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newSpreadsheetTitle, setNewSpreadsheetTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/api/auth/signin")
    }
  }, [status])

  useEffect(() => {
    if (status === "authenticated") {
      loadSpreadsheets()
    }
  }, [status])

  const loadSpreadsheets = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:8081/api/excel", {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      if (!response.ok) throw new Error("Failed to load spreadsheets")

      const result = await response.json()
      setSpreadsheets(result.data || [])
    } catch (err: any) {
      console.error("Error loading spreadsheets:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSpreadsheet = async () => {
    if (!newSpreadsheetTitle.trim()) {
      setError("Please enter a spreadsheet title")
      return
    }

    try {
      setCreating(true)
      setError('')

      // Create empty spreadsheet with default size (10 rows x 10 columns)
      const defaultContent = {
        cells: Array(10).fill(null).map(() => Array(10).fill('')),
        styles: {}
      }

      const response = await fetch("http://localhost:8081/api/excel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          title: newSpreadsheetTitle,
          content: JSON.stringify(defaultContent),
          rowCount: 10,
          columnCount: 10,
          isShared: false,
        }),
      })

      if (!response.ok) throw new Error("Failed to create spreadsheet")

      const result = await response.json()
      setSpreadsheets([result.data, ...spreadsheets])
      setCreateDialogOpen(false)
      setNewSpreadsheetTitle('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteSpreadsheet = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm("Are you sure you want to delete this spreadsheet?")) return

    try {
      const response = await fetch(`http://localhost:8081/api/excel/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      if (!response.ok) throw new Error("Failed to delete spreadsheet")

      setSpreadsheets(spreadsheets.filter((s) => s.id !== id))
    } catch (err: any) {
      console.error("Error deleting spreadsheet:", err)
      alert("Failed to delete spreadsheet: " + err.message)
    }
  }

  const handleOpenSpreadsheet = (spreadsheet: Spreadsheet) => {
    // For now, just show an alert. In the future, this would open the editor
    alert(`Opening "${spreadsheet.title}"\n\nSpreadsheet editor coming soon! For now, you can create and list spreadsheets.`)
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
              Darevel Sheets
            </h1>
            <p className="text-gray-300">Analyze, calculate, and visualize data together</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Spreadsheets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* New Spreadsheet Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="backdrop-blur-2xl bg-white/10 rounded-2xl border-2 border-dashed border-white/20 hover:border-purple-400 shadow-xl cursor-pointer transition"
              onClick={() => setCreateDialogOpen(true)}
            >
              <div className="flex flex-col items-center justify-center h-64 p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-sky-400 rounded-full flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">New Spreadsheet</h3>
                <p className="text-xs text-gray-400 text-center">
                  Start with a blank spreadsheet
                </p>
              </div>
            </motion.div>

            {/* Existing Spreadsheets */}
            {spreadsheets.map((spreadsheet) => (
              <motion.div
                key={spreadsheet.id}
                whileHover={{ scale: 1.02 }}
                className="backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/10 shadow-xl cursor-pointer hover:border-purple-400/50 transition overflow-hidden"
                onClick={() => handleOpenSpreadsheet(spreadsheet)}
              >
                {/* Thumbnail */}
                <div className="h-40 bg-gradient-to-br from-purple-900/50 to-sky-900/50 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    {/* Grid pattern */}
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id={`grid-${spreadsheet.id}`} width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#grid-${spreadsheet.id})`} />
                    </svg>
                  </div>
                  <div className="text-center p-4 relative z-10">
                    <FileSpreadsheet className="w-12 h-12 text-purple-300 mx-auto mb-2" />
                    <p className="text-xs text-purple-200">
                      {spreadsheet.rowCount} × {spreadsheet.columnCount} cells
                    </p>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-1 truncate">
                    {spreadsheet.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(spreadsheet.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {spreadsheet.isShared && (
                      <div className="flex items-center gap-1 text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded">
                        <Share2 className="w-3 h-3" />
                        Shared
                      </div>
                    )}
                    <button
                      onClick={(e) => handleDeleteSpreadsheet(spreadsheet.id, e)}
                      className="ml-auto p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {spreadsheets.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-sky-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Table className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No spreadsheets yet
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                Create your first spreadsheet to get started
              </p>
              <button
                onClick={() => setCreateDialogOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-sky-400 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Spreadsheet
              </button>
            </div>
          )}
        </motion.div>
      </main>

      {/* Create Dialog */}
      {createDialogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 shadow-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Create New Spreadsheet</h3>
              <button
                onClick={() => setCreateDialogOpen(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Spreadsheet Title</label>
                <input
                  type="text"
                  value={newSpreadsheetTitle}
                  onChange={(e) => setNewSpreadsheetTitle(e.target.value)}
                  placeholder="e.g., Budget 2025"
                  disabled={creating}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !creating) {
                      handleCreateSpreadsheet()
                    }
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateSpreadsheet}
                  disabled={creating}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-sky-400 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setCreateDialogOpen(false)
                    setNewSpreadsheetTitle('')
                    setError('')
                  }}
                  disabled={creating}
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
