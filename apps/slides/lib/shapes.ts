export interface Shape {
  id: string
  type: "2d" | "3d"
  name: string
  category: string
  icon: string
}

export const shapes2D = [
  { id: "rect", type: "2d", name: "Rectangle", category: "Basic", icon: "◻️" },
  { id: "circle", type: "2d", name: "Circle", category: "Basic", icon: "●" },
  { id: "triangle", type: "2d", name: "Triangle", category: "Basic", icon: "△" },
  { id: "diamond", type: "2d", name: "Diamond", category: "Geometric", icon: "◇" },
  { id: "hexagon", type: "2d", name: "Hexagon", category: "Geometric", icon: "⬡" },
  { id: "star", type: "2d", name: "Star", category: "Decorative", icon: "⭐" },
  { id: "arrow-right", type: "2d", name: "Arrow Right", category: "Directional", icon: "→" },
  { id: "arrow-down", type: "2d", name: "Arrow Down", category: "Directional", icon: "↓" },
  { id: "wave", type: "2d", name: "Wave", category: "Curved", icon: "∿" },
  { id: "burst", type: "2d", name: "Burst", category: "Decorative", icon: "✨" },
  { id: "heart", type: "2d", name: "Heart", category: "Decorative", icon: "❤️" },
  { id: "checkmark", type: "2d", name: "Checkmark", category: "Directional", icon: "✓" },
  { id: "droplet", type: "2d", name: "Droplet", category: "Curved", icon: "💧" },
  { id: "crescent", type: "2d", name: "Crescent", category: "Curved", icon: "🌙" },
  { id: "pentagon", type: "2d", name: "Pentagon", category: "Geometric", icon: "⬠" },
  { id: "trapezoid", type: "2d", name: "Trapezoid", category: "Geometric", icon: "▱" },
  { id: "flower", type: "2d", name: "Flower", category: "Decorative", icon: "✿" },
  { id: "rounded-rect", type: "2d", name: "Rounded Rectangle", category: "Basic", icon: "▭" },
  { id: "oval", type: "2d", name: "Oval", category: "Basic", icon: "⬭" },
  { id: "arrow-up", type: "2d", name: "Arrow Up", category: "Directional", icon: "↑" },
  { id: "arrow-left", type: "2d", name: "Arrow Left", category: "Directional", icon: "←" },
  { id: "star-4point", type: "2d", name: "Star 4-Point", category: "Decorative", icon: "✦" },
  { id: "star-6point", type: "2d", name: "Star 6-Point", category: "Decorative", icon: "✡️" },
  { id: "spiky-burst", type: "2d", name: "Spiky Burst", category: "Decorative", icon: "✺" },
  { id: "pacman", type: "2d", name: "Pac-Man", category: "Decorative", icon: "Ⓟ" },
  { id: "ribbon", type: "2d", name: "Ribbon", category: "Decorative", icon: "🎀" },
  { id: "arch", type: "2d", name: "Arch", category: "Curved", icon: "⌢" },
  { id: "plus", type: "2d", name: "Plus", category: "Directional", icon: "✚" },
  { id: "chevron-right", type: "2d", name: "Chevron Right", category: "Directional", icon: "❯" },
]

export const shapes3D = [
  { id: "cube", type: "3d", name: "Cube", category: "Basic", icon: "📦" },
  { id: "sphere", type: "3d", name: "Sphere", category: "Basic", icon: "🔮" },
  { id: "cylinder", type: "3d", name: "Cylinder", category: "Basic", icon: "🥫" },
  { id: "pyramid", type: "3d", name: "Pyramid", category: "Basic", icon: "🔺" },
  { id: "cone", type: "3d", name: "Cone", category: "Basic", icon: "🎪" },
  { id: "torus", type: "3d", name: "Torus", category: "Advanced", icon: "⭕" },
  { id: "box-open", type: "3d", name: "Open Box", category: "Basic", icon: "📫" },
  { id: "crystal", type: "3d", name: "Crystal", category: "Advanced", icon: "💎" },
  { id: "wave-3d", type: "3d", name: "Wave 3D", category: "Advanced", icon: "〰️" },
  { id: "helix", type: "3d", name: "Helix", category: "Advanced", icon: "🧬" },
  { id: "rounded-cylinder", type: "3d", name: "Rounded Cylinder", category: "Geometric", icon: "🔲" },
  { id: "tetrahedron", type: "3d", name: "Tetrahedron", category: "Geometric", icon: "△" },
  { id: "rounded-box", type: "3d", name: "Rounded Box", category: "Geometric", icon: "▭" },
  { id: "oblique-box", type: "3d", name: "Oblique Box", category: "Geometric", icon: "◧" },
  { id: "curved-pyramid", type: "3d", name: "Curved Pyramid", category: "Advanced", icon: "◬" },
  { id: "twisted-cylinder", type: "3d", name: "Twisted Cylinder", category: "Advanced", icon: "⚡" },
]

export const allShapes = [...shapes2D, ...shapes3D]
