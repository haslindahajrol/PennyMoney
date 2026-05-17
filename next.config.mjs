/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["172.20.10.11", "172.20.10.10", "172.16.18.49"],
  devIndicators: false,
}

export default nextConfig
