'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users, UserCheck, Zap, MapPin } from 'lucide-react'
import { toast } from 'sonner'

interface DeliveryDriver {
  id: string
  user_id: string
  is_online: boolean
  current_latitude: number | null
  current_longitude: number | null
  vehicle_type: 'moto' | 'carro' | 'caminhao'
  total_today: number
}

interface Profile {
  id: string
  full_name: string
}

interface ActiveDriverSelectorProps {
  onDriverSelect: (driverId: string | null) => void
  selectedDriverId?: string
  disabled?: boolean
}

export function ActiveDriverSelector({ 
  onDriverSelect, 
  selectedDriverId, 
  disabled = false 
}: ActiveDriverSelectorProps) {
  const { user } = useAuth()
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [autoMode, setAutoMode] = useState(false)

  useEffect(() => {
    if (user) {
      loadActiveDrivers()
    }
  }, [user])

  const loadActiveDrivers = async () => {
    if (!user) return

    setLoading(true)

    try {
      console.log('🚚 [DRIVERS] Carregando entregadores ativos...')

      // Buscar organizações do usuário
      const { data: userOrgs } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)

      const orgIds = userOrgs?.map(uo => uo.organization_id) || []

      if (orgIds.length === 0) {
        console.log('⚠️ [DRIVERS] Usuário não possui organizações')
        setLoading(false)
        return
      }

      // Carregar entregadores online
      const { data: driversData, error: driversError } = await supabase
        .from('delivery_drivers')
        .select('*')
        .in('organization_id', orgIds)
        .eq('is_online', true)
        .order('total_today', { ascending: false })

      if (driversError) {
        console.error('❌ [DRIVERS] Erro ao carregar entregadores:', driversError)
        throw driversError
      }

      console.log('📋 [DRIVERS] Entregadores encontrados:', driversData?.length || 0)

      // Carregar perfis dos entregadores
      const driverUserIds = driversData?.map(d => d.user_id) || []
      let profilesData: Profile[] = []

      if (driverUserIds.length > 0) {
        const { data: profilesResult, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', driverUserIds)

        if (profilesError) {
          console.error('❌ [DRIVERS] Erro ao carregar perfis:', profilesError)
        } else {
          profilesData = profilesResult || []
        }
      }

      setDrivers(driversData || [])
      setProfiles(profilesData)

      console.log('✅ [DRIVERS] Dados carregados:', {
        drivers: driversData?.length || 0,
        profiles: profilesData.length
      })

    } catch (error) {
      console.error('❌ [DRIVERS] Erro ao carregar entregadores:', error)
      toast.error('Erro ao carregar entregadores ativos')
    } finally {
      setLoading(false)
    }
  }

  const getDriverProfile = (userId: string) => {
    return profiles.find(p => p.id === userId)
  }

  const getVehicleIcon = (vehicleType: string) => {
    const icons = {
      moto: '🏍️',
      carro: '🚗',
      caminhao: '🚛'
    }
    return icons[vehicleType as keyof typeof icons] || '🚗'
  }

  const getDriverInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleDriverSelect = (driverId: string) => {
    if (disabled) return
    
    if (selectedDriverId === driverId) {
      // Desselecionar se já estiver selecionado
      onDriverSelect(null)
      setAutoMode(false)
    } else {
      onDriverSelect(driverId)
      setAutoMode(false)
    }
  }

  const handleAutoMode = () => {
    if (disabled) return
    
    setAutoMode(!autoMode)
    if (!autoMode) {
      // Ativar modo automático - selecionar o primeiro entregador disponível
      if (drivers.length > 0) {
        onDriverSelect(drivers[0].id)
      }
    } else {
      // Desativar modo automático
      onDriverSelect(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-sm text-gray-600">Carregando entregadores...</span>
        </div>
      </div>
    )
  }

  if (drivers.length === 0) {
    return (
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Users className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum entregador online
          </h3>
          <p className="text-sm text-gray-500 text-center mb-4">
            Não há entregadores disponíveis no momento. Verifique se há entregadores online.
          </p>
          <Button
            variant="outline"
            onClick={loadActiveDrivers}
            className="rounded-xl"
          >
            <Zap className="w-4 h-4 mr-2" />
            Atualizar Lista
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Modo Automático */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Entregadores Disponíveis</h3>
          <p className="text-sm text-gray-500">
            {drivers.length} entregador{drivers.length !== 1 ? 'es' : ''} online
          </p>
        </div>
        <Button
          variant={autoMode ? "default" : "outline"}
          onClick={handleAutoMode}
          disabled={disabled}
          className="rounded-xl"
        >
          <Zap className="w-4 h-4 mr-2" />
          {autoMode ? 'Automático Ativo' : 'Modo Automático'}
        </Button>
      </div>

      {/* Lista de Entregadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {drivers.map((driver) => {
          const profile = getDriverProfile(driver.user_id)
          const isSelected = selectedDriverId === driver.id
          
          return (
            <Card
              key={driver.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
                  : 'hover:shadow-md hover:border-gray-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleDriverSelect(driver.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white font-bold">
                      {profile ? getDriverInitials(profile.full_name) : '??'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">
                        {profile?.full_name || 'Entregador'}
                      </h4>
                      {isSelected && (
                        <UserCheck className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        Online
                      </Badge>
                      
                      <span className="text-lg">
                        {getVehicleIcon(driver.vehicle_type)}
                      </span>
                      
                      {driver.current_latitude && driver.current_longitude && (
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="w-3 h-3 mr-1" />
                          Localizado
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-1">
                      Entregas hoje: {driver.total_today}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Informação sobre seleção */}
      {selectedDriverId && !autoMode && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-200">
          <UserCheck className="w-5 h-5 text-blue-500" />
          <span className="text-sm text-blue-700">
            Entregador selecionado: {
              (() => {
                const driver = drivers.find(d => d.id === selectedDriverId)
                const profile = driver ? getDriverProfile(driver.user_id) : null
                return profile?.full_name || 'Entregador'
              })()
            }
          </span>
        </div>
      )}

      {autoMode && (
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
          <Zap className="w-5 h-5 text-green-500" />
          <span className="text-sm text-green-700">
            Modo automático ativo - O sistema selecionará o melhor entregador disponível
          </span>
        </div>
      )}
    </div>
  )
}