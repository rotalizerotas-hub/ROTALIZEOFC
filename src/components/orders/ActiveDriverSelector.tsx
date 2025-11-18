'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Bike, RotateCcw, User } from 'lucide-react'

interface ActiveDriver {
  id: string
  user_id: string
  profiles: {
    full_name: string
    email: string
  }
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
  const [isAutomatic, setIsAutomatic] = useState(false)
  const [activeDrivers, setActiveDrivers] = useState<ActiveDriver[]>([])
  const [loading, setLoading] = useState(true)
  const [roundRobinIndex, setRoundRobinIndex] = useState(0)

  // Memoizar função para evitar re-renders
  const getNextDriverRoundRobin = useCallback((): ActiveDriver | null => {
    if (activeDrivers.length === 0) {
      console.log('⚠️ [ROUND ROBIN] Nenhum entregador ativo disponível')
      return null
    }

    // Round Robin: próximo entregador na fila
    const nextIndex = (roundRobinIndex + 1) % activeDrivers.length
    const nextDriver = activeDrivers[nextIndex]
    
    console.log(`🔄 [ROUND ROBIN] Próximo entregador: ${nextDriver.profiles.full_name} (índice: ${nextIndex})`)
    return nextDriver
  }, [activeDrivers, roundRobinIndex])

  const saveRoundRobinIndex = useCallback((index: number) => {
    try {
      localStorage.setItem('roundRobinDriverIndex', index.toString())
      setRoundRobinIndex(index)
      console.log('💾 [ROUND ROBIN] Índice salvo:', index)
    } catch (error) {
      console.log('⚠️ [ROUND ROBIN] Erro ao salvar índice:', error)
    }
  }, [])

  const loadRoundRobinIndex = useCallback(() => {
    try {
      const stored = localStorage.getItem('roundRobinDriverIndex')
      if (stored) {
        setRoundRobinIndex(parseInt(stored, 10))
        console.log('📋 [ROUND ROBIN] Índice carregado:', stored)
      }
    } catch (error) {
      console.log('⚠️ [ROUND ROBIN] Erro ao carregar índice:', error)
    }
  }, [])

  const loadActiveDrivers = useCallback(async () => {
    if (!user) return

    try {
      console.log('🚚 [ACTIVE DRIVERS] Carregando entregadores ativos...')

      // Buscar organizações do usuário
      const { data: userOrgs, error: userOrgsError } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)

      if (userOrgsError) {
        console.error('❌ [ACTIVE DRIVERS] Erro ao buscar organizações:', userOrgsError)
        setActiveDrivers([])
        setLoading(false)
        return
      }

      const orgIds = userOrgs?.map(uo => uo.organization_id) || []

      if (orgIds.length === 0) {
        console.log('📭 [ACTIVE DRIVERS] Usuário sem organizações')
        setActiveDrivers([])
        setLoading(false)
        return
      }

      // Buscar APENAS entregadores ATIVOS (is_online = true)
      const { data: driversData, error: driversError } = await supabase
        .from('delivery_drivers')
        .select('id, user_id, is_online')
        .in('organization_id', orgIds)
        .eq('is_online', true) // APENAS ATIVOS
        .order('created_at', { ascending: true })

      if (driversError) {
        console.error('❌ [ACTIVE DRIVERS] Erro ao buscar entregadores:', driversError)
        setActiveDrivers([])
        setLoading(false)
        return
      }

      if (!driversData || driversData.length === 0) {
        console.log('📭 [ACTIVE DRIVERS] Nenhum entregador ativo encontrado')
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
        console.error('❌ [ACTIVE DRIVERS] Erro ao buscar perfis:', profilesError)
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

      console.log('✅ [ACTIVE DRIVERS] Entregadores ativos carregados:', processedDrivers.length)
      setActiveDrivers(processedDrivers)

    } catch (error) {
      console.error('❌ [ACTIVE DRIVERS] Erro geral:', error)
      setActiveDrivers([])
    } finally {
      setLoading(false)
    }
  }, [user])

  // Carregar dados iniciais apenas uma vez
  useEffect(() => {
    if (user) {
      loadActiveDrivers()
      loadRoundRobinIndex()
    }
  }, [user, loadActiveDrivers, loadRoundRobinIndex])

  // Gerenciar seleção automática apenas quando necessário
  useEffect(() => {
    if (isAutomatic && activeDrivers.length > 0) {
      const nextDriver = getNextDriverRoundRobin()
      if (nextDriver) {
        const nextIndex = (roundRobinIndex + 1) % activeDrivers.length
        saveRoundRobinIndex(nextIndex)
        onDriverSelect(nextDriver.id)
      }
    }
  }, [isAutomatic, activeDrivers.length]) // Removido getNextDriverRoundRobin das dependências

  const handleAutomaticToggle = useCallback(() => {
    const newAutomatic = !isAutomatic
    setIsAutomatic(newAutomatic)
    
    console.log(`🔄 [MODE] Modo ${newAutomatic ? 'automático' : 'manual'} ativado`)
    
    // REMOVIDO: Não limpa seleção quando desativa automático
    // O botão só desliga manualmente, mantém estado atual
  }, [isAutomatic])

  const handleManualDriverSelect = useCallback((driverId: string) => {
    onDriverSelect(driverId)
    console.log(`👤 [MANUAL] Entregador selecionado: ${driverId}`)
  }, [onDriverSelect])

  // Calcular próximo entregador para exibição (sem efeitos colaterais)
  const nextDriverForDisplay = isAutomatic && activeDrivers.length > 0 
    ? activeDrivers[(roundRobinIndex + 1) % activeDrivers.length] 
    : null

  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2 text-base font-medium">
        <Bike className="w-5 h-5 text-blue-600" />
        Entregador Responsável
      </Label>

      {/* Botão Modo Automático */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3">
          <RotateCcw className={`w-5 h-5 ${isAutomatic ? 'text-green-600' : 'text-gray-400'}`} />
          <div>
            <div className="font-medium text-gray-900">
              Distribuição Automática (Round Robin)
            </div>
            <div className="text-sm text-gray-600">
              {isAutomatic 
                ? 'Cada pedido será atribuído automaticamente ao próximo entregador ativo'
                : 'Escolha manualmente o entregador para este pedido'
              }
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAutomaticToggle}
          disabled={disabled || loading || activeDrivers.length === 0}
          className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm h-9 px-4 py-2 rounded-xl lasy-highlight ${
            isAutomatic 
              ? 'bg-green-500 text-white hover:bg-green-600 border-green-500' 
              : 'bg-red-500 text-white hover:bg-red-600 border-red-500'
          }`}
        >
          {isAutomatic ? 'ON Automático' : 'OFF Automático'}
        </button>
      </div>

      {/* Modo Automático - Próximo Entregador */}
      {isAutomatic && activeDrivers.length > 0 && nextDriverForDisplay && (
        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-green-900">
                Próximo na fila: {nextDriverForDisplay.profiles.full_name}
              </div>
              <div className="text-sm text-green-700">
                {nextDriverForDisplay.profiles.email}
              </div>
            </div>
            <div className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
              AUTO
            </div>
          </div>
        </div>
      )}

      {/* Modo Manual - Seleção de Entregador */}
      {!isAutomatic && (
        <div className="space-y-3">
          <Select 
            value={selectedDriverId || ''} 
            onValueChange={handleManualDriverSelect}
            disabled={disabled || loading}
          >
            <SelectTrigger className="rounded-xl h-12 border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <SelectValue placeholder={
                loading 
                  ? "🔄 Carregando entregadores ativos..." 
                  : activeDrivers.length === 0 
                    ? "❌ Nenhum entregador ativo"
                    : "👤 Escolha um entregador ativo"
              } />
            </SelectTrigger>
            <SelectContent className="w-full max-h-[300px]">
              {activeDrivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id} className="py-3">
                  <div className="flex items-center gap-3 w-full">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {driver.profiles.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {driver.profiles.full_name}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {driver.profiles.email}
                      </div>
                    </div>
                    <div className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                      ATIVO
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status dos Entregadores Ativos */}
          <div className="text-sm text-gray-600">
            {loading ? (
              <span>🔄 Carregando entregadores ativos...</span>
            ) : activeDrivers.length === 0 ? (
              <span className="text-orange-600">⚠️ Nenhum entregador ativo no momento</span>
            ) : (
              <span className="text-green-600">
                ✅ {activeDrivers.length} entregador{activeDrivers.length !== 1 ? 'es' : ''} ativo{activeDrivers.length !== 1 ? 's' : ''} disponível{activeDrivers.length !== 1 ? 'eis' : ''}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Aviso quando não há entregadores ativos */}
      {activeDrivers.length === 0 && !loading && (
        <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
          <div className="flex items-center gap-2 text-orange-700">
            <span className="text-lg">⚠️</span>
            <div>
              <div className="font-medium">Nenhum entregador ativo</div>
              <div className="text-sm">
                Ative entregadores na seção "Entregadores" para poder criar pedidos
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
          <div>🔍 Entregadores ativos: {activeDrivers.length}</div>
          <div>🔄 Modo: {isAutomatic ? 'Automático' : 'Manual'}</div>
          <div>📋 Índice Round Robin: {roundRobinIndex}</div>
          <div>👤 Selecionado: {selectedDriverId || 'Nenhum'}</div>
        </div>
      )}
    </div>
  )
}