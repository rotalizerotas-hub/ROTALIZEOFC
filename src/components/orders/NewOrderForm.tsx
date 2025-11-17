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
  }, [user])

  // Carregar entregadores quando organização for selecionada
  useEffect(() => {
    const organizationId = form.watch('organization_id')
    if (organizationId) {
      loadDeliveryDrivers(organizationId)
    } else {
      setDeliveryDrivers([])
    }
  }, [form.watch('organization_id')])

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

  const loadDeliveryDrivers = async (organizationId: string) => {
    setLoadingDrivers(true)
    
    try {
      console.log('🚚 [NOVO PEDIDO] Carregando entregadores para organização:', organizationId)

      // USAR A MESMA LÓGICA DO DriversManagement
      // Primeiro buscar TODOS os entregadores
      console.log('📋 [NOVO PEDIDO] Buscando todos os entregadores...')
      const { data: allDriversData, error: allDriversError } = await supabase
        .from('delivery_drivers')
        .select('*')

      if (allDriversError) {
        console.error('❌ [NOVO PEDIDO] Erro ao buscar todos os entregadores:', allDriversError)
      } else {
        console.log('📊 [NOVO PEDIDO] Total de entregadores no sistema:', allDriversData?.length || 0)
      }

      // Buscar organizações do usuário para verificar permissões
      const { data: userOrgs, error: userOrgsError } = await supabase
        .from('user_organizations')
        .select('organization_id, role')
        .eq('user_id', user.id)

      if (userOrgsError) {
        console.error('❌ [NOVO PEDIDO] Erro ao buscar organizações do usuário:', userOrgsError)
      }

      const orgIds = userOrgs?.map(uo => uo.organization_id) || []
      console.log('🏢 [NOVO PEDIDO] Organizações do usuário:', orgIds)

      // Buscar entregadores da organização específica OU todos se não tiver filtro
      let driversData = []
      
      if (orgIds.includes(organizationId)) {
        console.log('🔍 [NOVO PEDIDO] Buscando entregadores da organização específica...')
        const { data: orgDriversData, error: orgDriversError } = await supabase
          .from('delivery_drivers')
          .select('*')
          .eq('organization_id', organizationId)

        if (orgDriversError) {
          console.error('❌ [NOVO PEDIDO] Erro ao buscar entregadores da organização:', orgDriversError)
          // Fallback para todos os entregadores
          driversData = allDriversData || []
        } else {
          driversData = orgDriversData || []
        }
      } else {
        console.log('⚠️ [NOVO PEDIDO] Organização não encontrada, usando todos os entregadores')
        driversData = allDriversData || []
      }

      console.log('📊 [NOVO PEDIDO] Entregadores encontrados:', driversData?.length || 0)
      console.log('📋 [NOVO PEDIDO] Dados dos entregadores:', driversData)

      if (!driversData || driversData.length === 0) {
        console.log('📭 [NOVO PEDIDO] Nenhum entregador encontrado, criando dados de exemplo...')
        
        // Usar os MESMOS entregadores de exemplo do DriversManagement
        const exampleDrivers: DeliveryDriver[] = [
          {
            id: 'example-1',
            user_id: 'example-user-1',
            is_online: true,
            total_today: 150.50,
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
            profiles: {
              full_name: 'Pedro Costa',
              phone: '(31) 99999-3333',
              email: 'pedro@exemplo.com'
            }
          }
        ]
        
        setDeliveryDrivers(exampleDrivers)
        console.log('✅ [NOVO PEDIDO] Entregadores de exemplo carregados:', exampleDrivers.length)
        return
      }

      // Buscar perfis dos entregadores
      console.log('👤 [NOVO PEDIDO] Buscando perfis dos entregadores...')
      const userIds = driversData.map(driver => driver.user_id)
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds)

      if (profilesError) {
        console.error('⚠️ [NOVO PEDIDO] Erro ao buscar perfis:', profilesError)
      }

      console.log('👤 [NOVO PEDIDO] Perfis encontrados:', profilesData?.length || 0)

      // Combinar dados usando a MESMA lógica do DriversManagement
      const processedDrivers = driversData.map((driver: any) => {
        const profile = profilesData?.find(p => p.id === driver.user_id)
        
        return {
          id: driver.id,
          user_id: driver.user_id,
          is_online: driver.is_online || false,
          total_today: driver.total_today || 0,
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

      console.log('✅ [NOVO PEDIDO] Entregadores processados:', processedDrivers.length)
      console.log('📋 [NOVO PEDIDO] Dados finais:', processedDrivers)
      
      setDeliveryDrivers(processedDrivers)

    } catch (error) {
      console.error('❌ [NOVO PEDIDO] Erro ao carregar entregadores:', error)
      toast.error('Erro ao carregar entregadores')
      
      // Fallback para entregadores de exemplo (MESMOS do DriversManagement)
      console.log('🔄 [NOVO PEDIDO] Carregando dados de exemplo como fallback...')
      const fallbackDrivers: DeliveryDriver[] = [
        {
          id: 'fallback-1',
          user_id: 'fallback-user-1',
          is_online: true,
          total_today: 125.00,
          profiles: {
            full_name: 'Entregador Ativo',
            phone: '(31) 99999-0001',
            email: 'ativo@exemplo.com'
          }
        },
        {
          id: 'fallback-2',
          user_id: 'fallback-user-2',
          is_online: true,
          total_today: 95.50,
          profiles: {
            full_name: 'Motoboy Disponível',
            phone: '(31) 99999-0002',
            email: 'motoboy@exemplo.com'
          }
        }
      ]
      setDeliveryDrivers(fallbackDrivers)
    } finally {
      setLoadingDrivers(false)
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

              {/* Entregador Responsável */}
              {form.watch('organization_id') && (
                <div className="space-y-2">
                  <Label htmlFor="delivery_driver_id" className="flex items-center gap-2">
                    <Bike className="w-4 h-4" />
                    Motoboy/Entregador Responsável (opcional)
                  </Label>
                  <Select 
                    value={form.watch('delivery_driver_id')} 
                    onValueChange={(value) => form.setValue('delivery_driver_id', value)}
                    disabled={loadingDrivers}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder={
                        loadingDrivers 
                          ? "🔄 Carregando motoboys..." 
                          : deliveryDrivers.length === 0 
                            ? "❌ Nenhum motoboy disponível"
                            : "🏍️ Selecione um motoboy (opcional)"
                      } />
                    </SelectTrigger>
                    <SelectContent className="w-full min-w-[400px] max-w-[600px]">
                      <SelectItem value="">
                        <div className="flex items-center gap-2 w-full">
                          <Package className="w-4 h-4 flex-shrink-0" />
                          <span className="whitespace-nowrap">⏰ Atribuir depois</span>
                        </div>
                      </SelectItem>
                      {deliveryDrivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          <div className="flex items-center gap-2 w-full min-w-0">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                              driver.is_online ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                            <Bike className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium truncate flex-1 min-w-0">
                              {driver.profiles.full_name}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                              driver.is_online 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {driver.is_online ? '🟢' : '🔴'}
                            </span>
                            <span className="text-xs text-green-600 font-medium flex-shrink-0">
                              R$ {driver.total_today.toFixed(2)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Informações dos entregadores */}
                  {deliveryDrivers.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded-xl">
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <Bike className="w-4 h-4" />
                        <span className="font-medium">
                          {deliveryDrivers.filter(d => d.is_online).length} motoboys online
                        </span>
                        <span>•</span>
                        <span>{deliveryDrivers.length} total cadastrados</span>
                      </div>
                      {deliveryDrivers.filter(d => d.is_online).length === 0 && (
                        <p className="text-xs text-orange-600 mt-1">
                          ⚠️ Nenhum motoboy online no momento. Pedido ficará pendente.
                        </p>
                      )}
                    </div>
                  )}

                  {loadingDrivers && (
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        <span>Carregando motoboys cadastrados...</span>
                      </div>
                    </div>
                  )}

                  {form.formState.errors.delivery_driver_id && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.delivery_driver_id.message}
                    </p>
                  )}
                </div>
              )}

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