export default function MapPage() {
  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-6">
          <a href="/" className="text-blue-600 hover:text-blue-800">← Voltar</a>
        </div>

        <h1 className="text-3xl font-bold text-blue-600 mb-8">
          Mapa de Entregas
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Mapa Interativo</h3>
              <p className="text-gray-600">Visualização de entregas em tempo real</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <div>
                <div className="font-bold">Pendentes</div>
                <div className="text-sm text-gray-600">4 pedidos</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <div>
                <div className="font-bold">Em Trânsito</div>
                <div className="text-sm text-gray-600">2 pedidos</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <div>
                <div className="font-bold">Entregues</div>
                <div className="text-sm text-gray-600">8 pedidos</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}