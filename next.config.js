/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração básica para funcionamento
  reactStrictMode: false,
  
  // Configurações de build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configurações de imagem
  images: {
    unoptimized: true,
  },
  
  // Configurações experimentais
  experimental: {
    serverComponentsExternalPackages: ["@supabase/supabase-js"],
  },
}

module.exports = nextConfig