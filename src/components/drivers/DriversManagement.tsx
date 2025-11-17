'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Users, Plus, MapPin, Edit, Trash2, Key } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface DeliveryDriver {
  id: string
  user_id: string
  is_online: boolean
  total_today: number
  profiles: {
    full_name: string
    phone: string
    email: string
  }
  current_latitude: number | null
  current_longitude: number | null
}

export function DriversManagement() {
  const { user } = useAuth()
  const router = useRouter()
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewDriverDialog, setShowNewDriverDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState<string>('')
  const [creatingDriver, setCreatingDriver] = useState(false)
  
  // Estados para novo entregador
  const [newDriverData, setNewDriverData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: ''
  })

  // Estado para trocar senha
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    loadDrivers()
  }, [user])

  const loadDrivers = async () => {
    if (!user) return

    try {
      console.log('🚚 [LOAD] Carregando entregadores...')

      // Buscar organizações do usuário primeiro
      const { data: userOrgs, error: userOrgsError } = await supabase
        .from('user_organizations')
        .select('organization_id, role')
        .eq('user_id', user.id)

      if (userOrgsError) {
        console.error('❌ [LOAD] Erro ao buscar organizações:', userOrgsError)
      }

      const orgIds = userOrgs?.map(uo => uo.organization_id) || []
      console.log('🏢 [LOAD] Organizações do usuário:', orgIds)

      // Buscar entregadores das organizações do usuário
      let driversData = []
      
      if (orgIds.length > 0) {
        console.log('🔍 [LOAD] Buscando entregadores das organizações...')
        const { data: orgDriversData, error: orgDriversError } = await supabase
          .from('delivery_drivers')
          .select(`
            id,
            user_id,
            is_online,
            total_today,
            current_latitude,
            current_longitude,
            organization_id
          `)
          .in('organization_id', orgIds)
          .order('created_at', { ascending: false })

        if (orgDriversError) {
          console.error('❌ [LOAD] Erro ao buscar entregadores:', orgDriversError)
        } else {
          driversData = orgDriversData || []
          console.log('📊 [LOAD] Entregadores encontrados:', driversData.length)
        }
      }

      // Se não encontrou entregadores reais, usar dados de exemplo
      if (!driversData || driversData.length === 0) {
        console.log('📭 [LOAD] Nenhum entregador real encontrado, usando dados de exemplo...')
        
        const exampleDrivers: DeliveryDriver[] = [
          {
            id: 'example-1',
            user_id: 'example-user-1',
            is_online: true,
            total_today: 150.50,
            current_latitude: -19.9167,
            current_longitude: -43.9345,
            profiles: {
              full_name: 'João Silva - Exemplo',
              phone: '(31) 99999-1111',
              email: 'joao@exemplo.com'
            }
          },
          {
            id: 'example-2',
            user_id: 'example-user-2',
            is_online: false,
            total_today: 89.30,
            current_latitude: null,
            current_longitude: null,
            profiles: {
              full_name: 'Maria Santos - Exemplo',
              phone: '(31) 99999-2222',
              email: 'maria@exemplo.com'
            }
          }
        ]
        
        setDrivers(exampleDrivers)
        setLoading(false)
        console.log('✅ [LOAD] Dados de exemplo carregados')
        return
      }

      // Buscar perfis dos entregadores reais
      console.log('👤 [LOAD] Buscando perfis dos entregadores...')
      const userIds = driversData.map(driver => driver.user_id).filter(Boolean)
      
      if (userIds.length === 0) {
        console.log('⚠️ [LOAD] Nenhum user_id válido encontrado')
        setDrivers([])
        setLoading(false)
        return
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          phone,
          email
        `)
        .in('id', userIds)

      if (profilesError) {
        console.error('⚠️ [LOAD] Erro ao buscar perfis:', profilesError)
      }

      console.log('👤 [LOAD] Perfis encontrados:', profilesData?.length || 0)

      // Combinar dados de entregadores com perfis
      const processedDrivers: DeliveryDriver[] = driversData.map((driver: any) => {
        const profile = profilesData?.find(p => p.id === driver.user_id)
        
        return {
          id: driver.id,
          user_id: driver.user_id,
          is_online: Boolean(driver.is_online),
          total_today: Number(driver.total_today) || 0,
          current_latitude: driver.current_latitude,
          current_longitude: driver.current_longitude,
          profiles: profile ? {
            full_name: profile.full_name || `Entregador ${driver.id.slice(-4)}`,
            phone: profile.phone || '(31) 99999-0000',
            email: profile.email || 'entregador@exemplo.com'
          } : {
            full_name: `Entregador ${driver.id.slice(-4)}`,
            phone: '(31) 99999-0000',
            email: 'entregador@exemplo.com'
          }
        }
      })

      console.log('✅ [LOAD] Entregadores processados:', processedDrivers.length)
      setDrivers(processedDrivers)

    } catch (error) {
      console.error('❌ [LOAD] Erro ao carregar entregadores:', error)
      toast.error('Erro ao carregar entregadores')
      
      // Fallback para dados de exemplo
      const fallbackDrivers: DeliveryDriver[] = [
        {
          id: 'fallback-1',
          user_id: 'fallback-user-1',
          is_online: true,
          total_today: 125.00,
          current_latitude: -19.9167,
          current_longitude: -43.9345,
          profiles: {
            full_name: 'Entregador Ativo - Fallback',
            phone: '(31) 99999-0001',
            email: 'ativo@exemplo.com'
          }
        }
      ]
      setDrivers(fallbackDrivers)
    } finally {
      setLoading(false)
    }
  }

  const ensureUserHasOrganization = async (): Promise<string> => {
    if (!user) throw new Error('Usuário não autenticado')

    console.log('🏢 [ORG] Verificando organizações do usuário...')

    try {
      // Verificar se usuário já tem organização
      const { data: userOrgs, error: userOrgsError } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)

      if (userOrgsError) {
        console.error('❌ [ORG] Erro ao buscar organizações:', userOrgsError)
        throw new Error('Erro ao verificar organizações do usuário')
      }

      if (userOrgs && userOrgs.length > 0) {
        console.log('✅ [ORG] Organização encontrada:', userOrgs[0].organization_id)
        return userOrgs[0].organization_id
      }

      console.log('🔄 [ORG] Criando organização padrão...')

      // Buscar um tipo de estabelecimento padrão
      const { data: establishmentTypes, error: etError } = await supabase
        .from('establishment_types')
        .select('id, name')
        .limit(1)

      let establishmentTypeId = establishmentTypes?.[0]?.id

      if (!establishmentTypeId) {
        console.log('🔄 [ORG] Criando tipo de estabelecimento padrão...')
        
        const { data: newType, error: newTypeError } = await supabase
          .from('establishment_types')
          .insert({
            name: 'Estabelecimento Geral',
            icon_url: '/icons/default.png',
            emoji: '🏪'
          })
          .select()
          .single()

        if (newTypeError) {
          console.error('❌ [ORG] Erro ao criar tipo de estabelecimento:', newTypeError)
          throw new Error(`Erro ao criar tipo de estabelecimento: ${newTypeError.message}`)
        }

        establishmentTypeId = newType.id
      }

      // Criar organização padrão
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: 'Minha Empresa',
          address: 'Endereço da empresa',
          phone: '(31) 99999-9999',
          establishment_type_id: establishmentTypeId,
          latitude: -18.5122,
          longitude: -44.5550
        })
        .select()
        .single()

      if (orgError) {
        console.error('❌ [ORG] Erro ao criar organização:', orgError)
        throw new Error(`Erro ao criar organização: ${orgError.message}`)
      }

      // Vincular usuário à organização como admin
      const { error: userOrgError } = await supabase
        .from('user_organizations')
        .insert({
          user_id: user.id,
          organization_id: newOrg.id,
          role: 'admin'
        })

      if (userOrgError) {
        console.error('❌ [ORG] Erro ao vincular usuário:', userOrgError)
        await supabase.from('organizations').delete().eq('id', newOrg.id)
        throw new Error(`Erro ao vincular usuário à organização: ${userOrgError.message}`)
      }

      console.log('✅ [ORG] Organização criada:', newOrg.id)
      toast.success('Organização padrão criada com sucesso!')
      return newOrg.id

    } catch (error: any) {
      console.error('❌ [ORG] Erro no processo:', error)
      throw new Error(error.message || 'Erro ao criar organização padrão')
    }
  }

  const createNewDriver = async () => {
    // Validações básicas
    if (!user) {
      toast.error('Usuário não autenticado')
      return
    }

    if (!newDriverData.full_name.trim()) {
      toast.error('Nome completo é obrigatório')
      return
    }

    if (!newDriverData.email.trim()) {
      toast.error('E-mail é obrigatório')
      return
    }

    if (!newDriverData.password) {
      toast.error('Senha é obrigatória')
      return
    }

    // Validar apenas espaços na senha
    if (newDriverData.password.includes(' ')) {
      toast.error('A senha não pode conter espaços')
      return
    }

    setCreatingDriver(true)
    const loadingToast = toast.loading('Criando entregador...')

    try {
      console.log('🔄 [CREATE] === INICIANDO CRIAÇÃO DE ENTREGADOR ===')
      console.log('📝 [CREATE] Dados recebidos:', {
        name: newDriverData.full_name,
        email: newDriverData.email,
        phone: newDriverData.phone,
        passwordLength: newDriverData.password.length
      })

      // PASSO 1: Garantir organização
      console.log('🏢 [CREATE] PASSO 1: Garantindo organização...')
      const organizationId = await ensureUserHasOrganization()
      console.log('✅ [CREATE] Organização garantida:', organizationId)

      // PASSO 2: Criar usuário no Auth
      console.log('🚀 [CREATE] PASSO 2: Criando usuário no Supabase Auth...')
      
      const authPayload = {
        email: newDriverData.email.trim(),
        password: newDriverData.password,
        options: {
          data: {
            full_name: newDriverData.full_name.trim(),
            phone: newDriverData.phone.trim() || '',
            role: 'delivery_driver'
          },
          emailRedirectTo: undefined
        }
      }

      console.log('📤 [CREATE] Payload para Auth:', {
        email: authPayload.email,
        passwordLength: authPayload.password.length,
        metadata: authPayload.options.data
      })

      const { data: authData, error: authError } = await supabase.auth.signUp(authPayload)

      if (authError) {
        console.error('❌ [CREATE] Erro detalhado do Supabase Auth:', {
          message: authError.message,
          status: authError.status,
          name: authError.name
        })
        
        // Tratar erros específicos
        if (authError.message.includes('Email address')) {
          throw new Error('Formato de email inválido. Tente um email diferente.')
        }
        if (authError.message.includes('Password')) {
          throw new Error('Senha muito fraca. Tente uma senha mais forte.')
        }
        if (authError.message.includes('User already registered')) {
          throw new Error('Este email já está cadastrado. Use outro email.')
        }
        
        throw new Error(`Erro ao criar usuário: ${authError.message}`)
      }

      if (!authData || !authData.user) {
        console.error('❌ [CREATE] Resposta inválida do Auth:', authData)
        throw new Error('Falha na criação do usuário - resposta inválida')
      }

      const newUserId = authData.user.id
      console.log('✅ [CREATE] Usuário criado com sucesso! ID:', newUserId)

      // PASSO 3: Criar perfil
      console.log('👤 [CREATE] PASSO 3: Criando perfil do usuário...')
      
      // Aguardar um pouco para o trigger
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Verificar se perfil já existe
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .eq('id', newUserId)
        .single()

      if (!existingProfile) {
        console.log('🔄 [CREATE] Perfil não existe, criando manualmente...')
        
        const profilePayload = {
          id: newUserId,
          email: newDriverData.email.trim(),
          full_name: newDriverData.full_name.trim(),
          phone: newDriverData.phone.trim() || ''
        }

        console.log('📤 [CREATE] Payload para perfil:', profilePayload)

        const { error: profileError } = await supabase
          .from('profiles')
          .insert(profilePayload)

        if (profileError) {
          console.error('❌ [CREATE] Erro ao criar perfil:', profileError)
          throw new Error(`Erro ao criar perfil: ${profileError.message}`)
        }
        
        console.log('✅ [CREATE] Perfil criado manualmente')
      } else {
        console.log('✅ [CREATE] Perfil já existe (criado pelo trigger):', existingProfile)
      }

      // PASSO 4: Criar registro de entregador
      console.log('🚚 [CREATE] PASSO 4: Criando registro de entregador...')
      
      const driverPayload = {
        user_id: newUserId,
        organization_id: organizationId,
        is_online: false,
        total_today: 0
      }

      console.log('📤 [CREATE] Payload para entregador:', driverPayload)

      const { data: driverData, error: driverError } = await supabase
        .from('delivery_drivers')
        .insert(driverPayload)
        .select()
        .single()

      if (driverError) {
        console.error('❌ [CREATE] Erro ao criar registro de entregador:', driverError)
        throw new Error(`Erro ao criar registro de entregador: ${driverError.message}`)
      }

      console.log('✅ [CREATE] Registro de entregador criado:', driverData)

      // PASSO 5: Vincular à organização
      console.log('🔗 [CREATE] PASSO 5: Vinculando à organização...')
      
      const orgLinkPayload = {
        user_id: newUserId,
        organization_id: organizationId,
        role: 'delivery_driver' as const
      }

      console.log('📤 [CREATE] Payload para organização:', orgLinkPayload)

      const { error: orgError } = await supabase
        .from('user_organizations')
        .insert(orgLinkPayload)

      if (orgError) {
        console.error('❌ [CREATE] Erro ao vincular à organização:', orgError)
        throw new Error(`Erro ao vincular à organização: ${orgError.message}`)
      }

      console.log('✅ [CREATE] Entregador vinculado à organização')

      // PASSO 6: Adicionar à lista local
      console.log('📋 [CREATE] PASSO 6: Adicionando à lista local...')
      
      const newDriver: DeliveryDriver = {
        id: driverData.id,
        user_id: newUserId,
        is_online: false,
        total_today: 0,
        current_latitude: null,
        current_longitude: null,
        profiles: {
          full_name: newDriverData.full_name.trim(),
          phone: newDriverData.phone.trim() || '(31) 99999-0000',
          email: newDriverData.email.trim()
        }
      }

      setDrivers(prev => [newDriver, ...prev])
      console.log('✅ [CREATE] Entregador adicionado à lista local')

      // PASSO 7: Recarregar do servidor
      console.log('🔄 [CREATE] PASSO 7: Agendando recarregamento do servidor...')
      setTimeout(async () => {
        try {
          await loadDrivers()
          console.log('✅ [CREATE] Lista recarregada do servidor')
        } catch (error) {
          console.error('⚠️ [CREATE] Erro ao recarregar lista:', error)
        }
      }, 2000)

      // Finalizar
      toast.dismiss(loadingToast)
      toast.success('Entregador cadastrado com sucesso!')
      setShowNewDriverDialog(false)
      setNewDriverData({ full_name: '', email: '', phone: '', password: '' })

      console.log('🎉 [CREATE] === PROCESSO CONCLUÍDO COM SUCESSO ===')

    } catch (error: any) {
      console.error('❌ [CREATE] === ERRO NO PROCESSO ===')
      console.error('❌ [CREATE] Erro completo:', error)
      
      toast.dismiss(loadingToast)
      
      // Mensagem de erro mais amigável
      const errorMessage = error.message || 'Erro desconhecido ao criar entregador'
      toast.error(errorMessage)
      
      console.error('❌ [CREATE] Mensagem exibida ao usuário:', errorMessage)
      
    } finally {
      setCreatingDriver(false)
      console.log('🔄 [CREATE] Estado de criação resetado')
    }
  }

  const toggleDriverStatus = async (driverId: string, currentStatus: boolean) => {
    try {
      // Verificar se é um ID de exemplo
      if (driverId.startsWith('example-') || driverId.startsWith('fallback-')) {
        // Apenas atualizar localmente para IDs de exemplo
        setDrivers(prev => prev.map(driver => 
          driver.id === driverId 
            ? { ...driver, is_online: !currentStatus }
            : driver
        ))
        toast.success(`Entregador ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`)
        return
      }

      const { error } = await supabase
        .from('delivery_drivers')
        .update({ 
          is_online: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId)

      if (error) {
        console.error('❌ [TOGGLE] Erro ao alterar status:', error)
        throw error
      }

      setDrivers(prev => prev.map(driver => 
        driver.id === driverId 
          ? { ...driver, is_online: !currentStatus }
          : driver
      ))

      toast.success(`Entregador ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`)
    } catch (error) {
      console.error('❌ [TOGGLE] Erro ao alterar status do entregador:', error)
      toast.error('Erro ao alterar status do entregador')
    }
  }

  const deleteDriver = async (driverId: string, userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este entregador? Esta ação não pode ser desfeita.')) return

    // Verificar se é um ID de exemplo
    if (driverId.startsWith('example-') || driverId.startsWith('fallback-')) {
      setDrivers(prev => prev.filter(driver => driver.id !== driverId))
      toast.success('Entregador de exemplo removido!')
      return
    }

    const loadingToast = toast.loading('Excluindo entregador...')

    try {
      console.log(`🗑️ [DELETE] Iniciando exclusão: ${driverId}`)

      // Primeiro, remover da lista local para feedback imediato
      setDrivers(prev => prev.filter(driver => driver.id !== driverId))

      // Verificar se usuário tem permissão (é admin)
      const { data: userRole, error: roleError } = await supabase
        .from('user_organizations')
        .select('role, organization_id')
        .eq('user_id', user?.id)
        .single()

      if (roleError || !userRole || userRole.role !== 'admin') {
        throw new Error('Apenas administradores podem excluir entregadores')
      }

      // Deletar registro de entregador
      const { error: driverError, count: driverCount } = await supabase
        .from('delivery_drivers')
        .delete({ count: 'exact' })
        .eq('id', driverId)

      if (driverError) {
        console.error('❌ [DELETE] Erro ao deletar delivery_drivers:', driverError)
        throw new Error(`Erro ao deletar entregador: ${driverError.message}`)
      }

      if (driverCount === 0) {
        throw new Error('Entregador não encontrado ou sem permissão para deletar')
      }

      // Deletar vínculos com organizações
      const { error: orgError } = await supabase
        .from('user_organizations')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'delivery_driver')

      if (orgError) {
        console.error('⚠️ [DELETE] Erro ao deletar user_organizations:', orgError)
      }

      toast.dismiss(loadingToast)
      toast.success('Entregador excluído com sucesso!')
      
      console.log('✅ [DELETE] Exclusão concluída')

    } catch (error: any) {
      console.error('❌ [DELETE] Erro:', error)
      toast.dismiss(loadingToast)
      toast.error(error.message || 'Erro ao excluir entregador')
      
      // Recarregar lista em caso de erro
      await loadDrivers()
    }
  }

  const changePassword = async () => {
    if (!newPassword || !selectedDriverId) {
      toast.error('Digite a nova senha')
      return
    }

    try {
      toast.info('Funcionalidade de alteração de senha será implementada em breve.')
      setShowPasswordDialog(false)
      setNewPassword('')
      setSelectedDriverId('')
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      toast.error('Erro ao alterar senha')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg mb-4 animate-pulse">
            <Users className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Carregando entregadores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="rounded-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    Entregadores
                  </h1>
                  <p className="text-sm text-gray-600">Gerenciar entregadores</p>
                </div>
              </div>
            </div>
            
            <Dialog open={showNewDriverDialog} onOpenChange={setShowNewDriverDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white rounded-xl">
                  <Plus className="w-5 h-5 mr-2" />
                  Cadastrar Entregador
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Entregador</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do entregador para criar uma conta de acesso
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Nome Completo *</Label>
                    <Input
                      id="full_name"
                      value={newDriverData.full_name}
                      onChange={(e) => setNewDriverData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="João Silva"
                      className="rounded-xl"
                      disabled={creatingDriver}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newDriverData.email}
                      onChange={(e) => setNewDriverData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="joao@exemplo.com"
                      className="rounded-xl"
                      disabled={creatingDriver}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use um email válido
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={newDriverData.phone}
                      onChange={(e) => setNewDriverData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(31) 99999-9999"
                      className="rounded-xl"
                      disabled={creatingDriver}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Senha *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newDriverData.password}
                      onChange={(e) => setNewDriverData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Mínimo 6 caracteres (sem espaços)"
                      className="rounded-xl"
                      disabled={creatingDriver}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Mínimo 6 caracteres, sem espaços
                    </p>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowNewDriverDialog(false)}
                      className="flex-1 rounded-xl"
                      disabled={creatingDriver}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={createNewDriver}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white rounded-xl"
                      disabled={creatingDriver}
                    >
                      {creatingDriver ? '⏳ Criando...' : 'Cadastrar'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Entregadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {drivers.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Online Agora
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {drivers.filter(d => d.is_online).length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Receita Total Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                R$ {drivers.reduce((sum, driver) => sum + driver.total_today, 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Entregadores */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Lista de Entregadores
            </CardTitle>
            <CardDescription>
              Gerencie o status e acompanhe o desempenho dos entregadores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {drivers.map((driver) => (
                <div 
                  key={driver.id} 
                  className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {driver.profiles.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        driver.is_online ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {driver.profiles.full_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {driver.profiles.phone} • {driver.profiles.email}
                      </p>
                      {driver.current_latitude && driver.current_longitude && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>
                            {driver.current_latitude.toFixed(4)}, {driver.current_longitude.toFixed(4)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Hoje</p>
                      <p className="font-semibold text-green-600">
                        R$ {driver.total_today.toFixed(2)}
                      </p>
                    </div>

                    <Badge 
                      variant={driver.is_online ? 'default' : 'secondary'}
                      className="rounded-full"
                    >
                      {driver.is_online ? 'Online' : 'Offline'}
                    </Badge>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {driver.is_online ? 'Ativo' : 'Inativo'}
                      </span>
                      <Switch
                        checked={driver.is_online}
                        onCheckedChange={() => toggleDriverStatus(driver.id, driver.is_online)}
                      />
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDriverId(driver.id)
                          setShowPasswordDialog(true)
                        }}
                        className="rounded-xl"
                      >
                        <Key className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteDriver(driver.id, driver.user_id)}
                        className="rounded-xl text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {drivers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum entregador cadastrado
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Comece cadastrando seu primeiro entregador
                  </p>
                  <Button 
                    onClick={() => setShowNewDriverDialog(true)}
                    className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white rounded-xl"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Cadastrar Primeiro Entregador
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog para trocar senha */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Digite a nova senha para o entregador
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new_password">Nova Senha</Label>
              <Input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
                className="rounded-xl"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordDialog(false)
                  setNewPassword('')
                  setSelectedDriverId('')
                }}
                className="flex-1 rounded-xl"
              >
                Cancelar
              </Button>
              
              <Button
                onClick={changePassword}
                className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white rounded-xl"
              >
                Alterar Senha
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}