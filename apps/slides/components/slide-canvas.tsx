"use client"

interface Slide {
  id: string
  title: string
  subtitle?: string
  content?: string
  layout: string
  backgroundColor: string
  textColor: string
  titleFontSize?: number
  contentFontSize?: number
  fontFamily?: string
  letterSpacing?: number
  lineHeight?: number
  textColumns?: number
  image?: {
    url: string
    position?: "left" | "right" | "full" | "background"
    width?: number
    height?: number
  }
  attachments?: Array<{ id: string; name: string; url: string; type: "image" | "pdf" | "file" }>
}

interface SlideCanvasProps {
  slide: Slide
  onUpdate: (updates: any) => void
}

export default function SlideCanvas({ slide, onUpdate }: SlideCanvasProps) {
  const isImageFull = slide.image?.position === "full"
  const isImageBg = slide.image?.position === "background"
  const isImageSide = slide.image?.position === "left" || slide.image?.position === "right"

  const titleFontSize = slide.titleFontSize || 48
  const contentFontSize = slide.contentFontSize || 18
  const fontFamily = slide.fontFamily || "system-ui"
  const letterSpacing = slide.letterSpacing || 0
  const lineHeight = slide.lineHeight || 1.5
  const textColumns = slide.textColumns || 1

  const handleImageResize = (direction: string, delta: number) => {
    const currentWidth = slide.image?.width || 300
    const currentHeight = slide.image?.height || 200
    const aspectRatio = currentHeight / currentWidth

    let newWidth = currentWidth
    let newHeight = currentHeight

    if (direction === "right") newWidth += delta
    else if (direction === "left") newWidth -= delta
    else if (direction === "bottom") newHeight += delta
    else if (direction === "top") newHeight -= delta

    newWidth = Math.max(100, Math.min(500, newWidth))
    newHeight = newWidth * aspectRatio

    onUpdate({
      image: {
        ...slide.image,
        width: Math.round(newWidth),
        height: Math.round(newHeight),
      },
    })
  }

  return (
    <div
      className="w-full h-full max-w-4xl mx-auto aspect-video rounded-lg shadow-lg transition-all relative overflow-hidden"
      style={{
        backgroundColor: isImageBg ? undefined : slide.backgroundColor,
        color: slide.textColor,
        backgroundImage: isImageBg ? `url(${slide.image?.url})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: fontFamily,
      }}
    >
      {isImageBg && <div className="absolute inset-0 bg-black/40" />}

      {isImageFull && (
        <div className="absolute inset-0 flex items-center justify-center group relative">
          <img
            src={slide.image.url || "/placeholder.svg"}
            alt="Slide"
            className="h-full w-full object-cover rounded-lg"
            style={{
              width: slide.image?.width ? `${slide.image.width}px` : "100%",
              height: slide.image?.height ? `${slide.image.height}px` : "100%",
            }}
          />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div
              className="absolute right-0 top-1/2 w-2 h-8 bg-primary/60 cursor-col-resize transform translate-x-1/2 -translate-y-1/2"
              onMouseDown={(e) => {
                const startX = e.clientX
                const handleMouseMove = (me: MouseEvent) => {
                  const delta = me.clientX - startX
                  handleImageResize("right", delta)
                }
                const handleMouseUp = () => {
                  document.removeEventListener("mousemove", handleMouseMove)
                  document.removeEventListener("mouseup", handleMouseUp)
                }
                document.addEventListener("mousemove", handleMouseMove)
                document.addEventListener("mouseup", handleMouseUp)
              }}
            />
            <div
              className="absolute bottom-0 left-1/2 h-2 w-8 bg-primary/60 cursor-row-resize transform -translate-x-1/2 translate-y-1/2"
              onMouseDown={(e) => {
                const startY = e.clientY
                const handleMouseMove = (me: MouseEvent) => {
                  const delta = me.clientY - startY
                  handleImageResize("bottom", delta)
                }
                const handleMouseUp = () => {
                  document.removeEventListener("mousemove", handleMouseMove)
                  document.removeEventListener("mouseup", handleMouseUp)
                }
                document.addEventListener("mousemove", handleMouseMove)
                document.addEventListener("mouseup", handleMouseUp)
              }}
            />
          </div>
        </div>
      )}

      {isImageSide ? (
        <div className="relative z-10 flex gap-8 items-center h-full px-12 py-8">
          {slide.image?.position === "left" && (
            <div className="w-1/2 h-full flex items-center group relative">
              <img
                src={slide.image.url || "/placeholder.svg"}
                alt="Slide"
                className="w-full h-full object-cover rounded-lg cursor-move"
                style={{
                  width: slide.image?.width ? `${slide.image.width}px` : "100%",
                  height: slide.image?.height ? `${slide.image.height}px` : "auto",
                  maxHeight: "100%",
                }}
              />
              <div className="absolute right-0 top-1/2 opacity-0 group-hover:opacity-100 w-1 h-12 bg-primary/60 cursor-col-resize" />
            </div>
          )}
          <div className={slide.image?.position === "right" ? "w-1/2" : "flex-1"}>
            {slide.layout === "title" ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <h1
                  style={{ fontSize: `${titleFontSize}px`, letterSpacing: `${letterSpacing}px` }}
                  className="font-bold text-center leading-tight"
                >
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                    className="w-full bg-transparent outline-none text-center"
                    placeholder="Title"
                  />
                </h1>
                <p
                  style={{ fontSize: `${contentFontSize * 0.6}px`, lineHeight: `${lineHeight}` }}
                  className="text-center opacity-75"
                >
                  <input
                    type="text"
                    value={slide.subtitle || ""}
                    onChange={(e) => onUpdate({ subtitle: e.target.value })}
                    className="w-full bg-transparent outline-none text-center"
                    placeholder="Subtitle"
                  />
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-full gap-4">
                <h2
                  style={{ fontSize: `${titleFontSize * 0.75}px`, letterSpacing: `${letterSpacing}px` }}
                  className="font-bold"
                >
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                    className="w-full bg-transparent outline-none"
                    placeholder="Slide Title"
                  />
                </h2>
                <div className="flex-1" style={{ columnCount: textColumns }}>
                  <textarea
                    value={slide.content || ""}
                    onChange={(e) => onUpdate({ content: e.target.value })}
                    className="w-full h-full bg-transparent outline-none resize-none"
                    style={{
                      fontSize: `${contentFontSize}px`,
                      lineHeight: `${lineHeight}`,
                      letterSpacing: `${letterSpacing}px`,
                    }}
                    placeholder="Add your content here..."
                  />
                </div>
              </div>
            )}
          </div>
          {slide.image?.position === "right" && (
            <div className="w-1/2 h-full flex items-center group relative">
              <img
                src={slide.image.url || "/placeholder.svg"}
                alt="Slide"
                className="w-full h-full object-cover rounded-lg cursor-move"
                style={{
                  width: slide.image?.width ? `${slide.image.width}px` : "100%",
                  height: slide.image?.height ? `${slide.image.height}px` : "auto",
                  maxHeight: "100%",
                }}
              />
              <div className="absolute left-0 top-1/2 opacity-0 group-hover:opacity-100 w-1 h-12 bg-primary/60 cursor-col-resize" />
            </div>
          )}
        </div>
      ) : !isImageFull ? (
        slide.layout === "title" ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-8 relative z-10">
            <h1
              style={{ fontSize: `${titleFontSize}px`, letterSpacing: `${letterSpacing}px` }}
              className="font-bold text-center leading-tight"
            >
              <input
                type="text"
                value={slide.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className="w-full bg-transparent outline-none text-center"
                placeholder="Title"
              />
            </h1>
            <p
              style={{ fontSize: `${contentFontSize * 0.8}px`, lineHeight: `${lineHeight}` }}
              className="text-center opacity-75"
            >
              <input
                type="text"
                value={slide.subtitle || ""}
                onChange={(e) => onUpdate({ subtitle: e.target.value })}
                className="w-full bg-transparent outline-none text-center"
                placeholder="Subtitle"
              />
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-full p-12 gap-6 relative z-10" style={{ columnCount: textColumns }}>
            <h2
              style={{ fontSize: `${titleFontSize * 0.8}px`, letterSpacing: `${letterSpacing}px` }}
              className="font-bold"
            >
              <input
                type="text"
                value={slide.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className="w-full bg-transparent outline-none"
                placeholder="Slide Title"
              />
            </h2>
            <div className="flex-1">
              <textarea
                value={slide.content || ""}
                onChange={(e) => onUpdate({ content: e.target.value })}
                className="w-full h-full bg-transparent outline-none resize-none"
                style={{
                  fontSize: `${contentFontSize}px`,
                  lineHeight: `${lineHeight}`,
                  letterSpacing: `${letterSpacing}px`,
                  columnCount: textColumns,
                }}
                placeholder="Add your content here..."
              />
            </div>
          </div>
        )
      ) : null}
    </div>
  )
}
