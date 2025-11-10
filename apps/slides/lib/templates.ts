export interface Template {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  styles: {
    backgroundColor: string
    textColor: string
    accentColor: string
    font: string
    gradient?: {
      type: 'linear' | 'radial'
      colors: string[]
      angle?: number
    }
  }
  layouts: {
    title: {
      titleSize: string
      subtitleSize: string
      alignment: string
    }
    content: {
      headingSize: string
      bodySize: string
      alignment: string
    }
  }
}

export const TEMPLATES: Template[] = [
  {
    id: "modern-dark",
    name: "Modern Dark",
    description: "Sleek dark theme with vibrant accents",
    category: "Professional",
    thumbnail: "linear-gradient(135deg, #08080d 0%, #1a1a2e 100%)",
    styles: {
      backgroundColor: "#08080d",
      textColor: "#faf8f5",
      accentColor: "#a76bcf",
      font: "sans",
    },
    layouts: {
      title: {
        titleSize: "text-7xl",
        subtitleSize: "text-2xl",
        alignment: "center",
      },
      content: {
        headingSize: "text-5xl",
        bodySize: "text-lg",
        alignment: "left",
      },
    },
  },
  {
    id: "minimal-light",
    name: "Minimal Light",
    description: "Clean minimal design with plenty of space",
    category: "Professional",
    thumbnail: "linear-gradient(135deg, #faf8f5 0%, #f5f3f0 100%)",
    styles: {
      backgroundColor: "#faf8f5",
      textColor: "#1a1a1a",
      accentColor: "#00d9ff",
      font: "sans",
    },
    layouts: {
      title: {
        titleSize: "text-6xl",
        subtitleSize: "text-xl",
        alignment: "left",
      },
      content: {
        headingSize: "text-4xl",
        bodySize: "text-base",
        alignment: "left",
      },
    },
  },
  {
    id: "vibrant-gradient",
    name: "Vibrant Gradient",
    description: "Bold gradient backgrounds with high contrast",
    category: "Creative",
    thumbnail: "linear-gradient(135deg, #a76bcf 0%, #00d9ff 100%)",
    styles: {
      backgroundColor: "#a76bcf",
      textColor: "#ffffff",
      accentColor: "#00d9ff",
      font: "sans",
      gradient: {
        type: "linear",
        colors: ["#a76bcf", "#00d9ff"],
        angle: 135,
      },
    },
    layouts: {
      title: {
        titleSize: "text-7xl",
        subtitleSize: "text-2xl",
        alignment: "center",
      },
      content: {
        headingSize: "text-5xl",
        bodySize: "text-lg",
        alignment: "center",
      },
    },
  },
  {
    id: "professional-blue",
    name: "Professional Blue",
    description: "Corporate blue theme for business presentations",
    category: "Business",
    thumbnail: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
    styles: {
      backgroundColor: "#1e3a8a",
      textColor: "#f8fafc",
      accentColor: "#60a5fa",
      font: "sans",
    },
    layouts: {
      title: {
        titleSize: "text-6xl",
        subtitleSize: "text-xl",
        alignment: "left",
      },
      content: {
        headingSize: "text-4xl",
        bodySize: "text-base",
        alignment: "left",
      },
    },
  },
  {
    id: "sunset-warm",
    name: "Sunset Warm",
    description: "Warm orange and red tones for creative presentations",
    category: "Creative",
    thumbnail: "linear-gradient(135deg, #d97706 0%, #ea580c 100%)",
    styles: {
      backgroundColor: "#78350f",
      textColor: "#fef3c7",
      accentColor: "#fbbf24",
      font: "sans",
      gradient: {
        type: "linear",
        colors: ["#78350f", "#ea580c"],
        angle: 135,
      },
    },
    layouts: {
      title: {
        titleSize: "text-7xl",
        subtitleSize: "text-2xl",
        alignment: "center",
      },
      content: {
        headingSize: "text-5xl",
        bodySize: "text-lg",
        alignment: "left",
      },
    },
  },
  {
    id: "forest-green",
    name: "Forest Green",
    description: "Nature-inspired green for environmental topics",
    category: "Nature",
    thumbnail: "linear-gradient(135deg, #15803d 0%, #166534 100%)",
    styles: {
      backgroundColor: "#0f472b",
      textColor: "#e5f9f0",
      accentColor: "#4ade80",
      font: "sans",
    },
    layouts: {
      title: {
        titleSize: "text-6xl",
        subtitleSize: "text-xl",
        alignment: "center",
      },
      content: {
        headingSize: "text-4xl",
        bodySize: "text-base",
        alignment: "left",
      },
    },
  },
  {
    id: "tech-noir",
    name: "Tech Noir",
    description: "Dark tech aesthetic with cyan highlights",
    category: "Technology",
    thumbnail: "linear-gradient(135deg, #0f172a 0%, #1a1f35 100%)",
    styles: {
      backgroundColor: "#0f172a",
      textColor: "#e0e7ff",
      accentColor: "#06b6d4",
      font: "mono",
    },
    layouts: {
      title: {
        titleSize: "text-7xl",
        subtitleSize: "text-2xl",
        alignment: "left",
      },
      content: {
        headingSize: "text-5xl",
        bodySize: "text-base",
        alignment: "left",
      },
    },
  },
  {
    id: "pastel-dream",
    name: "Pastel Dream",
    description: "Soft pastel colors for creative and design presentations",
    category: "Creative",
    thumbnail: "linear-gradient(135deg, #fce7f3 0%, #e9d5ff 100%)",
    styles: {
      backgroundColor: "#fce7f3",
      textColor: "#831843",
      accentColor: "#c084fc",
      font: "sans",
      gradient: {
        type: "linear",
        colors: ["#fce7f3", "#e9d5ff"],
        angle: 135,
      },
    },
    layouts: {
      title: {
        titleSize: "text-6xl",
        subtitleSize: "text-xl",
        alignment: "center",
      },
      content: {
        headingSize: "text-4xl",
        bodySize: "text-base",
        alignment: "left",
      },
    },
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    description: "Deep ocean blues with aqua accents",
    category: "Nature",
    thumbnail: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)",
    styles: {
      backgroundColor: "#0c4a6e",
      textColor: "#e0f2fe",
      accentColor: "#38bdf8",
      font: "sans",
      gradient: {
        type: "linear",
        colors: ["#0c4a6e", "#0369a1", "#38bdf8"],
        angle: 135,
      },
    },
    layouts: {
      title: {
        titleSize: "text-7xl",
        subtitleSize: "text-2xl",
        alignment: "center",
      },
      content: {
        headingSize: "text-5xl",
        bodySize: "text-lg",
        alignment: "left",
      },
    },
  },
  {
    id: "neon-cyberpunk",
    name: "Neon Cyberpunk",
    description: "Futuristic neon colors on dark background",
    category: "Technology",
    thumbnail: "linear-gradient(135deg, #1a0b2e 0%, #4a0e4e 100%)",
    styles: {
      backgroundColor: "#1a0b2e",
      textColor: "#f0abfc",
      accentColor: "#22d3ee",
      font: "mono",
      gradient: {
        type: "linear",
        colors: ["#1a0b2e", "#4a0e4e"],
        angle: 135,
      },
    },
    layouts: {
      title: {
        titleSize: "text-7xl",
        subtitleSize: "text-2xl",
        alignment: "left",
      },
      content: {
        headingSize: "text-5xl",
        bodySize: "text-lg",
        alignment: "left",
      },
    },
  },
  {
    id: "autumn-leaves",
    name: "Autumn Leaves",
    description: "Warm autumn colors for cozy presentations",
    category: "Nature",
    thumbnail: "linear-gradient(135deg, #92400e 0%, #b45309 100%)",
    styles: {
      backgroundColor: "#92400e",
      textColor: "#fef3c7",
      accentColor: "#fb923c",
      font: "sans",
      gradient: {
        type: "linear",
        colors: ["#92400e", "#b45309", "#fb923c"],
        angle: 135,
      },
    },
    layouts: {
      title: {
        titleSize: "text-6xl",
        subtitleSize: "text-xl",
        alignment: "center",
      },
      content: {
        headingSize: "text-4xl",
        bodySize: "text-base",
        alignment: "left",
      },
    },
  },
  {
    id: "corporate-gray",
    name: "Corporate Gray",
    description: "Professional neutral tones for business",
    category: "Business",
    thumbnail: "linear-gradient(135deg, #374151 0%, #4b5563 100%)",
    styles: {
      backgroundColor: "#374151",
      textColor: "#f9fafb",
      accentColor: "#60a5fa",
      font: "sans",
    },
    layouts: {
      title: {
        titleSize: "text-6xl",
        subtitleSize: "text-xl",
        alignment: "left",
      },
      content: {
        headingSize: "text-4xl",
        bodySize: "text-base",
        alignment: "left",
      },
    },
  },
]

export const TEMPLATE_CATEGORIES = ["All", "Professional", "Business", "Creative", "Technology", "Nature"] as const

export type TemplateCategory = typeof TEMPLATE_CATEGORIES[number]
