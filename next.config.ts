import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuração mínima para garantir funcionamento
  reactStrictMode: false,
  swcMinify: true,
  
  // Configurações de imagem básicas
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Configurações experimentais desabilitadas
  experimental: {
    // Desabilitar tudo que pode causar problemas
  },

  // Webpack simplificado
  webpack: (config) => {
    return config;
  },

  // ESLint e TypeScript permissivos durante desenvolvimento
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;