'use client'

import { useState } from 'react'

export default function NewManualOrderPage() {
  const [formData, setFormData] = useState({
    customerName: '',
    address: '',
    phone: '',
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Pedido criado com sucesso! (Simulação)')
    window.location.href = '/'
  }

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
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl shadow-lg">
                <span className="text-xl">📦</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Novo Pedido Manual
                </h1>
                <p className="text-sm text-gray-600">Criar pedido detalhado</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Cliente */}
            <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Dados do Cliente</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Cliente
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite o nome do cliente"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Endereço de Entrega</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço Completo
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Rua, número, bairro, cidade"
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* Observações */}
            <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Observações</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas do Pedido
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => window.location.href = '/'}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium rounded-xl transition-colors"
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