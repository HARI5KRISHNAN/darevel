import { createApi } from 'unsplash-js'

export async function POST(req: Request) {
  try {
    const { query, perPage = 9 } = await req.json()

    if (!query) {
      return Response.json({ error: "Search query is required" }, { status: 400 })
    }

    // Check if Unsplash API key is configured
    const accessKey = process.env.UNSPLASH_ACCESS_KEY

    if (!accessKey) {
      // Return placeholder images if no API key
      return Response.json({
        success: true,
        images: generatePlaceholderImages(query, perPage),
        note: "Using placeholder images. Set UNSPLASH_ACCESS_KEY environment variable for real images."
      })
    }

    // Initialize Unsplash API
    const unsplash = createApi({
      accessKey,
    })

    // Search for photos
    const result = await unsplash.search.getPhotos({
      query,
      perPage,
      orientation: 'landscape',
    })

    if (result.errors) {
      console.error('Unsplash API error:', result.errors)
      return Response.json({
        success: true,
        images: generatePlaceholderImages(query, perPage),
      })
    }

    const images = result.response?.results.map(photo => ({
      id: photo.id,
      url: photo.urls.regular,
      thumbnail: photo.urls.thumb,
      width: photo.width,
      height: photo.height,
      description: photo.description || photo.alt_description || query,
      author: photo.user.name,
      authorUrl: photo.user.links.html,
      downloadUrl: photo.links.download_location,
    })) || []

    return Response.json({
      success: true,
      images,
    })

  } catch (error: any) {
    console.error("Error searching images:", error)

    // Fallback to placeholders on error
    const { query } = await req.json()
    return Response.json({
      success: true,
      images: generatePlaceholderImages(query || 'presentation', 9),
      note: "Error connecting to Unsplash. Using placeholder images."
    })
  }
}

// Generate placeholder images using a placeholder service
function generatePlaceholderImages(query: string, count: number) {
  const images = []
  const colors = ['3498db', '2ecc71', 'e74c3c', 'f39c12', '9b59b6', '1abc9c', '34495e', 'e67e22', '16a085']

  for (let i = 0; i < count; i++) {
    const color = colors[i % colors.length]
    const seed = Math.random().toString(36).substring(7)

    images.push({
      id: `placeholder-${i}`,
      url: `https://placehold.co/800x600/${color}/ffffff?text=${encodeURIComponent(query)}`,
      thumbnail: `https://placehold.co/200x150/${color}/ffffff?text=${encodeURIComponent(query)}`,
      width: 800,
      height: 600,
      description: `${query} placeholder ${i + 1}`,
      author: 'Placeholder',
      authorUrl: '#',
      downloadUrl: '#',
    })
  }

  return images
}
