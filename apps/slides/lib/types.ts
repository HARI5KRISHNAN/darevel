export interface SlideChoice {
  id: string
  text: string
  nextSlideId: string
}

export interface SlideAttachment {
  id: string
  name: string
  url: string
  type: "image" | "pdf" | "file"
  uploadedAt: string
}

export interface Shape {
  id: string
  type: "2d" | "3d"
  shapeId: string
  x: number
  y: number
  width: number
  height: number
  color: string
  rotation: number
}

export interface Slide {
  id: string
  title: string
  content: string
  subtitle?: string
  layout: "title" | "content" | "choice" | "poll"
  backgroundColor: string
  textColor: string
  titleFontSize?: number
  contentFontSize?: number
  fontFamily?: string
  letterSpacing?: number
  lineHeight?: number
  textColumns?: number
  gradient?: {
    type: "linear" | "radial"
    colors: string[]
    angle?: number
  }
  image?: {
    url: string
    width?: number
    height?: number
    position?: "left" | "right" | "full" | "background"
    resizable?: boolean
  }
  choices?: SlideChoice[]
  isBranching?: boolean
  shapes?: Shape[]
  attachments?: SlideAttachment[]
}

export interface Presentation {
  id: string
  title: string
  slides: Slide[]
}
