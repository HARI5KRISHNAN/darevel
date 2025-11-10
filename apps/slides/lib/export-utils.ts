import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import type { Presentation, Slide } from './types'

/**
 * Export presentation as JSON file
 */
export async function exportAsJSON(presentation: Presentation) {
  const dataStr = JSON.stringify(presentation, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${presentation.title || 'presentation'}.json`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Export presentation as PDF
 */
export async function exportAsPDF(
  presentation: Presentation,
  onProgress?: (current: number, total: number) => void
) {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [1920, 1080],
  })

  const slides = presentation.slides
  const slideWidth = 1920
  const slideHeight = 1080

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]

    // Call progress callback
    if (onProgress) {
      onProgress(i + 1, slides.length)
    }

    // Create a temporary div to render the slide
    const tempDiv = document.createElement('div')
    tempDiv.style.width = `${slideWidth}px`
    tempDiv.style.height = `${slideHeight}px`
    tempDiv.style.position = 'fixed'
    tempDiv.style.top = '-9999px'
    tempDiv.style.left = '-9999px'

    // Build the background style
    let backgroundStyle = slide.backgroundColor

    if (slide.gradient) {
      const { type, colors, angle } = slide.gradient
      if (type === 'linear') {
        backgroundStyle = `linear-gradient(${angle || 135}deg, ${colors.join(', ')})`
      } else if (type === 'radial') {
        backgroundStyle = `radial-gradient(circle, ${colors.join(', ')})`
      }
    }

    // If there's a background image
    if (slide.image?.position === 'background') {
      backgroundStyle = `url(${slide.image.url})`
      tempDiv.style.backgroundSize = 'cover'
      tempDiv.style.backgroundPosition = 'center'
    }

    tempDiv.style.background = backgroundStyle
    tempDiv.style.color = slide.textColor
    tempDiv.style.fontFamily = slide.fontFamily || 'system-ui'
    tempDiv.style.display = 'flex'
    tempDiv.style.flexDirection = 'column'
    tempDiv.style.justifyContent = 'center'
    tempDiv.style.alignItems = slide.layout === 'title' ? 'center' : 'flex-start'
    tempDiv.style.padding = '80px'

    // Render slide content
    if (slide.layout === 'title') {
      tempDiv.innerHTML = `
        <h1 style="font-size: ${slide.titleFontSize || 72}px; font-weight: bold; text-align: center; margin: 0; line-height: 1.2;">
          ${slide.title}
        </h1>
        ${slide.subtitle ? `
          <p style="font-size: ${(slide.contentFontSize || 32) * 0.7}px; opacity: 0.8; text-align: center; margin-top: 32px;">
            ${slide.subtitle}
          </p>
        ` : ''}
      `
    } else {
      tempDiv.innerHTML = `
        <h2 style="font-size: ${(slide.titleFontSize || 72) * 0.8}px; font-weight: bold; margin: 0 0 32px 0;">
          ${slide.title}
        </h2>
        <div style="font-size: ${slide.contentFontSize || 28}px; line-height: ${slide.lineHeight || 1.6}; white-space: pre-wrap;">
          ${slide.content || ''}
        </div>
      `
    }

    document.body.appendChild(tempDiv)

    try {
      // Capture the slide as canvas
      const canvas = await html2canvas(tempDiv, {
        width: slideWidth,
        height: slideHeight,
        scale: 1,
        logging: false,
        backgroundColor: null,
      })

      // Add to PDF
      if (i > 0) {
        pdf.addPage()
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      pdf.addImage(imgData, 'JPEG', 0, 0, slideWidth, slideHeight)
    } catch (error) {
      console.error(`Error capturing slide ${i + 1}:`, error)
    } finally {
      // Clean up
      document.body.removeChild(tempDiv)
    }

    // Small delay to prevent browser freezing
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // Download the PDF
  pdf.save(`${presentation.title || 'presentation'}.pdf`)
}

/**
 * Generate shareable link (placeholder - requires backend)
 */
export function generateShareableLink(presentationId: string): string {
  // In a real implementation, this would:
  // 1. Save presentation to database
  // 2. Generate a unique ID
  // 3. Return the URL

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  return `${baseUrl}/viewer/${presentationId}`
}

/**
 * Copy shareable link to clipboard
 */
export async function copyShareableLink(presentationId: string): Promise<boolean> {
  try {
    const link = generateShareableLink(presentationId)
    await navigator.clipboard.writeText(link)
    return true
  } catch (error) {
    console.error('Failed to copy link:', error)
    return false
  }
}
