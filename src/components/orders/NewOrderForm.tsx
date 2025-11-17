'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Package, User, MapPin, Bike } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const orderSchema = z.object({
  customer_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  customer_phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  delivery_address: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
  value: z.number().min(0.01, 'Valor deve ser maior que zero'),
  notes: z.string().optional(),
  organization_id: z.string().min(1, 'Selecione uma organização'),
  delivery_driver_id: z.string().optional(),
})

type OrderFormData = z.infer<typeof orderSchema>

interface Organization {
  id: string
  name: string
  establishment_type: {
    name: string
    emoji: string
  }
}

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
}

export function NewOrderForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [deliveryDrivers, setDeliveryDrivers] = useState<DeliveryDriver[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingDrivers, setLoadingDrivers] = useState(false)

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer_name: '',
      customer_phone: '',
      delivery_address: '',
      value: 0,
      notes: '',
      organization_id: '',
      delivery_driver_id: '',
    },
  })

  useEffect(() => {
    loadOrganizations()
    loadDeliveryDrivers()
  }, [user])

  const loadOrganizations = async () => {
    if (!user) return

    try {
      console.log('🏢 [NOVO PEDIDO] Carregando organizações...')
      
      const { data } = await supabase
        .from('user_organizations')
        .select(`
          organization_id,
          organizations (
            id,
            name,
            establishment_types (
              name,
              emoji
            )
          )
        `)
        .eq('user_id', user.id)

      const orgs = data?.map((uo: any) => ({
        id: uo.organizations.id,
        name: uo.organizations.name,
        establishment_type: uo.organizations.establishment_types || {
          name: 'Estabelecimento',
          emoji: '🏪'
        }
      })) || []

      console.log('✅ [NOVO PEDIDO] Organizações carregadas:', orgs.length)
      setOrganizations(orgs)

      // Se só tem uma organização, selecionar automaticamente
      if (orgs.length === 1) {
        form.setValue('organization_id', orgs[0].id)
      }
    } catch (error) {
      console.error('❌ [NOVO PEDIDO] Erro ao carregar organizações:', error)
      toast.error('Erro ao carregar organizações')
    }
  }

  const loadDeliveryDrivers = async () => {
    if (!user) return

    setLoadingDrivers(true)
    
    try {
      console.log('🚚 [ENTREGADORES] Iniciando carregamento de entregadores...')

      // PASSO 1: Buscar organizações do usuário
      const { data: userOrgs, error: userOrgsError } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)

      if (userOrgsError) {
        console.error('❌ [ENTREGADORES] Erro ao buscar organizações:', userOrgsError)
        setDeliveryDrivers([])
        return
      }

      const orgIds = userOrgs?.map(uo => uo.organization_id) || []
      console.log('🏢 [ENTREGADORES] Organizações encontradas:', orgIds)

      if (orgIds.length === 0) {
        console.log('📭 [ENTREGADORES] Usuário sem organizações')
        setDeliveryDrivers([])
        return
      }

      // PASSO 2: Buscar entregadores das organizações
      const { data: driversData, error: driversError } = await supabase
        .from('delivery_drivers')
        .select(`
          id,
          user_id,
          is_online,
          total_today,
          organization_id
        `)
        .in('organization_id', orgIds)
        .order('is_online', { ascending: false }) // Online primeiro

      console.log('📊 [ENTREGADORES] Resultado da query:')
      console.log('   - Erro:', driversError)
      console.log('   - Dados:', driversData)
      console.log('   - Quantidade:', driversData?.length || 0)

      if (driversError) {
        console.error('❌ [ENTREGADORES] Erro na query de entregadores:', driversError)
        setDeliveryDrivers([])
        return
      }

      if (!driversData || driversData.length === 0) {
        console.log('📭 [ENTREGADORES] Nenhum entregador encontrado no banco')
        setDeliveryDrivers([])
        return
      }

      console.log('📋 [ENTREGADORES] Entregadores encontrados no banco:', driversData.length)

      // PASSO 3: Buscar perfis dos entregadores
      const userIds = driversData.map(driver => driver.user_id).filter(Boolean)
      console.log('👤 [ENTREGADORES] Buscando perfis para user_ids:', userIds)

      if (userIds.length === 0) {
        console.log('⚠️ [ENTREGADORES] Nenhum user_id válido encontrado')
        setDeliveryDrivers([])
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

      console.log('👤 [ENTREGADORES] Resultado dos perfis:')
      console.log('   - Erro:', profilesError)
      console.log('   - Perfis encontrados:', profilesData?.length || 0)
      console.log('   - Dados dos perfis:', profilesData)

      if (profilesError) {
        console.error('⚠️ [ENTREGADORES] Erro ao buscar perfis:', profilesError)
      }

      // PASSO 4: Combinar dados de entregadores com perfis
      const processedDrivers: DeliveryDriver[] = driversData.map((driver: any) => {
        const profile = profilesData?.find(p => p.id === driver.user_id)
        
        const driverData = {
          id: driver.id,
          user_id: driver.user_id,
          is_online: Boolean(driver.is_online),
          total_today: Number(driver.total_today) || 0,
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

        console.log(`👤 [ENTREGADORES] Processado: ${driverData.profiles.full_name} (${driverData.is_online ? 'Online' : 'Offline'})`)
        return driverData
      })

      console.log('✅ [ENTREGADORES] Total processados:', processedDrivers.length)
      console.log('🟢 [ENTREGADORES] Online:', processedDrivers.filter(d => d.is_online).length)
      console.log('🔴 [ENTREGADORES] Offline:', processedDrivers.filter(d => !d.is_online).length)

      setDeliveryDrivers(processedDrivers)

    } catch (error) {
      console.error('❌ [ENTREGADORES] Erro geral:', error)
      setDeliveryDrivers([])
      
    } finally {
      setLoadingDrivers(false)
      console.log('🏁 [ENTREGADORES] Carregamento finalizado')
    }
  }

  const onSubmit = async (data: OrderFormData) => {
    setLoading(true)
    
    try {
      console.log('📦 [NOVO PEDIDO] Criando pedido com dados:', data)

      // Simular geocodificação do endereço (em produção, usar API de geocoding)
      const delivery_latitude = -18.5122 + (Math.random() - 0.5) * 0.1
      const delivery_longitude = -44.5550 + (Math.random() - 0.5) * 0.1

      const orderData = {
        ...data,
        delivery_latitude,
        delivery_longitude,
        status: 'pending' as const,
        delivery_driver_id: data.delivery_driver_id || null
      }

      console.log('📦 [NOVO PEDIDO] Dados do pedido para inserção:', orderData)

      const { data: order, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (error) {
        console.error('❌ [NOVO PEDIDO] Erro ao criar pedido:', error)
        throw error
      }

      console.log('✅ [NOVO PEDIDO] Pedido criado:', order)

      // Criar evento de criação do pedido
      await supabase
        .from('order_events')
        .insert({
          order_id: order.id,
          event_type: 'created',
          description: `Pedido criado para ${data.customer_name}${data.delivery_driver_id ? ' e atribuído a entregador' : ''}`
        })

      // Se foi atribuído a um entregador, criar evento de atribuição
      if (data.delivery_driver_id) {
        await supabase
          .from('order_events')
          .insert({
            order_id: order.id,
            event_type: 'assigned',
            description: 'Pedido atribuído ao entregador'
          })

        // Atualizar status do pedido para 'assigned'
        await supabase
          .from('orders')
          .update({ status: 'assigned' })
          .eq('id', order.id)

        console.log('✅ [NOVO PEDIDO] Pedido atribuído ao entregador:', data.delivery_driver_id)
      }

      toast.success('Pedido criado com sucesso!')
      router.push('/')
    } catch (error) {
      console.error('❌ [NOVO PEDIDO] Erro ao criar pedido:', error)
      toast.error('Erro ao criar pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
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
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Novo Pedido
                </h1>
                <p className="text-sm text-gray-600">Criar um novo pedido de entrega</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Informações do Pedido
            </CardTitle>
            <CardDescription>
              Preencha os dados do cliente e da entrega
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Organização */}
              <div className="space-y-2">
                <Label htmlFor="organization_id">Organização</Label>
                <Select 
                  value={form.watch('organization_id')} 
                  onValueChange={(value) => form.setValue('organization_id', value)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecione a organização" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        <div className="flex items-center gap-2">
                          <span>{org.establishment_type.emoji}</span>
                          <span>{org.name}</span>
                          <span className="text-sm text-gray-500">
                            ({org.establishment_type.name})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.organization_id && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.organization_id.message}
                  </p>
                )}
              </div>

              {/* SEÇÃO ENTREGADOR RESPONSÁVEL - CORRIGIDA */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-medium">
                  <Bike className="w-5 h-5 text-blue-600" />
                  Entregador Responsável
                  <span className="text-sm text-gray-500 font-normal">(opcional)</span>
                </Label>
                
                {/* Select de Entregadores */}
                <Select 
                  value={form.watch('delivery_driver_id') || ''} 
                  onValueChange={(value) => form.setValue('delivery_driver_id', value)}
                  disabled={loadingDrivers}
                >
                  <SelectTrigger className="rounded-xl h-12 border-2 border-gray-200 hover:border-blue-300 transition-colors">
                    <SelectValue placeholder={
                      loadingDrivers 
                        ? "🔄 Carregando entregadores..." 
                        : deliveryDrivers.length === 0 
                          ? "❌ Nenhum entregador disponível"
                          : "🏍️ Escolha um entregador ou deixe em branco"
                    } />
                  </SelectTrigger>
                  <SelectContent className="w-full min-w-[500px] max-w-[700px] max-h-[300px]">
                    {/* Opção para não atribuir */}
                    <SelectItem value="" className="py-3">
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-700">⏰ Atribuir depois</div>
                          <div className="text-sm text-gray-500">Pedido ficará pendente para atribuição</div>
                        </div>
                      </div>
                    </SelectItem>
                    
                    {/* Lista de Entregadores REAIS */}
                    {deliveryDrivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id} className="py-3">
                        <div className="flex items-center gap-3 w-full">
                          {/* Avatar e Status */}
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {driver.profiles.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                              driver.is_online ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                          </div>
                          
                          {/* Informações do Entregador */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 truncate">
                                {driver.profiles.full_name}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                driver.is_online 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {driver.is_online ? '🟢 Online' : '🔴 Offline'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {driver.profiles.phone} • Hoje: R$ {driver.total_today.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Informações dos Entregadores */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bike className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-blue-900">
                          {deliveryDrivers.length} entregadores cadastrados
                        </div>
                        <div className="text-sm text-blue-700">
                          {deliveryDrivers.filter(d => d.is_online).length} online agora
                        </div>
                      </div>
                    </div>
                    
                    {loadingDrivers && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        <span className="text-sm">Carregando...</span>
                      </div>
                    )}
                  </div>
                  
                  {deliveryDrivers.length > 0 && deliveryDrivers.filter(d => d.is_online).length === 0 && (
                    <div className="mt-3 p-3 bg-orange-100 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 text-orange-700">
                        <span className="text-lg">⚠️</span>
                        <span className="text-sm font-medium">
                          Nenhum entregador online no momento. O pedido ficará pendente até ser atribuído.
                        </span>
                      </div>
                    </div>
                  )}

                  {deliveryDrivers.length === 0 && !loadingDrivers && (
                    <div className="mt-3 p-3 bg-red-100 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2 text-red-700">
                        <span className="text-lg">❌</span>
                        <span className="text-sm font-medium">
                          Nenhum entregador cadastrado. Cadastre entregadores primeiro na seção "Entregadores".
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {form.formState.errors.delivery_driver_id && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span>❌</span>
                    {form.formState.errors.delivery_driver_id.message}
                  </p>
                )}
              </div>

              {/* Dados do Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Nome do Cliente</Label>
                  <Input
                    id="customer_name"
                    {...form.register('customer_name')}
                    placeholder="João Silva"
                    className="rounded-xl"
                  />
                  {form.formState.errors.customer_name && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.customer_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_phone">Telefone</Label>
                  <Input
                    id="customer_phone"
                    {...form.register('customer_phone')}
                    placeholder="(31) 99999-9999"
                    className="rounded-xl"
                  />
                  {form.formState.errors.customer_phone && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.customer_phone.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Endereço de Entrega */}
              <div className="space-y-2">
                <Label htmlFor="delivery_address">Endereço de Entrega</Label>
                <Input
                  id="delivery_address"
                  {...form.register('delivery_address')}
                  placeholder="Rua das Flores, 123 - Centro"
                  className="rounded-xl"
                />
                {form.formState.errors.delivery_address && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.delivery_address.message}
                  </p>
                )}
              </div>

              {/* Valor */}
              <div className="space-y-2">
                <Label htmlFor="value">Valor (R$)</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  {...form.register('value', { valueAsNumber: true })}
                  placeholder="25.90"
                  className="rounded-xl"
                />
                {form.formState.errors.value && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.value.message}
                  </p>
                )}
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  {...form.register('notes')}
                  placeholder="Informações adicionais sobre o pedido..."
                  className="rounded-xl"
                  rows={3}
                />
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1 rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white rounded-xl"
                >
                  {loading ? 'Criando...' : 'Criar Pedido'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}