'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface VehicleSelectorProps {
  driverId?: string
  onVehicleChange?: (vehicleType: 'moto' | 'carro' | 'caminhao') => void
}

const vehicles = [
  { type: 'moto' as const, name: 'Moto', icon: '🏍️', description: 'Rápido e ágil' },
  { type: 'carro' as const, name: 'Carro', icon: '🚗', description: 'Confortável e seguro' },
  { type: 'caminhao' as const, name: 'Caminhão', icon: '🚛', description: 'Para cargas grandes' }
]

export function VehicleSelector({ driverId, onVehicleChange }: VehicleSelectorProps) {
  const { user } = useAuth()
  const [selectedVehicle, setSelectedVehicle] = useState<'moto' | 'carro' | 'caminhao'>('moto')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCurrentVehicle()
  }, [driverId, user])

  const loadCurrentVehicle = async () => {
    if (!user) return

    try {
      // Se driverId específico foi fornecido, buscar por ele
      if (driverId) {
        const { data } = await supabase
          .from('delivery_drivers')
          .select('vehicle_type')
          .eq('id', driverId)
          .single()

        if (data?.vehicle_type) {
          setSelectedVehicle(data.vehicle_type)
        }
      } else {
        // Buscar pelo usuário atual
        const { data } = await supabase
          .from('delivery_drivers')
          .select('vehicle_type')
          .eq('user_id', user.id)
          .single()

        if (data?.vehicle_type) {
          setSelectedVehicle(data.vehicle_type)
        }
      }
    } catch (error) {
      console.log('Veículo não encontrado, usando padrão')
    }
  }

  const updateVehicle = async (vehicleType: 'moto' | 'carro' | 'caminhao') => {
    if (!user) return

    setLoading(true)

    try {
      const targetId = driverId || user.id
      const updateField = driverId ? 'id' : 'user_id'

      const { error } = await supabase
        .from('delivery_drivers')
        .update({ vehicle_type: vehicleType })
        .eq(updateField, targetId)

      if (error) throw error

      setSelectedVehicle(vehicleType)
      onVehicleChange?.(vehicleType)
      
      toast.success(`Veículo alterado para ${vehicles.find(v => v.type === vehicleType)?.name}`)
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error)
      toast.error('Erro ao alterar veículo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg">Tipo de Veículo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <Button
              key={vehicle.type}
              variant={selectedVehicle === vehicle.type ? "default" : "outline"}
              onClick={() => updateVehicle(vehicle.type)}
              disabled={loading}
              className={`h-auto p-4 flex flex-col items-center gap-2 rounded-xl transition-all ${
                selectedVehicle === vehicle.type 
                  ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl">{vehicle.icon}</span>
              <div className="text-center">
                <div className="font-semibold">{vehicle.name}</div>
                <div className="text-xs opacity-75">{vehicle.description}</div>
              </div>
              {selectedVehicle === vehicle.type && (
                <Badge variant="secondary" className="mt-1">
                  Selecionado
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}