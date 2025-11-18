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
import { DeliveryDriverSelector } from './DeliveryDriverSelector'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const orderSchema = z.object({
  customer_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  customer_phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  delivery_address: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
  value: z.number().min(0.01, 'Valor deve ser maior que zero'),
  notes: z.string().optional(),
  organization_id: z.string().min(1, 'Selecione uma organização'),
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

export function NewOrderForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)
  const [isAutomaticAssignment, setIsAutomaticAssignment] = useState(true)

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer_name: '',
      customer_phone: '',
      delivery_address: '',
      value: 0,
      notes: '',
      organization_id: '',
    },
  })

  useEffect(() => {
    loadOrganizations()
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

  const handleDriverSelection = (driverId: string | null, isAutomatic: boolean) => {
    setSelectedDriverId(driverId)
    setIsAutomaticAssignment(isAutomatic)
    
    console.log('🚚 [DRIVER SELECTION] Entregador selecionado:', {
      driverId,
      isAutomatic,
      mode: isAutomatic ? 'Automático (Robin Round)' : 'Manual'
    })
  }

  const onSubmit = async (data: OrderFormData) => {
    setLoading(true)
    
    try {
      console.log('📦 [NOVO PEDIDO] Criando pedido...')
      console.log('📋 [NOVO PEDIDO] Dados do formulário:', data)
      console.log('🚚 [NOVO PEDIDO] Entregador:', {
        id: selectedDriverId,
        automatic: isAutomaticAssignment
      })

      // Simular geocodificação do endereço
      const delivery_latitude = -18.5122 + (Math.random() - 0.5) * 0.1
      const delivery_longitude = -44.5550 + (Math.random() - 0.5) * 0.1

      const orderData = {
        ...data,
        delivery_latitude,
        delivery_longitude,
        status: selectedDriverId ? 'assigned' : 'pending',
        delivery_driver_id: selectedDriverId
      }

      console.log('📦 [NOVO PEDIDO] Dados finais para inserção:', orderData)

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

      // Criar evento de criação
      await supabase
        .from('order_events')
        .insert({
          order_id: order.id,
          event_type: 'created',
          description: `Pedido criado para ${data.customer_name}${
            isAutomaticAssignment 
              ? ' (atribuição automática)' 
              : selectedDriverId 
                ? ' (atribuição manual)' 
                : ' (sem atribuição)'
          }`
        })

      // Se foi atribuído, criar evento de atribuição
      if (selectedDriverId) {
        await supabase
          .from('order_events')
          .insert({
            order_id: order.id,
            event_type: 'assigned',
            description: `Pedido atribuído ${isAutomaticAssignment ? 'automaticamente' : 'manualmente'} ao entregador`
          })

        console.log('✅ [NOVO PEDIDO] Eventos criados para atribuição')
      }

      toast.success(
        selectedDriverId 
          ? `Pedido criado e ${isAutomaticAssignment ? 'atribuído automaticamente' : 'atribuído manualmente'}!`
          : 'Pedido criado! Ficará pendente para atribuição.'
      )
      
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

              {/* NOVO COMPONENTE DE SELEÇÃO DE ENTREGADOR */}
              <DeliveryDriverSelector
                onDriverSelect={handleDriverSelection}
                selectedDriverId={selectedDriverId || undefined}
                disabled={loading}
              />

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