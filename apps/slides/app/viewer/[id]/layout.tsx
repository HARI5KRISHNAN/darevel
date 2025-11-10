import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Presentation Viewer",
  description: "View presentations with unique modes",
}

export default function ViewerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
