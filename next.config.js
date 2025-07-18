/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost'],
  },
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  output: 'standalone'
}

module.exports = nextConfig