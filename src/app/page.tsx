'use client'

import { useState } from 'react'

export default function Home() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg mb-4">
            <span className="text-2xl font-bold text-white">R</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            Rotalize
          </h1>
          <p className="text-gray-600">Sistema de Gestão de Entregas</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <div>
                <h3 className="font-semibold">Pedidos</h3>
                <p className="text-sm text-gray-600">Gerenciar entregas</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600">24</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🚚</span>
              </div>
              <div>
                <h3 className="font-semibold">Entregadores</h3>
                <p className="text-sm text-gray-600">Equipe ativa</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-green-600">8</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h3 className="font-semibold">Faturamento</h3>
                <p className="text-sm text-gray-600">Hoje</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-600">R$ 1.240</div>
          </div>
        </div>

        {/* Mapa Simulado */}
        <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-6 mb-8">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            Mapa de Entregas
          </h3>
          <div className="h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🗺️</div>
              <p className="text-gray-600 font-semibold">Mapa Interativo</p>
              <p className="text-sm text-gray-500">Visualização de rotas e entregas</p>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => setCount(count + 1)}
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-xl">➕</span>
              <span>Novo Pedido ({count})</span>
            </div>
          </button>

          <button className="bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white text-gray-700 font-semibold py-4 px-6 rounded-2xl shadow-lg transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center justify-center gap-3">
              <span className="text-xl">👥</span>
              <span>Gerenciar Equipe</span>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Rotalize - Sistema de Gestão de Entregas v1.0</p>
        </div>
      </div>
    </div>
  )
}