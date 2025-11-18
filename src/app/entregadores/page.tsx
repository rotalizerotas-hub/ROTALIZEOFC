'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { LoginForm } from '@/components/auth/LoginForm'
import { DriversManagement } from '@/components/drivers/DriversManagement'
import { ActiveDriverSelector } from '@/components/orders/ActiveDriverSelector'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect } from 'react'

export default function EntregadoresPage() {
  const { user, loading } = useAuth()
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)

  // Sincronizar com localStorage
  useEffect(() => {
    const loadSelectedDriver = () => {
      try {
        const stored = localStorage.getItem('selectedDriverId')
        if (stored) {
          setSelectedDriverId(stored)
        }
      } catch (error) {
        console.log('Erro ao carregar entregador selecionado:', error)
      }
    }

    loadSelectedDriver()

    // Escutar mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedDriverId') {
        setSelectedDriverId(e.newValue)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleDriverSelection = (driverId: string | null) => {
    setSelectedDriverId(driverId)
    try {
      if (driverId) {
        localStorage.setItem('selectedDriverId', driverId)
      } else {
        localStorage.removeItem('selectedDriverId')
      }
    } catch (error) {
      console.log('Erro ao salvar entregador selecionado:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg mb-4 animate-pulse">
            <span className="text-2xl font-bold text-white">R</span>
          </div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
      {/* Header movido para o topo */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl shadow-lg">
              <span className="text-2xl font-bold text-white">🚚</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Entregadores
              </h1>
              <p className="text-sm text-gray-600">Gerenciar entregadores</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Componente de Seleção de Entregador */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle>Distribuição de Entregadores</CardTitle>
            </CardHeader>
            <CardContent>
              <ActiveDriverSelector
                onDriverSelect={handleDriverSelection}
                selectedDriverId={selectedDriverId || undefined}
              />
            </CardContent>
          </Card>

          {/* Lista de Entregadores */}
          <DriversManagement />
        </div>
      </div>
    </div>
  )
}