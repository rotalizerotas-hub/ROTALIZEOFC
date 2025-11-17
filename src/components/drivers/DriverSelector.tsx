'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { User } from 'lucide-react'

interface ActiveDriver {
  id: string
  user_id: string
  profiles: {
    full_name: string
    email: string
  }
}

interface DriverSelectorProps {
  onDriverSelect?: (driverId: string | null) => void
  selectedDriverId?: string
}

export function DriverSelector({ onDriverSelect, selectedDriverId }: DriverSelectorProps) {
  const { user } = useAuth()
  const [activeDrivers, setActiveDrivers] = useState<ActiveDriver[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadActiveDrivers()
    }
  }, [user])

  const loadActiveDrivers = async () => {
    if (!user) return

    try {
      console.log('🔄 [DRIVER SELECTOR] Carregando entregadores ativos...')

      // Buscar organizações do usuário
      const { data: userOrgs, error: userOrgsError } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)

      if (userOrgsError) {
        console.error('❌ [DRIVER SELECTOR] Erro ao buscar organizações:', userOrgsError)
        setActiveDrivers([])
        setLoading(false)
        return
      }

      const orgIds = userOrgs?.map(uo => uo.organization_id) || []

      if (orgIds.length === 0) {
        console.log('📭 [DRIVER SELECTOR] Usuário sem organizações')
        setActiveDrivers([])
        setLoading(false)
        return
      }

      // Buscar entregadores ativos (is_online = true)
      const { data: driversData, error: driversError } = await supabase
        .from('delivery_drivers')
        .select(`
          id,
          user_id,
          is_online
        `)
        .in('organization_id', orgIds)
        .eq('is_online', true) // Apenas entregadores ativos
        .order('created_at', { ascending: false })

      if (driversError) {
        console.error('❌ [DRIVER SELECTOR] Erro ao buscar entregadores:', driversError)
        setActiveDrivers([])
        setLoading(false)
        return
      }

      if (!driversData || driversData.length === 0) {
        console.log('📭 [DRIVER SELECTOR] Nenhum entregador ativo encontrado')
        setActiveDrivers([])
        setLoading(false)
        return
      }

      // Buscar perfis dos entregadores ativos
      const userIds = driversData.map(d => d.user_id).filter(Boolean)
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds)

      if (profilesError) {
        console.error('❌ [DRIVER SELECTOR] Erro ao buscar perfis:', profilesError)
      }

      // Combinar dados
      const processedDrivers: ActiveDriver[] = driversData.map((driver: any) => {
        const profile = profilesData?.find(p => p.id === driver.user_id)
        
        return {
          id: driver.id,
          user_id: driver.user_id,
          profiles: {
            full_name: profile?.full_name || `Entregador ${driver.id.slice(-4)}`,
            email: profile?.email || 'entregador@exemplo.com'
          }
        }
      })

      console.log('✅ [DRIVER SELECTOR] Entregadores ativos carregados:', processedDrivers.length)
      setActiveDrivers(processedDrivers)

    } catch (error) {
      console.error('❌ [DRIVER SELECTOR] Erro geral:', error)
      setActiveDrivers([])
    } finally {
      setLoading(false)
    }
  }

  const handleDriverChange = (value: string) => {
    const driverId = value === 'none' ? null : value
    onDriverSelect?.(driverId)
  }

  return (
    <div className="p-6 pt-0 lasy-highlight">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-gray-900">Selecione o entregador</span>
          {loading && (
            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          )}
        </div>

        <Select 
          value={selectedDriverId || 'none'} 
          onValueChange={handleDriverChange}
          disabled={loading}
        >
          <SelectTrigger className="w-full rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors">
            <SelectValue placeholder={
              loading 
                ? "Carregando entregadores..." 
                : activeDrivers.length === 0 
                  ? "Nenhum entregador ativo"
                  : "Escolha um entregador ativo"
            } />
          </SelectTrigger>
          <SelectContent className="w-full max-h-[300px]">
            {/* Opção para modo automático */}
            <SelectItem value="none" className="py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AUTO</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Modo automático ativo</div>
                  <div className="text-sm text-gray-500">Sistema escolhe automaticamente</div>
                </div>
              </div>
            </SelectItem>
            
            {/* Lista de entregadores ativos */}
            {activeDrivers.map((driver) => (
              <SelectItem key={driver.id} value={driver.id} className="py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {driver.profiles.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {driver.profiles.full_name}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {driver.profiles.email}
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status dos entregadores */}
        <div className="text-sm text-gray-600">
          {loading ? (
            <span>🔄 Carregando...</span>
          ) : activeDrivers.length === 0 ? (
            <span className="text-orange-600">⚠️ Nenhum entregador online no momento</span>
          ) : (
            <span className="text-green-600">
              ✅ {activeDrivers.length} entregador{activeDrivers.length !== 1 ? 'es' : ''} ativo{activeDrivers.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}