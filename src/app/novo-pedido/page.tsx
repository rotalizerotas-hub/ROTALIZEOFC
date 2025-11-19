export default function NewOrderPage() {
  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-2xl mx-auto">
        
        <div className="mb-6">
          <a href="/" className="text-blue-600 hover:text-blue-800">← Voltar</a>
        </div>

        <h1 className="text-3xl font-bold text-blue-600 mb-8">
          Novo Pedido Manual
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <form>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Nome do Cliente
              </label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                placeholder="Digite o nome do cliente"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Telefone
              </label>
              <input 
                type="tel" 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Endereço
              </label>
              <textarea 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                rows={3}
                placeholder="Endereço completo"
              ></textarea>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Observações
              </label>
              <textarea 
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                rows={3}
                placeholder="Observações do pedido"
              ></textarea>
            </div>

            <div className="flex gap-4">
              <a 
                href="/"
                className="flex-1 bg-gray-500 text-white text-center py-2 px-4 rounded hover:bg-gray-600"
              >
                Cancelar
              </a>
              <button 
                type="submit"
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Criar Pedido
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  )
}