'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ActiveDriverSelector } from './ActiveDriverSelector'
import { AddressSearchMap } from '@/components/map/AddressSearchMap'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, FileText, Search, Package, Plus, Minus, UserPlus, Hash, MapPin } from 'lucide-react'
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
  order_number: z.string().optional(),
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

interface AddressData {
  formatted_address: string
  street: string
  number: string
  neighborhood: string
  city: string
  latitude: number
  longitude: number
}

export function ManualOrderForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)
  const [addressData, setAddressData] = useState<AddressData | null>(null)
  
  // Estados para dados
  const [establishmentTypes, setEstablishmentTypes] = useState<EstablishmentType[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  
  // Estados para novos itens
  const [newProductName, setNewProductName] = useState('')
  const [newProductPrice, setNewProductPrice] = useState(0)
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
      order_number: '',
    },
  })

  useEffect(() => {
    loadInitialData()
  }, [user])

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

  const handleAddressSelect = (address: AddressData) => {
    console.log('📍 [ADDRESS] Endereço selecionado:', address)
    setAddressData(address)
    
    // Preencher campos do formulário
    form.setValue('address_street', address.street)
    form.setValue('address_number', address.number)
    form.setValue('address_neighborhood', address.neighborhood)
    form.setValue('address_city', address.city)
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

    if (!selectedDriverId) {
      toast.error('Selecione um entregador responsável')
      return
    }

    if (!addressData) {
      toast.error('Selecione um endereço válido no mapa')
      return
    }

    setLoading(true)
    
    try {
      console.log('📦 [MANUAL ORDER] Criando pedido manual...')

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

      // Criar pedido com coordenadas precisas do Google Maps
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          organization_id: organizationId,
          customer_id: data.customer_id || null,
          customer_name: data.customer_name,
          customer_phone: '',
          delivery_address: addressData.formatted_address,
          delivery_latitude: addressData.latitude,
          delivery_longitude: addressData.longitude,
          address_street: data.address_street,
          address_number: data.address_number,
          address_neighborhood: data.address_neighborhood,
          address_city: data.address_city,
          establishment_type_id: data.establishment_type_id,
          delivery_driver_id: selectedDriverId,
          value: getTotalValue(),
          status: 'assigned',
          is_manual: true,
          notes: data.order_number ? `Número do pedido: ${data.order_number}` : null
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

  // Preparar opções para o SearchableSelect
  const categoryOptions = establishmentTypes.map(type => ({
    value: type.id,
    label: type.name,
    emoji: type.emoji
  }))

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
          
          {/* Categoria com Busca */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Categoria
              </CardTitle>
              <CardDescription>
                Busque e selecione a categoria do estabelecimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SearchableSelect
                options={categoryOptions}
                value={form.watch('establishment_type_id')}
                onValueChange={(value) => {
                  form.setValue('establishment_type_id', value)
                  loadProducts(value)
                }}
                placeholder="Busque por uma categoria..."
                searchPlaceholder="Digite para buscar categorias..."
                emptyText="Nenhuma categoria encontrada."
              />
              {form.formState.errors.establishment_type_id && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.establishment_type_id.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Endereço com Mapa */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Endereço de Entrega
              </CardTitle>
              <CardDescription>
                Digite o endereço ou arraste o marcador no mapa para localização precisa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mapa de busca de endereço */}
              <AddressSearchMap
                onAddressSelect={handleAddressSelect}
                initialAddress=""
              />

              {/* Campos de endereço preenchidos automaticamente */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="address_street">Rua</Label>
                  <Input
                    id="address_street"
                    {...form.register('address_street')}
                    placeholder="Nome da rua"
                    className="rounded-xl"
                    readOnly
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
                    readOnly
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
                    readOnly
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
                    readOnly
                  />
                  {form.formState.errors.address_city && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.address_city.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Informações da localização */}
              {addressData && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">Localização confirmada</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    {addressData.formatted_address}
                  </p>
                  <p className="text-xs text-green-500 mt-1">
                    Coordenadas: {addressData.latitude.toFixed(6)}, {addressData.longitude.toFixed(6)}
                  </p>
                </div>
              )}
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
                  className="rounded-xl"
                />
                <p className="text-xs text-gray-500">
                  Campo opcional para identificar o pedido com um número específico
                </p>
              </div>

              {/* Nome do Cliente */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="customer_name">Nome do Cliente</Label>
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

                  <div className="text-center text-gray-500">ou</div>

                  <div className="space-y-2">
                    <Label>Novo Produto</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        placeholder="Nome do produto"
                        className="rounded-xl flex-1"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newProductPrice}
                        onChange={(e) => setNewProductPrice(parseFloat(e.target.value) || 0)}
                        placeholder="Preço"
                        className="rounded-xl w-24"
                      />
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
              disabled={loading || !selectedDriverId || !addressData}
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