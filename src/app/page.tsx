export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg mb-6">
            <span className="text-3xl font-bold text-white">R</span>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
            RotaLize
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Sistema de Gestão de Entregas
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            
            <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-bold mb-2">Novo Pedido</h3>
              <p className="text-gray-600 mb-4">Criar pedido manual</p>
              <a 
                href="/novo-pedido-manual"
                className="inline-block w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-medium py-2 px-4 rounded-xl hover:from-blue-600 hover:to-green-600 transition-colors"
              >
                Criar
              </a>
            </div>

            <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6">
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="text-xl font-bold mb-2">Mapa</h3>
              <p className="text-gray-600 mb-4">Ver entregas</p>
              <a 
                href="/mapa"
                className="inline-block w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium py-2 px-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-colors"
              >
                Visualizar
              </a>
            </div>

            <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-bold mb-2">Entregadores</h3>
              <p className="text-gray-600 mb-4">Gerenciar equipe</p>
              <a 
                href="/entregadores"
                className="inline-block w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium py-2 px-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-colors"
              >
                Gerenciar
              </a>
            </div>

          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="bg-white/80 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-gray-600">Pedidos</div>
            </div>
            <div className="bg-white/80 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-gray-600">Entregues</div>
            </div>
            <div className="bg-white/80 rounded-xl p-4">
              <div className="text-2xl font-bold text-yellow-600">4</div>
              <div className="text-sm text-gray-600">Pendentes</div>
            </div>
            <div className="bg-white/80 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-600">3</div>
              <div className="text-sm text-gray-600">Entregadores</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}