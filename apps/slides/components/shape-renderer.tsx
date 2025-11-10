"use client"

interface ShapeRendererProps {
  shapeId: string
  shapeType: "2d" | "3d"
  color: string
  size?: { width: number; height: number }
}

export default function ShapeRenderer({
  shapeId,
  shapeType,
  color,
  size = { width: 100, height: 100 },
}: ShapeRendererProps) {
  if (shapeType === "2d") {
    const svgProps = { width: size.width, height: size.height, viewBox: "0 0 100 100" }

    switch (shapeId) {
      case "rect":
        return (
          <svg {...svgProps}>
            <rect x="10" y="10" width="80" height="80" fill={color} />
          </svg>
        )
      case "circle":
        return (
          <svg {...svgProps}>
            <circle cx="50" cy="50" r="40" fill={color} />
          </svg>
        )
      case "triangle":
        return (
          <svg {...svgProps}>
            <polygon points="50,10 90,90 10,90" fill={color} />
          </svg>
        )
      case "diamond":
        return (
          <svg {...svgProps}>
            <polygon points="50,10 90,50 50,90 10,50" fill={color} />
          </svg>
        )
      case "hexagon":
        return (
          <svg {...svgProps}>
            <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill={color} />
          </svg>
        )
      case "star":
        return (
          <svg {...svgProps}>
            <polygon points="50,10 61,40 92,40 67,60 79,90 50,70 21,90 33,60 8,40 39,40" fill={color} />
          </svg>
        )
      case "arrow-right":
        return (
          <svg {...svgProps}>
            <polygon points="20,40 60,40 60,20 80,50 60,80 60,60 20,60" fill={color} />
          </svg>
        )
      case "arrow-down":
        return (
          <svg {...svgProps}>
            <polygon points="40,20 60,20 60,60 80,60 50,80 20,60 40,60" fill={color} />
          </svg>
        )
      case "wave":
        return (
          <svg {...svgProps}>
            <path d="M10,50 Q30,30 50,50 T90,50" stroke={color} strokeWidth="4" fill="none" />
          </svg>
        )
      case "burst":
        return (
          <svg {...svgProps}>
            {[...Array(12)].map((_, i) => {
              const angle = (i / 12) * Math.PI * 2
              const x1 = 50 + 20 * Math.cos(angle)
              const y1 = 50 + 20 * Math.sin(angle)
              const x2 = 50 + 50 * Math.cos(angle)
              const y2 = 50 + 50 * Math.sin(angle)
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2" />
            })}
            <circle cx="50" cy="50" r="8" fill={color} />
          </svg>
        )
      case "heart":
        return (
          <svg {...svgProps}>
            <path
              d="M50,85 C25,70 10,60 10,45 C10,35 18,28 28,28 C38,28 45,35 50,42 C55,35 62,28 72,28 C82,28 90,35 90,45 C90,60 75,70 50,85 Z"
              fill={color}
            />
          </svg>
        )
      case "checkmark":
        return (
          <svg {...svgProps}>
            <polyline
              points="20,50 40,70 80,30"
              stroke={color}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      case "droplet":
        return (
          <svg {...svgProps}>
            <path
              d="M50,10 C50,10 30,40 30,55 C30,70 38,80 50,80 C62,80 70,70 70,55 C70,40 50,10 50,10 Z"
              fill={color}
            />
          </svg>
        )
      case "crescent":
        return (
          <svg {...svgProps}>
            <path d="M70,20 C50,20 35,35 35,55 C35,75 50,90 70,90 C65,75 65,35 70,20 Z" fill={color} />
          </svg>
        )
      case "pentagon":
        return (
          <svg {...svgProps}>
            <polygon points="50,10 90,35 75,85 25,85 10,35" fill={color} />
          </svg>
        )
      case "trapezoid":
        return (
          <svg {...svgProps}>
            <polygon points="30,20 70,20 85,80 15,80" fill={color} />
          </svg>
        )
      case "flower":
        return (
          <svg {...svgProps}>
            <g>
              {[0, 60, 120, 180, 240, 300].map((angle) => {
                const rad = (angle * Math.PI) / 180
                const x = 50 + 25 * Math.cos(rad)
                const y = 50 + 25 * Math.sin(rad)
                return <circle key={angle} cx={x} cy={y} r="12" fill={color} opacity="0.9" />
              })}
              <circle cx="50" cy="50" r="10" fill={color} />
            </g>
          </svg>
        )
      case "rounded-rect":
        return (
          <svg {...svgProps}>
            <rect x="15" y="15" width="70" height="70" rx="15" ry="15" fill={color} />
          </svg>
        )
      case "oval":
        return (
          <svg {...svgProps}>
            <ellipse cx="50" cy="50" rx="35" ry="50" fill={color} />
          </svg>
        )
      case "arrow-up":
        return (
          <svg {...svgProps}>
            <polygon points="40,20 60,20 60,60 80,60 50,80 20,60 40,60" fill={color} />
          </svg>
        )
      case "arrow-left":
        return (
          <svg {...svgProps}>
            <polygon points="20,50 60,30 60,45 80,45 80,55 60,55 60,70" fill={color} />
          </svg>
        )
      case "star-4point":
        return (
          <svg {...svgProps}>
            <polygon points="50,10 60,40 90,50 60,60 50,90 40,60 10,50 40,40" fill={color} />
          </svg>
        )
      case "star-6point":
        return (
          <svg {...svgProps}>
            <polygon points="50,5 61,35 92,35 67,58 79,88 50,65 21,88 33,58 8,35 39,35" fill={color} />
          </svg>
        )
      case "spiky-burst":
        return (
          <svg {...svgProps}>
            {[...Array(16)].map((_, i) => {
              const angle = (i / 16) * Math.PI * 2
              const x1 = 50 + 15 * Math.cos(angle)
              const y1 = 50 + 15 * Math.sin(angle)
              const x2 = 50 + 45 * Math.cos(angle)
              const y2 = 50 + 45 * Math.sin(angle)
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="3" strokeLinecap="round" />
              )
            })}
            <circle cx="50" cy="50" r="12" fill={color} />
          </svg>
        )
      case "pacman":
        return (
          <svg {...svgProps}>
            <path d="M50,10 A40,40 0 1,1 50,90 L50,70 A20,20 0 1,0 50,30 Z" fill={color} />
          </svg>
        )
      case "ribbon":
        return (
          <svg {...svgProps}>
            <path
              d="M30,25 L50,45 L70,25 M30,55 L50,75 L70,55 M20,40 L80,40 M20,60 L80,60"
              stroke={color}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        )
      case "arch":
        return (
          <svg {...svgProps}>
            <path d="M20,80 A50,50 0 0,1 80,80" stroke={color} strokeWidth="8" fill="none" strokeLinecap="round" />
          </svg>
        )
      case "plus":
        return (
          <svg {...svgProps}>
            <g stroke={color} strokeWidth="8" strokeLinecap="round">
              <line x1="50" y1="20" x2="50" y2="80" />
              <line x1="20" y1="50" x2="80" y2="50" />
            </g>
          </svg>
        )
      case "chevron-right":
        return (
          <svg {...svgProps}>
            <polyline
              points="30,20 70,50 30,80"
              stroke={color}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      default:
        return null
    }
  }

  if (shapeType === "3d") {
    const commonStyle = {
      width: size.width,
      height: size.height,
      position: "relative" as const,
      transformStyle: "preserve-3d" as any,
      transform: "rotateX(-20deg) rotateY(-30deg) rotateZ(-10deg)",
    }

    switch (shapeId) {
      case "cube":
        return (
          <div style={{ ...commonStyle, transformStyle: "preserve-3d" }}>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  backgroundColor: color,
                  border: `2px solid ${color}`,
                  opacity: 0.8,
                  transform: [
                    "rotateY(0deg) translateZ(50px)",
                    "rotateY(90deg) translateZ(50px)",
                    "rotateY(180deg) translateZ(50px)",
                    "rotateY(-90deg) translateZ(50px)",
                    "rotateX(90deg) translateZ(50px)",
                    "rotateX(-90deg) translateZ(50px)",
                  ][i],
                }}
              />
            ))}
          </div>
        )
      case "sphere":
        return (
          <div
            style={{
              width: size.width,
              height: size.height,
              borderRadius: "50%",
              background: `radial-gradient(circle at 30% 30%, ${color}, ${color}dd)`,
              boxShadow: `inset -10px -10px 20px rgba(0,0,0,0.3), 0 20px 60px rgba(0,0,0,0.3)`,
            }}
          />
        )
      case "cylinder":
        return (
          <div style={{ ...commonStyle, perspective: "1000px" }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                width: "100%",
                height: "30%",
                borderRadius: "50% 50% 0 0",
                backgroundColor: color,
                opacity: 0.9,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "30%",
                width: "100%",
                height: "40%",
                backgroundColor: color,
                opacity: 0.8,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                width: "100%",
                height: "30%",
                borderRadius: "0 0 50% 50%",
                backgroundColor: color,
                opacity: 0.7,
              }}
            />
          </div>
        )
      case "pyramid":
        return (
          <div style={{ ...commonStyle, perspective: "1000px" }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ position: "absolute" }}>
              <polygon points="50,10 90,90 10,90" fill={color} opacity="0.8" />
              <polygon points="50,10 75,90 50,70" fill={color} opacity="0.6" />
              <polygon points="50,10 25,90 50,70" fill={color} opacity="0.7" />
            </svg>
          </div>
        )
      case "cone":
        return (
          <div style={{ ...commonStyle }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              <polygon points="50,10 90,90 10,90" fill={color} opacity="0.85" />
              <ellipse cx="50" cy="90" rx="40" ry="15" fill={color} opacity="0.6" />
            </svg>
          </div>
        )
      case "torus":
        return (
          <div
            style={{
              width: size.width,
              height: size.height,
              borderRadius: "50%",
              border: `15px solid ${color}`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.3), inset 0 0 20px rgba(0,0,0,0.2)`,
            }}
          />
        )
      case "crystal":
        return (
          <div style={{ ...commonStyle }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              <polygon points="50,5 95,35 80,95 20,95 5,35" fill={color} opacity="0.9" />
              <polygon points="50,5 65,50 50,45" fill={color} opacity="0.5" />
              <polygon points="50,5 35,50 50,45" fill={color} opacity="0.7" />
            </svg>
          </div>
        )
      case "wave-3d":
        return (
          <svg width={size.width} height={size.height} viewBox="0 0 100 100">
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                d={`M10,${50 + i * 10} Q30,${30 + i * 10} 50,${50 + i * 10} T90,${50 + i * 10}`}
                stroke={color}
                strokeWidth="2"
                fill="none"
                opacity={0.8 - i * 0.1}
              />
            ))}
          </svg>
        )
      case "helix":
        return (
          <svg width={size.width} height={size.height} viewBox="0 0 100 100">
            <path
              d="M50,10 Q80,20 80,50 Q80,80 50,90 Q20,80 20,50 Q20,20 50,10"
              stroke={color}
              strokeWidth="3"
              fill="none"
              opacity="0.8"
            />
            <path
              d="M50,15 Q75,25 75,50 Q75,75 50,85 Q25,75 25,50 Q25,25 50,15"
              stroke={color}
              strokeWidth="2"
              fill="none"
              opacity="0.5"
            />
          </svg>
        )
      case "rounded-cylinder":
        return (
          <div style={{ ...commonStyle }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                width: "100%",
                height: "25%",
                borderRadius: "50% 50% 20% 20%",
                backgroundColor: color,
                opacity: 0.95,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "25%",
                width: "100%",
                height: "50%",
                backgroundColor: color,
                borderRadius: "8px",
                opacity: 0.85,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                width: "100%",
                height: "25%",
                borderRadius: "20% 20% 50% 50%",
                backgroundColor: color,
                opacity: 0.75,
              }}
            />
          </div>
        )
      case "tetrahedron":
        return (
          <div style={{ ...commonStyle }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              <polygon points="50,15 85,85 15,85" fill={color} opacity="0.8" />
              <polygon points="50,15 68,70 32,70" fill={color} opacity="0.6" stroke={color} strokeWidth="0.5" />
              <polygon points="50,15 77,77 50,70" fill={color} opacity="0.7" />
              <polygon points="50,15 23,77 50,70" fill={color} opacity="0.65" />
            </svg>
          </div>
        )
      case "rounded-box":
        return (
          <div
            style={{
              width: size.width,
              height: size.height,
              backgroundColor: color,
              borderRadius: "12px",
              boxShadow: `0 15px 35px rgba(0,0,0,0.3), inset -5px -5px 15px rgba(0,0,0,0.2)`,
              transform: "rotateX(-15deg) rotateY(-25deg) rotateZ(-8deg)",
              opacity: 0.9,
            }}
          />
        )
      case "oblique-box":
        return (
          <div style={{ ...commonStyle, perspective: "1000px" }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              <polygon points="10,30 40,20 90,35 90,85 40,95 10,80" fill={color} opacity="0.85" />
              <polygon points="40,20 90,35 90,85 40,95" fill={color} opacity="0.65" />
              <polygon points="10,30 40,20 40,95 10,80" fill={color} opacity="0.75" />
            </svg>
          </div>
        )
      case "curved-pyramid":
        return (
          <div style={{ ...commonStyle }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="pyramidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.6" />
                </linearGradient>
              </defs>
              <path d="M50,10 Q75,60 85,90 L15,90 Q25,60 50,10" fill="url(#pyramidGrad)" />
              <path d="M50,10 Q35,50 25,90 L50,75" fill={color} opacity="0.5" />
            </svg>
          </div>
        )
      case "twisted-cylinder":
        return (
          <div style={{ ...commonStyle, transform: "rotateX(-20deg) rotateY(-30deg) rotateZ(15deg)" }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              <ellipse cx="50" cy="15" rx="30" ry="15" fill={color} opacity="0.9" />
              <path d="M20,15 Q15,40 25,70" stroke={color} strokeWidth="8" fill="none" opacity="0.8" />
              <path d="M80,15 Q85,40 75,70" stroke={color} strokeWidth="8" fill="none" opacity="0.8" />
              <path d="M35,20 Q30,45 40,80" stroke={color} strokeWidth="6" fill="none" opacity="0.6" />
              <path d="M65,20 Q70,45 60,80" stroke={color} strokeWidth="6" fill="none" opacity="0.6" />
              <ellipse cx="50" cy="85" rx="30" ry="15" fill={color} opacity="0.7" />
            </svg>
          </div>
        )
      default:
        return null
    }
  }

  return null
}
