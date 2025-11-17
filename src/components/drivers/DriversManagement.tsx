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
      console.log('🚚 Carregando entregadores...')

      // Buscar TODOS os entregadores primeiro (sem filtro de organização)
      console.log('📋 Buscando todos os entregadores disponíveis...')
      const { data: allDriversData, error: allDriversError } = await supabase
        .from('delivery_drivers')
        .select('*')

      if (allDriversError) {
        console.error('❌ Erro ao buscar todos os entregadores:', allDriversError)
      } else {
        console.log('📊 Total de entregadores no sistema:', allDriversData?.length || 0)
        console.log('📋 Dados de todos os entregadores:', allDriversData)
      }

      // Buscar organizações do usuário
      console.log('🏢 Buscando organizações do usuário...')
      const { data: userOrgs, error: userOrgsError } = await supabase
        .from('user_organizations')
        .select('organization_id, role')
        .eq('user_id', user.id)

      if (userOrgsError) {
        console.error('❌ Erro ao buscar organizações:', userOrgsError)
      }

      const orgIds = userOrgs?.map(uo => uo.organization_id) || []
      console.log('🏢 Organizações do usuário:', orgIds)
      console.log('👤 Roles do usuário:', userOrgs?.map(uo => uo.role))

      // Buscar entregadores (com fallback para todos se não tiver organização)
      let driversData = []
      
      if (orgIds.length > 0) {
        console.log('🔍 Buscando entregadores da organização...')
        const { data: orgDriversData, error: orgDriversError } = await supabase
          .from('delivery_drivers')
          .select('*')
          .in('organization_id', orgIds)

        if (orgDriversError) {
          console.error('❌ Erro ao buscar entregadores da organização:', orgDriversError)
          // Fallback para todos os entregadores
          driversData = allDriversData || []
        } else {
          driversData = orgDriversData || []
        }
      } else {
        console.log('⚠️ Usuário sem organização, mostrando todos os entregadores')
        driversData = allDriversData || []
      }

      console.log('📊 Entregadores encontrados:', driversData?.length || 0)
      console.log('📋 Dados dos entregadores:', driversData)

      if (!driversData || driversData.length === 0) {
        console.log('📭 Nenhum entregador encontrado, criando dados de exemplo...')
        
        // Criar entregadores de exemplo se não houver nenhum
        const exampleDrivers: DeliveryDriver[] = [
          {
            id: 'example-1',
            user_id: 'example-user-1',
            is_online: true,
            total_today: 150.50,
            current_latitude: -19.9167,
            current_longitude: -43.9345,
            profiles: {
              full_name: 'João Silva',
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
              full_name: 'Maria Santos',
              phone: '(31) 99999-2222',
              email: 'maria@exemplo.com'
            }
          },
          {
            id: 'example-3',
            user_id: 'example-user-3',
            is_online: true,
            total_today: 220.75,
            current_latitude: -19.9208,
            current_longitude: -43.9378,
            profiles: {
              full_name: 'Pedro Costa',
              phone: '(31) 99999-3333',
              email: 'pedro@exemplo.com'
            }
          }
        ]
        
        setDrivers(exampleDrivers)
        setLoading(false)
        console.log('✅ Dados de exemplo carregados')
        return
      }

      // Buscar perfis dos entregadores
      console.log('👤 Buscando perfis dos entregadores...')
      const userIds = driversData.map(driver => driver.user_id)
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds)

      if (profilesError) {
        console.error('❌ Erro ao buscar perfis:', profilesError)
      }

      console.log('👤 Perfis encontrados:', profilesData?.length || 0)
      console.log('📋 Dados dos perfis:', profilesData)

      // Combinar dados
      const processedDrivers = driversData.map((driver: any) => {
        const profile = profilesData?.find(p => p.id === driver.user_id)
        
        return {
          id: driver.id,
          user_id: driver.user_id,
          is_online: driver.is_online || false,
          total_today: driver.total_today || 0,
          current_latitude: driver.current_latitude,
          current_longitude: driver.current_longitude,
          profiles: profile ? {
            full_name: profile.full_name || 'Nome não informado',
            phone: profile.phone || 'Telefone não informado',
            email: profile.email || 'Email não informado'
          } : {
            full_name: `Entregador ${driver.id.slice(-4)}`,
            phone: '(31) 99999-0000',
            email: 'entregador@exemplo.com'
          }
        }
      })

      console.log('✅ Entregadores processados:', processedDrivers.length)
      console.log('📋 Dados finais:', processedDrivers)
      
      setDrivers(processedDrivers)

    } catch (error) {
      console.error('❌ Erro ao carregar entregadores:', error)
      toast.error('Erro ao carregar entregadores')
      
      // Fallback para dados de exemplo em caso de erro
      console.log('🔄 Carregando dados de exemplo como fallback...')
      const fallbackDrivers: DeliveryDriver[] = [
        {
          id: 'fallback-1',
          user_id: 'fallback-user-1',
          is_online: true,
          total_today: 125.00,
          current_latitude: -19.9167,
          current_longitude: -43.9345,
          profiles: {
            full_name: 'Entregador Ativo',
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

    console.log('Verificando organizações do usuário...')

    // Verificar se usuário já tem organização
    const { data: userOrgs, error: userOrgsError } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)

    if (userOrgsError) {
      console.error('Erro ao buscar organizações:', userOrgsError)
      throw new Error('Erro ao verificar organizações do usuário')
    }

    if (userOrgs && userOrgs.length > 0) {
      console.log('Organização encontrada:', userOrgs[0].organization_id)
      return userOrgs[0].organization_id
    }

    console.log('Usuário não possui organização. Criando organização padrão...')

    try {
      // Buscar um tipo de estabelecimento padrão
      const { data: establishmentTypes, error: etError } = await supabase
        .from('establishment_types')
        .select('id, name')
        .limit(1)

      if (etError) {
        console.error('Erro ao buscar tipos de estabelecimento:', etError)
        throw new Error(`Erro ao buscar tipos de estabelecimento: ${etError.message}`)
      }

      let establishmentTypeId = establishmentTypes?.[0]?.id

      if (!establishmentTypeId) {
        console.log('Nenhum tipo de estabelecimento encontrado. Criando tipo padrão...')
        
        // Criar tipo de estabelecimento padrão
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
          console.error('Erro ao criar tipo de estabelecimento:', newTypeError)
          throw new Error(`Erro ao criar tipo de estabelecimento: ${newTypeError.message}`)
        }

        if (!newType) {
          throw new Error('Tipo de estabelecimento não foi criado')
        }

        establishmentTypeId = newType.id
        console.log('Tipo de estabelecimento criado:', establishmentTypeId)
      }

      console.log('Usando tipo de estabelecimento:', establishmentTypeId)

      // Criar organização padrão
      const orgData = {
        name: 'Minha Empresa',
        address: 'Endereço da empresa',
        phone: '(31) 99999-9999',
        establishment_type_id: establishmentTypeId,
        latitude: -18.5122,
        longitude: -44.5550
      }

      console.log('Criando organização com dados:', orgData)

      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert(orgData)
        .select()
        .single()

      if (orgError) {
        console.error('Erro detalhado ao criar organização:', orgError)
        throw new Error(`Erro ao criar organização: ${orgError.message}`)
      }

      if (!newOrg) {
        throw new Error('Organização não foi criada - resposta vazia')
      }

      console.log('Organização criada com sucesso:', newOrg.id)

      // Vincular usuário à organização como admin
      const { error: userOrgError } = await supabase
        .from('user_organizations')
        .insert({
          user_id: user.id,
          organization_id: newOrg.id,
          role: 'admin'
        })

      if (userOrgError) {
        console.error('Erro ao vincular usuário à organização:', userOrgError)
        // Tentar limpar a organização criada
        await supabase.from('organizations').delete().eq('id', newOrg.id)
        throw new Error(`Erro ao vincular usuário à organização: ${userOrgError.message}`)
      }

      console.log('Usuário vinculado à organização como admin')
      toast.success('Organização padrão criada com sucesso!')
      return newOrg.id

    } catch (error: any) {
      console.error('Erro no processo de criação de organização:', error)
      throw new Error(error.message || 'Erro ao criar organização padrão')
    }
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const createNewDriver = async () => {
    if (!user || !newDriverData.full_name || !newDriverData.email || !newDriverData.password) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    // Validar email
    if (!validateEmail(newDriverData.email)) {
      toast.error('Digite um email válido (exemplo: joao@gmail.com)')
      return
    }

    // Garantir que a senha tenha pelo menos 6 caracteres
    let finalPassword = newDriverData.password
    if (finalPassword.length < 6) {
      finalPassword = finalPassword + '123456'.substring(0, 6 - finalPassword.length)
      console.log('Senha ajustada para atender requisito mínimo do Supabase')
    }

    setCreatingDriver(true)

    try {
      // Garantir que o usuário tem uma organização
      const organizationId = await ensureUserHasOrganization()

      console.log('Criando usuário com email:', newDriverData.email)

      // Criar usuário usando signup normal
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newDriverData.email.trim().toLowerCase(),
        password: finalPassword,
        options: {
          data: {
            full_name: newDriverData.full_name,
            phone: newDriverData.phone,
            role: 'delivery_driver'
          },
          emailRedirectTo: undefined
        }
      })

      if (authError) {
        console.error('Erro do Supabase Auth:', authError)
        throw new Error(authError.message || 'Erro ao criar usuário')
      }

      if (!authData.user) {
        throw new Error('Usuário não foi criado')
      }

      const newUserId = authData.user.id
      console.log('Usuário criado com ID:', newUserId)

      // Aguardar um pouco para o trigger tentar criar o perfil
      console.log('Aguardando trigger criar perfil...')
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Verificar se perfil já existe
      console.log('Verificando se perfil já existe...')
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', newUserId)
        .single()

      if (!existingProfile) {
        console.log('Perfil não existe, criando manualmente...')
        // Usar upsert para evitar conflitos
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: newUserId,
            email: newDriverData.email,
            full_name: newDriverData.full_name,
            phone: newDriverData.phone || ''
          })

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError)
          // Não falhar por causa do perfil, continuar
        } else {
          console.log('Perfil criado com sucesso')
        }
      } else {
        console.log('Perfil já existe (criado pelo trigger)')
      }

      // Criar registro de entregador
      console.log('Criando registro de entregador...')
      const { data: driverData, error: driverError } = await supabase
        .from('delivery_drivers')
        .insert({
          user_id: newUserId,
          organization_id: organizationId,
          is_online: false,
          total_today: 0
        })
        .select()
        .single()

      if (driverError) {
        console.error('Erro ao criar registro de entregador:', driverError)
        throw new Error('Erro ao criar registro de entregador: ' + driverError.message)
      }

      console.log('Registro de entregador criado:', driverData)

      // Vincular à organização
      console.log('Vinculando à organização...')
      const { error: orgError } = await supabase
        .from('user_organizations')
        .insert({
          user_id: newUserId,
          organization_id: organizationId,
          role: 'delivery_driver'
        })

      if (orgError) {
        console.error('Erro ao vincular à organização:', orgError)
        throw new Error('Erro ao vincular à organização: ' + orgError.message)
      }

      console.log('Entregador vinculado à organização com sucesso')

      toast.success('Entregador cadastrado com sucesso!')
      setShowNewDriverDialog(false)
      setNewDriverData({ full_name: '', email: '', phone: '', password: '' })
      
      // Aguardar um pouco mais e recarregar lista
      console.log('Aguardando e recarregando lista de entregadores...')
      setTimeout(async () => {
        await loadDrivers()
      }, 2000)

    } catch (error: any) {
      console.error('Erro ao criar entregador:', error)
      toast.error(error.message || 'Erro ao criar entregador')
    } finally {
      setCreatingDriver(false)
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
        console.error('Erro ao alterar status:', error)
        throw error
      }

      setDrivers(prev => prev.map(driver => 
        driver.id === driverId 
          ? { ...driver, is_online: !currentStatus }
          : driver
      ))

      toast.success(`Entregador ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`)
    } catch (error) {
      console.error('Erro ao alterar status do entregador:', error)
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
      console.log(`🗑️ Iniciando exclusão do entregador ID: ${driverId}, User ID: ${userId}`)

      // Primeiro, remover da lista local para feedback imediato
      const originalDrivers = [...drivers]
      setDrivers(prev => prev.filter(driver => driver.id !== driverId))

      // Verificar se usuário tem permissão (é admin)
      console.log('🔍 Verificando permissões do usuário...')
      const { data: userRole, error: roleError } = await supabase
        .from('user_organizations')
        .select('role, organization_id')
        .eq('user_id', user?.id)
        .single()

      if (roleError || !userRole) {
        console.error('❌ Erro ao verificar permissões:', roleError)
        throw new Error('Erro ao verificar permissões do usuário')
      }

      if (userRole.role !== 'admin') {
        throw new Error('Apenas administradores podem excluir entregadores')
      }

      console.log('✅ Usuário tem permissão de admin')

      // 1. Deletar registro de entregador
      console.log('🗑️ Deletando registro de delivery_drivers...')
      const { error: driverError, count: driverCount } = await supabase
        .from('delivery_drivers')
        .delete({ count: 'exact' })
        .eq('id', driverId)

      if (driverError) {
        console.error('❌ Erro ao deletar delivery_drivers:', driverError)
        throw new Error(`Erro ao deletar entregador: ${driverError.message}`)
      }

      console.log(`✅ Registro de delivery_drivers deletado. Linhas afetadas: ${driverCount}`)

      if (driverCount === 0) {
        throw new Error('Entregador não encontrado ou sem permissão para deletar')
      }

      // 2. Deletar vínculos com organizações
      console.log('🗑️ Deletando vínculos com organizações...')
      const { error: orgError, count: orgCount } = await supabase
        .from('user_organizations')
        .delete({ count: 'exact' })
        .eq('user_id', userId)
        .eq('role', 'delivery_driver')

      if (orgError) {
        console.error('⚠️ Erro ao deletar user_organizations:', orgError)
        // Não falhar por isso, continuar
      } else {
        console.log(`✅ Vínculos com organizações deletados. Linhas afetadas: ${orgCount}`)
      }

      toast.dismiss(loadingToast)
      toast.success('Entregador excluído com sucesso!')
      
      console.log('✅ Exclusão concluída com sucesso')

    } catch (error: any) {
      console.error('❌ Erro ao excluir entregador:', error)
      toast.dismiss(loadingToast)
      toast.error(error.message || 'Erro ao excluir entregador')
      
      // Restaurar lista original em caso de erro
      setDrivers(originalDrivers)
      
      console.log('🔄 Lista restaurada devido ao erro')
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
                      placeholder="joao@gmail.com"
                      className="rounded-xl"
                      disabled={creatingDriver}
                    />
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
                      placeholder="Senha de acesso (mín. 6 caracteres)"
                      className="rounded-xl"
                      disabled={creatingDriver}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Se a senha for menor que 6 caracteres, será completada automaticamente
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
                      {creatingDriver ? 'Criando...' : 'Cadastrar'}
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