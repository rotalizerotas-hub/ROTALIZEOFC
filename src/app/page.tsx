'use client'

import { useEffect, useState } from 'react'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg mb-4 animate-pulse">
            <span className="text-2xl font-bold text-white">R</span>
          </div>
          <p className="text-gray-600">Carregando RotaLize...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl shadow-lg">
              <span className="text-2xl font-bold text-white">R</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                RotaLize
              </h1>
              <p className="text-sm text-gray-600">Sistema de Gestão de Entregas</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Bem-vindo */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Bem-vindo ao RotaLize! 🚀
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Sistema completo para gestão de entregas e logística
            </p>
          </div>

          {/* Cards de Funcionalidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Novo Pedido */}
            <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-6 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg mb-4">
                  <span className="text-2xl">📦</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Novo Pedido</h3>
                <p className="text-gray-600 mb-4">Criar pedido manual com localização</p>
                <button 
                  onClick={() => window.location.href = '/novo-pedido-manual'}
                  className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium py-2 px-4 rounded-xl transition-colors"
                >
                  Criar Pedido
                </button>
              </div>
            </div>

            {/* Mapa */}
            <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-6 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg mb-4">
                  <span className="text-2xl">🗺️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mapa</h3>
                <p className="text-gray-600 mb-4">Visualizar entregas em tempo real</p>
                <button 
                  onClick={() => window.location.href = '/mapa'}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-2 px-4 rounded-xl transition-colors"
                >
                  Ver Mapa
                </button>
              </div>
            </div>

            {/* Entregadores */}
            <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-6 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg mb-4">
                  <span className="text-2xl">🚚</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Entregadores</h3>
                <p className="text-gray-600 mb-4">Gerenciar equipe de entrega</p>
                <button 
                  onClick={() => window.location.href = '/entregadores'}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-2 px-4 rounded-xl transition-colors"
                >
                  Gerenciar
                </button>
              </div>
            </div>

          </div>

          {/* Estatísticas Simuladas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">12</div>
                <div className="text-sm text-gray-600">Pedidos Hoje</div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">8</div>
                <div className="text-sm text-gray-600">Entregues</div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">4</div>
                <div className="text-sm text-gray-600">Pendentes</div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">3</div>
                <div className="text-sm text-gray-600">Entregadores</div>
              </div>
            </div>

          </div>

          {/* Status do Sistema */}
          <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Status do Sistema</h3>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 font-medium">Sistema Online</span>
              </div>
              <p className="text-gray-600">
                Todos os serviços estão funcionando normalmente
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}