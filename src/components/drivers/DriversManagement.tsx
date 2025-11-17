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
import { ArrowLeft, Users, Plus, MapPin, Trash2, Key } from 'lucide-react'
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
    if (user) {
      loadDrivers()
    }
  }, [user])

  const loadDrivers = async () => {
    if (!user) return

    try {
      console.log('🔄 [LOAD] Carregando entregadores para usuário:', user.id)

      // Buscar organizações do usuário
      const { data: userOrgs, error: userOrgsError } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)

      if (userOrgsError) {
        console.error('❌ [LOAD] Erro ao buscar organizações:', userOrgsError)
        setDrivers([])
        setLoading(false)
        return
      }

      const orgIds = userOrgs?.map(uo => uo.organization_id) || []
      console.log('🏢 [LOAD] Organizações encontradas:', orgIds)

      if (orgIds.length === 0) {
        console.log('📭 [LOAD] Usuário sem organizações')
        setDrivers([])
        setLoading(false)
        return
      }

      // Buscar entregadores das organizações
      const { data: driversData, error: driversError } = await supabase
        .from('delivery_drivers')
        .select(`
          id,
          user_id,
          is_online,
          total_today,
          current_latitude,
          current_longitude,
          created_at
        `)
        .in('organization_id', orgIds)
        .order('created_at', { ascending: false })

      if (driversError) {
        console.error('❌ [LOAD] Erro ao buscar entregadores:', driversError)
        setDrivers([])
        setLoading(false)
        return
      }

      console.log('🚚 [LOAD] Entregadores encontrados:', driversData?.length || 0)

      if (!driversData || driversData.length === 0) {
        setDrivers([])
        setLoading(false)
        return
      }

      // Buscar perfis dos entregadores
      const userIds = driversData.map(d => d.user_id).filter(Boolean)
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, phone, email')
        .in('id', userIds)

      if (profilesError) {
        console.error('❌ [LOAD] Erro ao buscar perfis:', profilesError)
      }

      console.log('👤 [LOAD] Perfis encontrados:', profilesData?.length || 0)
      console.log('👤 [LOAD] Dados dos perfis:', profilesData)

      // Combinar dados
      const processedDrivers: DeliveryDriver[] = driversData.map((driver: any) => {
        const profile = profilesData?.find(p => p.id === driver.user_id)
        console.log(`🔍 [LOAD] Processando driver ${driver.user_id}:`, profile)
        
        return {
          id: driver.id,
          user_id: driver.user_id,
          is_online: Boolean(driver.is_online),
          total_today: Number(driver.total_today) || 0,
          current_latitude: driver.current_latitude,
          current_longitude: driver.current_longitude,
          profiles: {
            full_name: profile?.full_name || `Entregador ${driver.id.slice(-4)}`,
            phone: profile?.phone || '(31) 99999-0000',
            email: profile?.email || 'entregador@exemplo.com'
          }
        }
      })

      console.log('✅ [LOAD] Entregadores processados:', processedDrivers.length)
      setDrivers(processedDrivers)

    } catch (error) {
      console.error('❌ [LOAD] Erro geral:', error)
      setDrivers([])
    } finally {
      setLoading(false)
    }
  }

  const createNewDriver = async () => {
    // Validações
    if (!newDriverData.full_name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    if (!newDriverData.email.trim()) {
      toast.error('Email é obrigatório')
      return
    }

    if (!newDriverData.password) {
      toast.error('Senha é obrigatória')
      return
    }

    if (newDriverData.password.includes(' ')) {
      toast.error('Senha não pode conter espaços')
      return
    }

    setCreatingDriver(true)
    const loadingToast = toast.loading('Criando entregador...')

    try {
      console.log('🚀 [CREATE] Iniciando criação...')
      
      // PASSO 1: Garantir organização
      let organizationId = await ensureOrganization()
      console.log('🏢 [CREATE] Organização ID:', organizationId)

      // PASSO 2: Criar usuário
      console.log('👤 [CREATE] Criando usuário...')
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newDriverData.email.trim(),
        password: newDriverData.password,
        options: {
          data: {
            full_name: newDriverData.full_name.trim(),
            phone: newDriverData.phone.trim()
          }
        }
      })

      if (authError) {
        console.error('❌ [CREATE] Erro Auth:', authError)
        throw new Error(`Erro ao criar usuário: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('Usuário não foi criado')
      }

      const newUserId = authData.user.id
      console.log('✅ [CREATE] Usuário criado:', newUserId)

      // PASSO 3: Criar perfil GARANTIDO
      console.log('📝 [CREATE] Criando perfil garantido...')
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Forçar criação do perfil
      const profileData = {
        id: newUserId,
        email: newDriverData.email.trim(),
        full_name: newDriverData.full_name.trim(),
        phone: newDriverData.phone.trim() || ''
      }

      console.log('📤 [CREATE] Dados do perfil:', profileData)

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })

      if (profileError && profileError.message) {
        console.error('⚠️ [CREATE] Erro perfil:', profileError.message)
        // Tentar inserção direta
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(profileData)
        
        if (insertError) {
          console.error('❌ [CREATE] Erro inserção direta:', insertError)
        } else {
          console.log('✅ [CREATE] Perfil criado por inserção direta')
        }
      } else {
        console.log('✅ [CREATE] Perfil criado por upsert')
      }

      // Verificar se perfil foi criado
      const { data: verifyProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', newUserId)
        .single()

      console.log('🔍 [CREATE] Verificação do perfil:', verifyProfile)

      // PASSO 4: Criar entregador
      console.log('🚚 [CREATE] Criando entregador...')
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
        console.error('❌ [CREATE] Erro entregador:', driverError)
        throw new Error(`Erro ao criar entregador: ${driverError.message}`)
      }

      console.log('✅ [CREATE] Entregador criado:', driverData.id)

      // PASSO 5: Vincular à organização
      console.log('🔗 [CREATE] Vinculando à organização...')
      const { error: orgError } = await supabase
        .from('user_organizations')
        .insert({
          user_id: newUserId,
          organization_id: organizationId,
          role: 'delivery_driver'
        })

      if (orgError) {
        console.error('❌ [CREATE] Erro organização:', orgError)
        throw new Error(`Erro ao vincular: ${orgError.message}`)
      }

      console.log('✅ [CREATE] Vinculado à organização')

      // PASSO 6: Adicionar à lista local com dados REAIS
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
      console.log('✅ [CREATE] Adicionado à lista local com dados reais')

      // PASSO 7: Recarregar do servidor para sincronizar
      setTimeout(async () => {
        await loadDrivers()
        console.log('✅ [CREATE] Lista recarregada do servidor')
      }, 2000)

      toast.dismiss(loadingToast)
      toast.success('Entregador criado com sucesso!')
      setShowNewDriverDialog(false)
      setNewDriverData({ full_name: '', email: '', phone: '', password: '' })

      console.log('🎉 [CREATE] Processo concluído!')

    } catch (error: any) {
      console.error('❌ [CREATE] Erro:', error)
      toast.dismiss(loadingToast)
      toast.error(error.message || 'Erro ao criar entregador')
    } finally {
      setCreatingDriver(false)
    }
  }

  const ensureOrganization = async (): Promise<string> => {
    if (!user) throw new Error('Usuário não autenticado')

    // Verificar se já tem organização
    const { data: userOrgs } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)

    if (userOrgs && userOrgs.length > 0) {
      return userOrgs[0].organization_id
    }

    // Criar organização
    console.log('🏢 [ORG] Criando organização...')

    // Buscar tipo de estabelecimento
    let { data: establishmentTypes } = await supabase
      .from('establishment_types')
      .select('id')
      .limit(1)

    let establishmentTypeId = establishmentTypes?.[0]?.id

    if (!establishmentTypeId) {
      const { data: newType } = await supabase
        .from('establishment_types')
        .insert({
          name: 'Restaurante',
          icon_url: '/icons/restaurant.png',
          emoji: '🍽️'
        })
        .select()
        .single()

      establishmentTypeId = newType?.id
    }

    // Criar organização
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
      throw new Error(`Erro ao criar organização: ${orgError.message}`)
    }

    // Vincular usuário
    await supabase
      .from('user_organizations')
      .insert({
        user_id: user.id,
        organization_id: newOrg.id,
        role: 'admin'
      })

    console.log('✅ [ORG] Organização criada:', newOrg.id)
    return newOrg.id
  }

  const toggleDriverStatus = async (driverId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('delivery_drivers')
        .update({ is_online: !currentStatus })
        .eq('id', driverId)

      if (error) throw error

      setDrivers(prev => prev.map(driver => 
        driver.id === driverId 
          ? { ...driver, is_online: !currentStatus }
          : driver
      ))

      toast.success(`Entregador ${!currentStatus ? 'ativado' : 'desativado'}`)
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status')
    }
  }

  const deleteDriver = async (driverId: string, userId: string) => {
    if (!confirm('Excluir este entregador?')) return

    try {
      // Remover da lista local primeiro
      setDrivers(prev => prev.filter(driver => driver.id !== driverId))

      // Deletar do banco
      await supabase.from('delivery_drivers').delete().eq('id', driverId)
      await supabase.from('user_organizations').delete().eq('user_id', userId).eq('role', 'delivery_driver')

      toast.success('Entregador excluído')
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir entregador')
      // Recarregar em caso de erro
      await loadDrivers()
    }
  }

  const changePassword = async () => {
    toast.info('Funcionalidade em desenvolvimento')
    setShowPasswordDialog(false)
    setNewPassword('')
    setSelectedDriverId('')
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
                  Novo Entregador
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Novo Entregador</DialogTitle>
                  <DialogDescription>
                    Criar conta de acesso para entregador
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
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newDriverData.email}
                      onChange={(e) => setNewDriverData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="joao@email.com"
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
                      placeholder="Senha sem espaços"
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
                      {creatingDriver ? 'Criando...' : 'Criar'}
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
                Total
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
                Online
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
                Receita Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                R$ {drivers.reduce((sum, driver) => sum + driver.total_today, 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Lista de Entregadores
            </CardTitle>
            <CardDescription>
              Gerencie entregadores e acompanhe status
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
                    Cadastre seu primeiro entregador
                  </p>
                  <Button 
                    onClick={() => setShowNewDriverDialog(true)}
                    className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white rounded-xl"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Primeiro Entregador
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog senha */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Nova senha para o entregador
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
                placeholder="Nova senha"
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
                Alterar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}