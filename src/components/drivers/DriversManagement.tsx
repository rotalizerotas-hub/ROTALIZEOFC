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
      // Buscar organizações do usuário
      const { data: userOrgs } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)

      const orgIds = userOrgs?.map(uo => uo.organization_id) || []

      if (orgIds.length === 0) {
        setDrivers([])
        setLoading(false)
        return
      }

      // Buscar entregadores das organizações
      const { data } = await supabase
        .from('delivery_drivers')
        .select(`
          *,
          profiles (
            full_name,
            phone,
            email
          )
        `)
        .in('organization_id', orgIds)

      const driversData = data?.map((driver: any) => ({
        id: driver.id,
        user_id: driver.user_id,
        is_online: driver.is_online,
        total_today: driver.total_today,
        current_latitude: driver.current_latitude,
        current_longitude: driver.current_longitude,
        profiles: driver.profiles || {
          full_name: 'Nome não informado',
          phone: 'Telefone não informado',
          email: 'Email não informado'
        }
      })) || []

      setDrivers(driversData)
    } catch (error) {
      console.error('Erro ao carregar entregadores:', error)
      toast.error('Erro ao carregar entregadores')
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
      console.error('Erro ao buscar organizações do usuário:', userOrgsError)
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
        throw new Error('Erro ao buscar tipos de estabelecimento')
      }

      if (!establishmentTypes || establishmentTypes.length === 0) {
        console.log('Nenhum tipo de estabelecimento encontrado. Criando tipo padrão...')
        
        // Criar tipo de estabelecimento padrão
        const { data: newEstablishmentType, error: newEtError } = await supabase
          .from('establishment_types')
          .insert({
            name: 'Estabelecimento Geral',
            icon_url: '/icons/default.png',
            emoji: '🏪'
          })
          .select()
          .single()

        if (newEtError || !newEstablishmentType) {
          console.error('Erro ao criar tipo de estabelecimento:', newEtError)
          throw new Error('Erro ao criar tipo de estabelecimento padrão')
        }

        establishmentTypes.push(newEstablishmentType)
      }

      const defaultEstablishmentTypeId = establishmentTypes[0].id
      console.log('Usando tipo de estabelecimento:', defaultEstablishmentTypeId)

      // Criar organização padrão
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: 'Minha Empresa',
          address: 'Rua Principal, 123 - Centro',
          phone: '(31) 99999-9999',
          establishment_type_id: defaultEstablishmentTypeId,
          latitude: -18.5122,
          longitude: -44.5550
        })
        .select()
        .single()

      if (orgError) {
        console.error('Erro detalhado ao criar organização:', orgError)
        throw new Error(`Erro ao criar organização: ${orgError.message || 'Erro desconhecido'}`)
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

  const createNewDriver = async () => {
    if (!user || !newDriverData.full_name || !newDriverData.email || !newDriverData.password) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setCreatingDriver(true)

    try {
      console.log('=== INICIANDO CRIAÇÃO DE ENTREGADOR ===')

      // Garantir que o usuário tem uma organização
      const organizationId = await ensureUserHasOrganization()
      console.log('Organização confirmada:', organizationId)

      // Criar usuário diretamente (sem edge function por enquanto)
      console.log('Criando entregador com dados:', {
        name: newDriverData.full_name,
        email: newDriverData.email,
        phone: newDriverData.phone
      })

      // Simular criação bem-sucedida por enquanto
      // TODO: Implementar criação real quando edge functions estiverem funcionando
      
      toast.success('Sistema configurado! Organização criada com sucesso.')
      toast.info('Funcionalidade de criação de entregadores será ativada em breve.')
      
      setShowNewDriverDialog(false)
      setNewDriverData({ full_name: '', email: '', phone: '', password: '' })

    } catch (error: any) {
      console.error('=== ERRO NA CRIAÇÃO DO ENTREGADOR ===')
      console.error('Erro completo:', error)
      toast.error(error.message || 'Erro desconhecido ao criar entregador')
    } finally {
      setCreatingDriver(false)
    }
  }

  const toggleDriverStatus = async (driverId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('delivery_drivers')
        .update({ 
          is_online: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId)

      if (error) throw error

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
    if (!confirm('Tem certeza que deseja excluir este entregador?')) return

    try {
      toast.info('Funcionalidade de exclusão será ativada em breve.')
    } catch (error) {
      console.error('Erro ao excluir entregador:', error)
      toast.error('Erro ao excluir entregador')
    }
  }

  const changePassword = async () => {
    if (!newPassword || !selectedDriverId) {
      toast.error('Digite a nova senha')
      return
    }

    try {
      toast.info('Funcionalidade de alteração de senha será ativada em breve.')
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
                  Configurar Sistema
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Configurar Sistema</DialogTitle>
                  <DialogDescription>
                    Configure sua organização para começar a gerenciar entregadores
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Nome do Responsável *</Label>
                    <Input
                      id="full_name"
                      value={newDriverData.full_name}
                      onChange={(e) => setNewDriverData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Seu nome completo"
                      className="rounded-xl"
                      disabled={creatingDriver}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail de Contato *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newDriverData.email}
                      onChange={(e) => setNewDriverData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contato@empresa.com"
                      className="rounded-xl"
                      disabled={creatingDriver}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone da Empresa</Label>
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
                    <Label htmlFor="password">Senha Temporária *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newDriverData.password}
                      onChange={(e) => setNewDriverData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Senha para configuração"
                      className="rounded-xl"
                      disabled={creatingDriver}
                    />
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
                      {creatingDriver ? 'Configurando...' : 'Configurar'}
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
              Configure sua organização para começar a gerenciar entregadores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {drivers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sistema não configurado
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Configure sua organização para começar a gerenciar entregadores
                  </p>
                  <Button 
                    onClick={() => setShowNewDriverDialog(true)}
                    className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white rounded-xl"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Configurar Sistema
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