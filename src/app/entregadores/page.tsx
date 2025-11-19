'use client'

export default function DriversPage() {
  const drivers = [
    { id: 1, name: 'João Silva', vehicle: '🏍️', status: 'online', deliveries: 5 },
    { id: 2, name: 'Maria Santos', vehicle: '🚗', status: 'online', deliveries: 3 },
    { id: 3, name: 'Pedro Costa', vehicle: '🚛', status: 'offline', deliveries: 8 }
  ]

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
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
                <span className="text-xl">🚚</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Entregadores
                </h1>
                <p className="text-sm text-gray-600">Gerenciar equipe de entrega</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">2</div>
                <div className="text-sm text-gray-600">Online</div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600 mb-2">1</div>
                <div className="text-sm text-gray-600">Offline</div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">16</div>
                <div className="text-sm text-gray-600">Entregas Hoje</div>
              </div>
            </div>

          </div>

          {/* Lista de Entregadores */}
          <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Equipe de Entregadores</h3>
            
            <div className="space-y-4">
              {drivers.map((driver) => (
                <div key={driver.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{driver.vehicle}</div>
                    <div>
                      <div className="font-medium text-gray-900">{driver.name}</div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          driver.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        <span className={`text-sm ${
                          driver.status === 'online' ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {driver.status === 'online' ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{driver.deliveries}</div>
                    <div className="text-sm text-gray-600">entregas hoje</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-xl transition-colors">
                + Adicionar Entregador
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}