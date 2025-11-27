/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Configure allowed dev origins for Next.js cross-origin requests
    allowedDevOrigins: [
      'http://localhost:3000', // Slides
      'http://localhost:3002', // Suite (this app)
      'http://localhost:3003', // Chat
      'http://localhost:3004', // Sheet
      'http://localhost:3005', // Auth
      'http://localhost:3006', // Drive
      'http://localhost:3007', // Notify
      'http://localhost:3008', // Mail
      'http://localhost:8080', // Keycloak
      'http://localhost:8081', // API Gateway
      // Domain-based origins for SSO
      'http://auth.darevel.local',
      'http://suite.darevel.local',
      'http://drive.darevel.local',
      'http://chat.darevel.local',
      'http://slides.darevel.local',
      'http://sheet.darevel.local',
      'http://mail.darevel.local',
      'http://notify.darevel.local',
      'http://keycloak.darevel.local:8080',
    ],
  },
}

export default nextConfig
