export default function Page() {
  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">
          RotaLize
        </h1>
        
        <p className="text-xl text-gray-600 mb-12">
          Sistema de Gestão de Entregas
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-bold mb-2">Novo Pedido</h3>
            <p className="text-gray-600 mb-4">Criar pedido manual</p>
            <a 
              href="/novo-pedido" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Criar
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold mb-2">Mapa</h3>
            <p className="text-gray-600 mb-4">Ver entregas</p>
            <a 
              href="/mapa" 
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Ver
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="text-xl font-bold mb-2">Entregadores</h3>
            <p className="text-gray-600 mb-4">Gerenciar equipe</p>
            <a 
              href="/entregadores" 
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              Gerenciar
            </a>
          </div>

        </div>

        <div className="mt-12 grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-sm text-gray-600">Pedidos</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">8</div>
            <div className="text-sm text-gray-600">Entregues</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">4</div>
            <div className="text-sm text-gray-600">Pendentes</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">3</div>
            <div className="text-sm text-gray-600">Entregadores</div>
          </div>
        </div>

      </div>
    </div>
  )
}