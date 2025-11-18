'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Bike, RotateCcw, User } from 'lucide-react'

interface DeliveryDriver {
  id: string
  user_id: string
  is_online: boolean
  profiles: {
    full_name: string
    email: string
  }
}

interface DeliveryDriverSelectorProps {
  onDriverSelect: (driverId: string | null, isAutomatic: boolean) => void
  selectedDriverId?: string
  disabled?: boolean
}

export function DeliveryDriverSelector({ 
  onDriverSelect, 
  selectedDriverId, 
  disabled = false 
}: DeliveryDriverSelectorProps) {
  const { user } = useAuth()
  const [isAutomatic, setIsAutomatic] = useState(true)
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([])
  const [loading, setLoading] = useState(true)
  const [lastAssignedIndex, setLastAssignedIndex] = useState(0)

  useEffect(() => {
    if (user) {
      loadDrivers()
      loadLastAssignedIndex()
    }
  }, [user])

  useEffect(() => {
    // Quando modo automático muda, notificar o componente pai
    if (isAutomatic) {
      const nextDriver = getNextDriverRobinRound()
      onDriverSelect(nextDriver?.id || null, true)
    } else {
      onDriverSelect(selectedDriverId || null, false)
    }
  }, [isAutomatic])

  const loadDrivers = async () => {
    if (!user) return

    try {
      console.log('🚚 [DRIVER SELECTOR] === INICIANDO CARREGAMENTO ===')
      console.log('👤 [DRIVER SELECTOR] Usuário ID:', user.id)

      // PASSO 1: Buscar organizações do usuário (query simples)
      console.log('🏢 [DRIVER SELECTOR] PASSO 1: Buscando organizações...')
      
      const { data: userOrgs, error: userOrgsError } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)

      console.log('🏢 [DRIVER SELECTOR] Resultado organizações:')
      console.log('   - Erro:', userOrgsError)
      console.log('   - Dados:', userOrgs)
      console.log('   - Quantidade:', userOrgs?.length || 0)

      if (userOrgsError) {
        console.error('❌ [DRIVER SELECTOR] Erro ao buscar organizações:', userOrgsError)
        setDrivers([])
        setLoading(false)
        return
      }

      const orgIds = userOrgs?.map(uo => uo.organization_id) || []
      console.log('🏢 [DRIVER SELECTOR] IDs das organizações:', orgIds)

      if (orgIds.length === 0) {
        console.log('📭 [DRIVER SELECTOR] Usuário sem organizações')
        setDrivers([])
        setLoading(false)
        return
      }

      // PASSO 2: Buscar entregadores (query simples, sem joins)
      console.log('🚚 [DRIVER SELECTOR] PASSO 2: Buscando entregadores...')
      
      const { data: driversData, error: driversError } = await supabase
        .from('delivery_drivers')
        .select('id, user_id, is_online, organization_id, created_at')
        .in('organization_id', orgIds)
        .order('created_at', { ascending: true })

      console.log('🚚 [DRIVER SELECTOR] Resultado entregadores:')
      console.log('   - Erro:', driversError)
      console.log('   - Dados:', driversData)
      console.log('   - Quantidade:', driversData?.length || 0)

      if (driversError) {
        console.error('❌ [DRIVER SELECTOR] Erro ao buscar entregadores:', driversError)
        setDrivers([])
        setLoading(false)
        return
      }

      if (!driversData || driversData.length === 0) {
        console.log('📭 [DRIVER SELECTOR] Nenhum entregador encontrado')
        setDrivers([])
        setLoading(false)
        return
      }

      // PASSO 3: Buscar perfis dos entregadores (query simples)
      console.log('👤 [DRIVER SELECTOR] PASSO 3: Buscando perfis...')
      
      const userIds = driversData.map(d => d.user_id).filter(Boolean)
      console.log('👤 [DRIVER SELECTOR] User IDs para buscar:', userIds)

      if (userIds.length === 0) {
        console.log('⚠️ [DRIVER SELECTOR] Nenhum user_id válido')
        setDrivers([])
        setLoading(false)
        return
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds)

      console.log('👤 [DRIVER SELECTOR] Resultado perfis:')
      console.log('   - Erro:', profilesError)
      console.log('   - Dados:', profilesData)
      console.log('   - Quantidade:', profilesData?.length || 0)

      if (profilesError) {
        console.error('⚠️ [DRIVER SELECTOR] Erro ao buscar perfis (continuando):', profilesError)
      }

      // PASSO 4: Combinar dados
      console.log('🔄 [DRIVER SELECTOR] PASSO 4: Combinando dados...')
      
      const processedDrivers: DeliveryDriver[] = driversData.map((driver: any) => {
        const profile = profilesData?.find(p => p.id === driver.user_id)
        
        const driverData = {
          id: driver.id,
          user_id: driver.user_id,
          is_online: Boolean(driver.is_online),
          profiles: {
            full_name: profile?.full_name || `Entregador ${driver.id.slice(-4)}`,
            email: profile?.email || 'entregador@exemplo.com'
          }
        }

        console.log(`👤 [DRIVER SELECTOR] Processado: ${driverData.profiles.full_name} (${driverData.is_online ? 'Online' : 'Offline'})`)
        return driverData
      })

      console.log('✅ [DRIVER SELECTOR] === CARREGAMENTO CONCLUÍDO ===')
      console.log('📊 [DRIVER SELECTOR] Total processados:', processedDrivers.length)
      console.log('🟢 [DRIVER SELECTOR] Online:', processedDrivers.filter(d => d.is_online).length)
      console.log('🔴 [DRIVER SELECTOR] Offline:', processedDrivers.filter(d => !d.is_online).length)

      setDrivers(processedDrivers)

    } catch (error) {
      console.error('❌ [DRIVER SELECTOR] ERRO GERAL:', error)
      console.error('❌ [DRIVER SELECTOR] Stack trace:', error)
      setDrivers([])
    } finally {
      setLoading(false)
      console.log('🏁 [DRIVER SELECTOR] Loading finalizado')
    }
  }

  const loadLastAssignedIndex = async () => {
    try {
      const stored = localStorage.getItem('lastAssignedDriverIndex')
      if (stored) {
        setLastAssignedIndex(parseInt(stored, 10))
        console.log('📋 [ROBIN ROUND] Índice carregado:', stored)
      }
    } catch (error) {
      console.log('⚠️ [ROBIN ROUND] Erro ao carregar índice:', error)
    }
  }

  const saveLastAssignedIndex = (index: number) => {
    try {
      localStorage.setItem('lastAssignedDriverIndex', index.toString())
      setLastAssignedIndex(index)
      console.log('💾 [ROBIN ROUND] Índice salvo:', index)
    } catch (error) {
      console.log('⚠️ [ROBIN ROUND] Erro ao salvar índice:', error)
    }
  }

  const getNextDriverRobinRound = (): DeliveryDriver | null => {
    if (drivers.length === 0) {
      console.log('⚠️ [ROBIN ROUND] Nenhum entregador disponível')
      return null
    }

    // Filtrar apenas entregadores online para Robin Round
    const onlineDrivers = drivers.filter(d => d.is_online)
    
    if (onlineDrivers.length === 0) {
      console.log('⚠️ [ROBIN ROUND] Nenhum entregador online, usando todos')
      // Se nenhum online, usar todos os entregadores
      const nextIndex = (lastAssignedIndex + 1) % drivers.length
      const nextDriver = drivers[nextIndex]
      saveLastAssignedIndex(nextIndex)
      console.log(`🔄 [ROBIN ROUND] Próximo entregador (todos): ${nextDriver.profiles.full_name}`)
      return nextDriver
    }

    // Robin Round apenas com entregadores online
    const nextIndex = (lastAssignedIndex + 1) % onlineDrivers.length
    const nextDriver = onlineDrivers[nextIndex]
    
    // Salvar o índice baseado na lista completa de drivers
    const fullListIndex = drivers.findIndex(d => d.id === nextDriver.id)
    saveLastAssignedIndex(fullListIndex)
    
    console.log(`🔄 [ROBIN ROUND] Próximo entregador online: ${nextDriver.profiles.full_name}`)
    return nextDriver
  }

  const handleAutomaticToggle = (checked: boolean) => {
    setIsAutomatic(checked)
    console.log(`🔄 [MODE] Modo ${checked ? 'automático' : 'manual'} ativado`)
  }

  const handleManualDriverSelect = (driverId: string) => {
    onDriverSelect(driverId, false)
    console.log(`👤 [MANUAL] Entregador selecionado: ${driverId}`)
  }

  const onlineDrivers = drivers.filter(d => d.is_online)
  const offlineDrivers = drivers.filter(d => !d.is_online)

  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2 text-base font-medium">
        <Bike className="w-5 h-5 text-blue-600" />
        Entregador Responsável
      </Label>

      {/* Toggle Automático/Manual */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3">
          <RotateCcw className={`w-5 h-5 ${isAutomatic ? 'text-green-600' : 'text-gray-400'}`} />
          <div>
            <div className="font-medium text-gray-900">
              Distribuição Automática (Robin Round)
            </div>
            <div className="text-sm text-gray-600">
              {isAutomatic 
                ? 'Pedidos serão distribuídos automaticamente entre entregadores'
                : 'Você escolhe manualmente o entregador para cada pedido'
              }
            </div>
          </div>
        </div>
        <Switch
          checked={isAutomatic}
          onCheckedChange={handleAutomaticToggle}
          disabled={disabled || loading}
        />
      </div>

      {/* Modo Automático - Próximo Entregador */}
      {isAutomatic && (
        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-green-900">
                Próximo na fila: {getNextDriverRobinRound()?.profiles.full_name || 'Nenhum entregador disponível'}
              </div>
              <div className="text-sm text-green-700">
                {getNextDriverRobinRound()?.profiles.email || 'Cadastre entregadores primeiro'}
              </div>
            </div>
            <div className="text-xs text-green-600 font-medium">
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
                  ? "🔄 Carregando entregadores..." 
                  : drivers.length === 0 
                    ? "❌ Nenhum entregador disponível"
                    : "👤 Escolha um entregador"
              } />
            </SelectTrigger>
            <SelectContent className="w-full max-h-[300px]">
              {/* Entregadores Online */}
              {onlineDrivers.length > 0 && (
                <>
                  <div className="px-2 py-1 text-xs font-medium text-green-600 bg-green-50">
                    🟢 ONLINE ({onlineDrivers.length})
                  </div>
                  {onlineDrivers.map((driver) => (
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
                      </div>
                    </SelectItem>
                  ))}
                </>
              )}

              {/* Entregadores Offline */}
              {offlineDrivers.length > 0 && (
                <>
                  {onlineDrivers.length > 0 && (
                    <div className="border-t border-gray-200 my-1" />
                  )}
                  <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-50">
                    🔴 OFFLINE ({offlineDrivers.length})
                  </div>
                  {offlineDrivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id} className="py-3 opacity-60">
                      <div className="flex items-center gap-3 w-full">
                        <div className="relative">
                          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {driver.profiles.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 rounded-full border-2 border-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-600 truncate">
                            {driver.profiles.full_name}
                          </div>
                          <div className="text-sm text-gray-400 truncate">
                            {driver.profiles.email}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>

          {/* Status dos Entregadores */}
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              {loading ? (
                <span>🔄 Carregando...</span>
              ) : drivers.length === 0 ? (
                <span className="text-red-600">❌ Nenhum entregador cadastrado</span>
              ) : (
                <span>
                  📊 {drivers.length} entregador{drivers.length !== 1 ? 'es' : ''} • 
                  <span className="text-green-600 ml-1">
                    {onlineDrivers.length} online
                  </span> • 
                  <span className="text-gray-500 ml-1">
                    {offlineDrivers.length} offline
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Aviso quando não há entregadores */}
      {drivers.length === 0 && !loading && (
        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <span className="text-lg">❌</span>
            <div>
              <div className="font-medium">Nenhum entregador cadastrado</div>
              <div className="text-sm">
                Cadastre entregadores primeiro na seção "Entregadores"
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info (remover em produção) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
          <div>🔍 Debug: {drivers.length} entregadores carregados</div>
          <div>👤 Usuário: {user?.id}</div>
          <div>🔄 Loading: {loading ? 'Sim' : 'Não'}</div>
          <div>⚙️ Modo: {isAutomatic ? 'Automático' : 'Manual'}</div>
        </div>
      )}
    </div>
  )
}