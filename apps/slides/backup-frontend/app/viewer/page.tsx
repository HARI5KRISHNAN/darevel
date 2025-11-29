"use client"

import { useState } from "react"
import PresentationViewer from "@/components/presentation-viewer"

export default function ViewerPage() {
  // In a real app, this would come from database/props
  const [slides] = useState([
    {
      id: "1",
      title: "Welcome to Lumina",
      subtitle: "Create stunning presentations with AI",
      layout: "title",
      backgroundColor: "#08080d",
      textColor: "#faf8f5",
      notes: "Start with a strong hook about what makes Lumina special",
    },
    {
      id: "2",
      title: "Our Mission",
      content:
        "We make presentation creation fast, beautiful, and intelligent\n• Save time with AI-powered content\n• Choose from premium templates\n• Collaborate with your team in real-time",
      layout: "content",
      backgroundColor: "#08080d",
      textColor: "#faf8f5",
      notes: "Emphasize the three core benefits. Pause for questions.",
    },
    {
      id: "3",
      title: "Key Features",
      content: "Smart Content Generation • Beautiful Templates • Easy Sharing • Real-time Collaboration",
      layout: "content",
      backgroundColor: "#a76bcf",
      textColor: "#ffffff",
      notes: "Go through each feature and provide examples.",
    },
    {
      id: "4",
      title: "Thank You",
      subtitle: "Questions?",
      layout: "title",
      backgroundColor: "#08080d",
      textColor: "#faf8f5",
      notes: "Open floor for questions and feedback",
    },
  ])

  return <PresentationViewer slides={slides} presentationTitle="Lumina Demo" />
}
