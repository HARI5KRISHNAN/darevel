"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Collaborator } from "@/lib/hooks/use-collaboration"

interface MultiCursorProps {
  collaborators: Collaborator[]
}

interface CursorState {
  collaborator: Collaborator
  visible: boolean
}

export default function MultiCursor({ collaborators }: MultiCursorProps) {
  const [cursors, setCursors] = useState<CursorState[]>([])

  useEffect(() => {
    // Update cursor states
    const newCursors = collaborators.map((collaborator) => ({
      collaborator,
      visible: true,
    }))
    setCursors(newCursors)

    // Hide cursors that haven't moved in 3 seconds
    const timeout = setTimeout(() => {
      setCursors((prev) =>
        prev.map((cursor) => {
          const timeSinceActive = Date.now() - new Date(cursor.collaborator.last_active).getTime()
          return {
            ...cursor,
            visible: timeSinceActive < 3000,
          }
        })
      )
    }, 3000)

    return () => clearTimeout(timeout)
  }, [collaborators])

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <AnimatePresence>
        {cursors.map(({ collaborator, visible }) => {
          if (!visible || !collaborator.cursor_position) return null

          const { x, y } = collaborator.cursor_position
          const name = collaborator.user_name || collaborator.user_email || "Anonymous"

          return (
            <motion.div
              key={collaborator.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "absolute",
                left: x,
                top: y,
                transform: "translate(-2px, -2px)",
              }}
            >
              {/* Cursor SVG */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                }}
              >
                <path
                  d="M5.65376 12.3673L11.6054 17.5517L9.89698 19.4609L4.50003 15.5L5.65376 12.3673Z"
                  fill={collaborator.color}
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.65376 12.3673L11.6054 17.5517L14.2331 12.3673L18.5 7.5L5.65376 12.3673Z"
                  fill={collaborator.color}
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* User name label */}
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ delay: 0.1 }}
                className="pointer-events-none ml-5 -mt-1 rounded-md px-2 py-1 text-xs font-medium text-white shadow-lg"
                style={{
                  backgroundColor: collaborator.color,
                  whiteSpace: "nowrap",
                }}
              >
                {name}
              </motion.div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
