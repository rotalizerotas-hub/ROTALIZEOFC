'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ActiveDriverSelector } from './ActiveDriverSelector'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, FileText, Search, Home, Package, Plus, Minus, UserPlus, Hash, DollarSign } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const orderSchema = z.object({
  establishment_type_id: z.string().min(1, 'Selecione uma categoria'),
  address_street: z.string().min(2, 'Rua é obrigatória'),
  address_number: z.string().min(1, 'Número é obrigatório'),
  address_neighborhood: z.string().min(2, 'Bairro é obrigatório'),
  address_city: z.string().min(2, 'Cidade é obrigatória'),
  customer_name: z.string().min(2, 'Nome do cliente é obrigatório'),
  customer_id: z.string().optional(),
  order_number: z.string().optional(), // NOVO CAMPO OPCIONAL
})

type OrderFormData = z.infer<typeof orderSchema>

interface EstablishmentType {
  id: string
  name: string
  emoji: string
  icon_url: string
}

interface Customer {
  id: string
  full_name: string
  phone: string
  address_street: string
  address_number: string
  address_neighborhood: string
  address_city: string
}

interface Product {
  id: string
  name: string
  price: number
}

interface OrderItem {
  id: string
  product_id?: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

export function ManualOrderForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)
  
  // Estados para dados
  const [establishmentTypes, setEstablishmentTypes] = useState<EstablishmentType[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  
  // Estados para novos itens
  const [newProductName, setNewProductName] = useState('')
  const [newProductPrice, setNewProductPrice] = useState(0)
  const [newProductPriceDisplay, setNewProductPriceDisplay] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState(1)
  const [selectedProductId, setSelectedProductId] = useState('')

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      establishment_type_id: '',
      address_street: '',
      address_number: '',
      address_neighborhood: '',
      address_city: '',
      customer_name: '',
      customer_id: '',
      order_number: '', // NOVO CAMPO
    },
  })

  useEffect(() => {
    loadInitialData()
  }, [user])

  const formatCurrency = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Se vazio, retorna vazio
    if (!numbers) return ''
    
    // Converte para número e divide por 100 para ter centavos
    const amount = parseInt(numbers) / 100
    
    // Formata como moeda brasileira
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const handlePriceChange = (value: string) => {
    const formatted = formatCurrency(value)
    setNewProductPriceDisplay(formatted)
    
    // Converte de volta para número
    const numbers = value.replace(/\D/g, '')
    const amount = numbers ? parseInt(numbers) / 100 : 0
    setNewProductPrice(amount)
  }

  const loadInitialData = async () => {
    if (!user) return

    try {
      console.log('🔄 [MANUAL ORDER] Carregando dados iniciais...')

      // Carregar tipos de estabelecimento
      const { data: types } = await supabase
        .from('establishment_types')
        .select('*')
        .order('name')

      setEstablishmentTypes(types || [])
      console.log('🏪 [MANUAL ORDER] Tipos de estabelecimento:', types?.length || 0)

      // Carregar clientes
      const { data: userOrgs } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)

      const orgIds = userOrgs?.map(uo => uo.organization_id) || []

      if (orgIds.length > 0) {
        const { data: customersData } = await supabase
          .from('customers')
          .select('*')
          .in('organization_id', orgIds)
          .order('full_name')

        setCustomers(customersData || [])
        console.log('👥 [MANUAL ORDER] Clientes carregados:', customersData?.length || 0)
      }

      console.log('✅ [MANUAL ORDER] Dados iniciais carregados')
    } catch (error) {
      console.error('❌ [MANUAL ORDER] Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados')
    }
  }

  const loadProducts = async (establishmentTypeId: string) => {
    if (!user || !establishmentTypeId) return

    try {
      const { data: userOrgs } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)

      const orgIds = userOrgs?.map(uo => uo.organization_id) || []

      if (orgIds.length > 0) {
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .in('organization_id', orgIds)
          .eq('establishment_type_id', establishmentTypeId)
          .eq('is_active', true)
          .order('name')

        setProducts(productsData || [])
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    }
  }

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      form.setValue('customer_id', customer.id)
      form.setValue('customer_name', customer.full_name)
      form.setValue('address_street', customer.address_street || '')
      form.setValue('address_number', customer.address_number || '')
      form.setValue('address_neighborhood', customer.address_neighborhood || '')
      form.setValue('address_city', customer.address_city || '')
    }
  }

  const handleDriverSelection = (driverId: string | null) => {
    setSelectedDriverId(driverId)
    console.log('🚚 [MANUAL ORDER] Entregador selecionado:', driverId)
  }

  const addOrderItem = () => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId)
      if (product) {
        const newItem: OrderItem = {
          id: Date.now().toString(),
          product_id: product.id,
          product_name: product.name,
          quantity: newItemQuantity,
          unit_price: product.price,
          total_price: product.price * newItemQuantity
        }
        setOrderItems([...orderItems, newItem])
        setSelectedProductId('')
        setNewItemQuantity(1)
      }
    } else if (newProductName && newProductPrice > 0) {
      const newItem: OrderItem = {
        id: Date.now().toString(),
        product_name: newProductName,
        quantity: newItemQuantity,
        unit_price: newProductPrice,
        total_price: newProductPrice * newItemQuantity
      }
      setOrderItems([...orderItems, newItem])
      setNewProductName('')
      setNewProductPrice(0)
      setNewProductPriceDisplay('')
      setNewItemQuantity(1)
    }
  }

  const removeOrderItem = (itemId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId))
  }

  const getTotalValue = () => {
    return orderItems.reduce((sum, item) => sum + item.total_price, 0)
  }

  const onSubmit = async (data: OrderFormData) => {
    if (!user) {
      toast.error('Usuário não autenticado')
      return
    }

    // REMOVIDO: Validação obrigatória de itens
    // if (orderItems.length === 0) {
    //   toast.error('Adicione pelo menos um item ao pedido')
    //   return
    // }

    if (!selectedDriverId) {
      toast.error('Selecione um entregador responsável')
      return
    }

    setLoading(true)
    
    try {
      console.log('📦 [MANUAL ORDER] Criando pedido manual...')

      // Geocodificar endereço (simulado)
      const fullAddress = `${data.address_street}, ${data.address_number}, ${data.address_neighborhood}, ${data.address_city}`
      const delivery_latitude = -18.5122 + (Math.random() - 0.5) * 0.1
      const delivery_longitude = -44.5550 + (Math.random() - 0.5) * 0.1

      // Buscar organização do usuário
      const { data: userOrgs } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)

      if (!userOrgs || userOrgs.length === 0) {
        throw new Error('Usuário não possui organização')
      }

      const organizationId = userOrgs[0].organization_id

      // Criar pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          organization_id: organizationId,
          customer_id: data.customer_id || null,
          customer_name: data.customer_name,
          customer_phone: '', // Pode ser preenchido depois
          delivery_address: fullAddress,
          delivery_latitude,
          delivery_longitude,
          address_street: data.address_street,
          address_number: data.address_number,
          address_neighborhood: data.address_neighborhood,
          address_city: data.address_city,
          establishment_type_id: data.establishment_type_id,
          delivery_driver_id: selectedDriverId,
          value: getTotalValue(), // Pode ser 0 se não houver itens
          status: 'assigned', // Já atribuído ao entregador
          is_manual: true,
          notes: data.order_number ? `Número do pedido: ${data.order_number}` : null // SALVAR NÚMERO DO PEDIDO
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Criar itens do pedido (apenas se houver itens)
      if (orderItems.length > 0) {
        const orderItemsData = orderItems.map(item => ({
          order_id: order.id,
          product_id: item.product_id || null,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }))

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItemsData)

        if (itemsError) throw itemsError
      }

      // Criar eventos
      await supabase
        .from('order_events')
        .insert([
          {
            order_id: order.id,
            event_type: 'created',
            description: `Pedido manual criado para ${data.customer_name}${data.order_number ? ` - Nº ${data.order_number}` : ''}`
          },
          {
            order_id: order.id,
            event_type: 'assigned',
            description: 'Pedido atribuído ao entregador'
          }
        ])

      console.log('✅ [MANUAL ORDER] Pedido criado com sucesso:', order.id)

      toast.success('Pedido manual criado e atribuído com sucesso!')
      router.push('/')
    } catch (error) {
      console.error('❌ [MANUAL ORDER] Erro ao criar pedido:', error)
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
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Novo Pedido Manual
                </h1>
                <p className="text-sm text-gray-600">Criar pedido detalhado</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-8">
          
          {/* Categoria */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={form.watch('establishment_type_id')} 
                onValueChange={(value) => {
                  form.setValue('establishment_type_id', value)
                  loadProducts(value)
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {establishmentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <span>{type.emoji}</span>
                        <span>{type.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.establishment_type_id && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.establishment_type_id.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="address_street">Rua</Label>
                  <Input
                    id="address_street"
                    {...form.register('address_street')}
                    placeholder="Nome da rua"
                    className="rounded-xl"
                  />
                  {form.formState.errors.address_street && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.address_street.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="address_number">Número</Label>
                  <Input
                    id="address_number"
                    {...form.register('address_number')}
                    placeholder="123"
                    className="rounded-xl"
                  />
                  {form.formState.errors.address_number && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.address_number.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address_neighborhood">Bairro</Label>
                  <Input
                    id="address_neighborhood"
                    {...form.register('address_neighborhood')}
                    placeholder="Nome do bairro"
                    className="rounded-xl"
                  />
                  {form.formState.errors.address_neighborhood && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.address_neighborhood.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="address_city">Cidade</Label>
                  <Input
                    id="address_city"
                    {...form.register('address_city')}
                    placeholder="Nome da cidade"
                    className="rounded-xl"
                  />
                  {form.formState.errors.address_city && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.address_city.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* COMPONENTE DE ENTREGADORES RESPONSÁVEL */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle>Entregador Responsável</CardTitle>
              <CardDescription>
                Selecione um entregador ativo ou ative o modo automático
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActiveDriverSelector
                onDriverSelect={handleDriverSelection}
                selectedDriverId={selectedDriverId || undefined}
                disabled={loading}
              />
            </CardContent>
          </Card>

          {/* Dados do Pedido */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle>Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* NOVO CAMPO: Número do Pedido */}
              <div className="space-y-2">
                <Label htmlFor="order_number" className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Número do Pedido (Opcional)
                </Label>
                <Input
                  id="order_number"
                  {...form.register('order_number')}
                  placeholder="Digite o número do pedido (ex: 12345)"
                  className="rounded-xl w-48"
                />
                <p className="text-xs text-gray-500">
                  Campo opcional para identificar o pedido com um número específico
                </p>
              </div>

              {/* Nome do Cliente */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="customer_name">Nome do Cliente</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/clientes/novo')}
                    className="rounded-xl"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Cadastrar Cliente
                  </Button>
                </div>
                
                {customers.length > 0 && (
                  <Select onValueChange={handleCustomerSelect}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Ou selecione um cliente existente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          <div>
                            <div className="font-medium">{customer.full_name}</div>
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Input
                  id="customer_name"
                  {...form.register('customer_name')}
                  placeholder="Digite o nome do cliente"
                  className="rounded-xl"
                />
                {form.formState.errors.customer_name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.customer_name.message}
                  </p>
                )}
              </div>

              {/* Lista de Itens (OPCIONAL) */}
              <div className="space-y-4">
                <Label>Itens (Opcional)</Label>
                
                {/* Adicionar Item */}
                <div className="border border-gray-200 rounded-xl p-4 space-y-4">
                  <h4 className="font-medium">Adicionar Item</h4>
                  
                  {products.length > 0 && (
                    <div className="space-y-2">
                      <Label>Produto Existente</Label>
                      <div className="flex gap-2">
                        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                          <SelectTrigger className="rounded-xl flex-1">
                            <SelectValue placeholder="Selecione um produto" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                <div className="flex justify-between w-full">
                                  <span>{product.name}</span>
                                  <span className="text-green-600">R$ {product.price.toFixed(2)}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min="1"
                          value={newItemQuantity}
                          onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                          className="rounded-xl w-20"
                          placeholder="Qtd"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Novo Produto</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        placeholder="Nome do produto"
                        className="rounded-xl flex-1"
                      />
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          value={newProductPriceDisplay}
                          onChange={(e) => handlePriceChange(e.target.value)}
                          placeholder="0,00"
                          className="rounded-xl w-32 pl-10 text-right font-mono"
                        />
                      </div>
                      <Input
                        type="number"
                        min="1"
                        value={newItemQuantity}
                        onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                        className="rounded-xl w-20"
                        placeholder="Qtd"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Digite apenas números. Ex: 1250 = R$ 12,50
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={addOrderItem}
                    disabled={!selectedProductId && (!newProductName || newProductPrice <= 0)}
                    className="w-full rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>

                {/* Lista de Itens Adicionados */}
                {orderItems.length > 0 && (
                  <div className="space-y-2">
                    <Label>Itens do Pedido</Label>
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-sm text-gray-600">
                            {item.quantity}x R$ {item.unit_price.toFixed(2)} = R$ {item.total_price.toFixed(2)}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOrderItem(item.id)}
                          className="rounded-xl"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="text-right font-bold text-lg">
                      Total: R$ {getTotalValue().toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Botão Criar Pedido */}
          <div className="flex gap-4">
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
              disabled={loading || !selectedDriverId} // REMOVIDO: orderItems.length === 0
              className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white rounded-xl"
            >
              {loading ? 'Criando...' : 'Criar Pedido'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}