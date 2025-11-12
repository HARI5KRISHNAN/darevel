/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Configure allowed dev origins for Next.js 16 cross-origin requests
    allowedDevOrigins: [
      'http://localhost:3000', // Slides
      'http://localhost:3002', // Suite
      'http://localhost:3003', // Chat
      'http://localhost:3004', // Excel
      'http://localhost:3005', // Auth (this app)
      'http://localhost:3006', // Drive
      'http://localhost:3007', // Notify
      'http://localhost:3008', // Mail
      'http://localhost:8080', // Keycloak
      'http://localhost:8081', // API Gateway
    ],
  },
};

module.exports = nextConfig;
