/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdfkit']
  },
  // Optimize for Vercel deployment
  output: 'standalone',
  poweredByHeader: false,
}

module.exports = nextConfig