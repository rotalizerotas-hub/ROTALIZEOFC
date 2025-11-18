export default function Home() {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          Rotalize
        </h1>
        <p className="text-gray-600 mb-8">
          Sistema funcionando!
        </p>
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="text-6xl mb-4">✅</div>
          <p className="text-green-600 font-semibold">
            Preview carregado com sucesso!
          </p>
        </div>
      </div>
    </div>
  )
}