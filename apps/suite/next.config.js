/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  output: 'standalone',
  trailingSlash: true,
}
module.exports = nextConfig
