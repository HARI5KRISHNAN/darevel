"use client"

import { Users, Circle } from "lucide-react"
import type { Collaborator } from "@/lib/hooks/use-collaboration"
import { motion, AnimatePresence } from "framer-motion"

interface CollaboratorsPanelProps {
  collaborators: Collaborator[]
  currentUserEmail: string
  isConnected: boolean
}

export default function CollaboratorsPanel({
  collaborators,
  currentUserEmail,
  isConnected,
}: CollaboratorsPanelProps) {
  // Get initials from email or name
  const getInitials = (email: string | null, name: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return "?"
  }

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg text-xs text-muted-foreground">
        <Circle className="h-3 w-3 fill-gray-400 text-gray-400" />
        <span>Offline</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {/* Connection Status */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-lg">
        <Circle className="h-3 w-3 fill-green-500 text-green-500 animate-pulse" />
        <span className="text-xs font-medium text-green-600 dark:text-green-400">Live</span>
      </div>

      {/* Collaborators List */}
      {collaborators.length > 0 && (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <div className="flex -space-x-2">
            <AnimatePresence>
              {collaborators.slice(0, 5).map((collaborator, index) => {
                const name = collaborator.user_name || collaborator.user_email || "Anonymous"
                const initials = getInitials(collaborator.user_email, collaborator.user_name)

                return (
                  <motion.div
                    key={collaborator.id}
                    initial={{ opacity: 0, scale: 0.8, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative"
                  >
                    {/* Avatar */}
                    <div
                      className="h-8 w-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-semibold text-white shadow-md transition-transform group-hover:scale-110 group-hover:z-10"
                      style={{ backgroundColor: collaborator.color }}
                      title={name}
                    >
                      {initials}
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                      {name}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* More indicator */}
            {collaborators.length > 5 && (
              <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-semibold text-foreground shadow-md">
                +{collaborators.length - 5}
              </div>
            )}
          </div>

          <span className="text-xs text-muted-foreground">
            {collaborators.length} {collaborators.length === 1 ? "viewer" : "viewers"}
          </span>
        </div>
      )}

      {/* You indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
          {getInitials(currentUserEmail, null)}
        </div>
        <span className="text-xs font-medium text-primary">You</span>
      </div>
    </div>
  )
}
