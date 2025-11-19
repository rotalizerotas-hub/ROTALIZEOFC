export default function DriversPage() {
  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-6">
          <a href="/" className="text-blue-600 hover:text-blue-800">← Voltar</a>
        </div>

        <h1 className="text-3xl font-bold text-blue-600 mb-8">
          Entregadores
        </h1>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">2</div>
            <div className="text-gray-600">Online</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-gray-600 mb-2">1</div>
            <div className="text-gray-600">Offline</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">16</div>
            <div className="text-gray-600">Entregas Hoje</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-6">Equipe de Entregadores</h3>
          
          <div className="space-y-4">
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-2xl">🏍️</div>
                <div>
                  <div className="font-bold">João Silva</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">5</div>
                <div className="text-sm text-gray-600">entregas hoje</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-2xl">🚗</div>
                <div>
                  <div className="font-bold">Maria Santos</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">3</div>
                <div className="text-sm text-gray-600">entregas hoje</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-2xl">🚛</div>
                <div>
                  <div className="font-bold">Pedro Costa</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-sm text-gray-500">Offline</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">8</div>
                <div className="text-sm text-gray-600">entregas hoje</div>
              </div>
            </div>

          </div>

          <div className="mt-6 text-center">
            <button className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600">
              + Adicionar Entregador
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}