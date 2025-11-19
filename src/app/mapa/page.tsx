'use client'

export default function MapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.location.href = '/'}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              ←
            </button>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <span className="text-xl">🗺️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Mapa de Entregas
                </h1>
                <p className="text-sm text-gray-600">Visualização em tempo real</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          
          {/* Mapa Simulado */}
          <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-6">
            <div className="h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Mapa Interativo</h3>
                <p className="text-gray-600">Visualização de entregas em tempo real</p>
                <div className="mt-6 grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <div className="bg-white/80 rounded-lg p-3">
                    <div className="text-2xl mb-1">📍</div>
                    <div className="text-sm font-medium">3 Pedidos</div>
                  </div>
                  <div className="bg-white/80 rounded-lg p-3">
                    <div className="text-2xl mb-1">🚚</div>
                    <div className="text-sm font-medium">2 Entregadores</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legenda */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <div>
                  <div className="font-medium">Pendentes</div>
                  <div className="text-sm text-gray-600">Aguardando atribuição</div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <div>
                  <div className="font-medium">Em Trânsito</div>
                  <div className="text-sm text-gray-600">A caminho do destino</div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <div>
                  <div className="font-medium">Entregues</div>
                  <div className="text-sm text-gray-600">Concluídos com sucesso</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}