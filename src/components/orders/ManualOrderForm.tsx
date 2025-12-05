'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CategorySelect } from '@/components/ui/category-select'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ActiveDriverSelector } from './ActiveDriverSelector'
import { AddressSearchMap } from '@/components/map/AddressSearchMap'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, FileText, Search, Package, Plus, Minus, UserPlus, Hash, MapPin, Truck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CreateCategoryDialog } from '@/components/establishment-types/CreateCategoryDialog'

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
  
  // NOVO: Estado para controlar se entregador é obrigatório
  const [requireDriver, setRequireDriver] = useState(true)
  
  // Estados para dados
  const [establishmentTypes, setEstablishmentTypes] = useState<EstablishmentType[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  
  // Estados para novos itens
  const [newProductName, setNewProductName] = useState('')
  const [newProductPrice, setNewProductPrice] = useState(0)
  const [newProductPriceDisplay, setNewProductPriceDisplay] = useState('') // NOVO: Para exibição formatada
  const [newItemQuantity, setNewItemQuantity] = useState(1)
  const [selectedProductId, setSelectedProductId] = useState('')

  // Estado para o dialog de nova categoria
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false)
  const [categorySearchTerm, setCategorySearchTerm] = useState('')

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

  // NOVA FUNÇÃO: Formatação de moeda
  const formatCurrency = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Se não há números, retorna vazio
    if (!numbers) return ''
    
    // Converte para número e divide por 100 para ter centavos
    const amount = parseInt(numbers) / 100
    
    // Formata como moeda brasileira
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(amount)
  }

  // NOVA FUNÇÃO: Converter moeda formatada para número
  const parseCurrency = (value: string): number => {
    const numbers = value.replace(/\D/g, '')
    if (!numbers) return 0
    return parseInt(numbers) / 100
  }

  // NOVO HANDLER: Para mudanças no campo de preço
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formatted = formatCurrency(inputValue)
    const numericValue = parseCurrency(inputValue)
    
    setNewProductPriceDisplay(formatted)
    setNewProductPrice(numericValue)
  }

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

  const handleCreateCategory = (searchTerm: string) => {
    setCategorySearchTerm(searchTerm)
    setIsCreateCategoryOpen(true)
  }

  const handleCategoryCreated = (newCategory: { id: string; name: string; emoji: string }) => {
    // Adicionar a nova categoria à lista
    setEstablishmentTypes(prev => [...prev, {
      id: newCategory.id,
      name: newCategory.name,
      emoji: newCategory.emoji,
      icon_url: '',
    }])

    // Selecionar a nova categoria
    form.setValue('establishment_type_id', newCategory.id)
    toast.success(`Categoria "${newCategory.name}" criada e selecionada`)
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
      setNewProductPriceDisplay('') // LIMPAR DISPLAY FORMATADO
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

    // MODIFICADO: Só exigir entregador se requireDriver estiver ativo
    if (requireDriver && !selectedDriverId) {
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

      // MODIFICADO: Status baseado se tem entregador ou não
      const orderStatus = requireDriver && selectedDriverId ? 'assigned' : 'pending'

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
          delivery_driver_id: requireDriver ? selectedDriverId : null, // MODIFICADO
          value: getTotalValue(),
          status: orderStatus, // MODIFICADO
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

      // MODIFICADO: Eventos baseados se tem entregador ou não
      const events = [
        {
          order_id: order.id,
          event_type: 'created',
          description: `Pedido manual criado para ${data.customer_name}${data.order_number ? ` - Nº ${data.order_number}` : ''}`
        }
      ]

      if (requireDriver && selectedDriverId) {
        events.push({
          order_id: order.id,
          event_type: 'assigned',
          description: 'Pedido atribuído ao entregador'
        })
      } else {
        events.push({
          order_id: order.id,
          event_type: 'route_marked',
          description: 'Rota marcada no mapa - aguardando entregador'
        })
      }

      await supabase
        .from('order_events')
        .insert(events)

      console.log('✅ [MANUAL ORDER] Pedido criado com sucesso:', order.id)

      const successMessage = requireDriver && selectedDriverId 
        ? 'Pedido manual criado e atribuído com sucesso!'
        : 'Pedido manual criado! Rota marcada no mapa aguardando entregador.'

      toast.success(successMessage)
      router.push('/')
    } catch (error) {
      console.error('❌ [MANUAL ORDER] Erro ao criar pedido:', error)
      toast.error('Erro ao criar pedido')
    } finally {
      setLoading(false)
    }
  }

  // Preparar opções para o CategorySelect
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
              <CategorySelect
                options={categoryOptions}
                value={form.watch('establishment_type_id')}
                onValueChange={(value) => {
                  form.setValue('establishment_type_id', value)
                  loadProducts(value)
                }}
                placeholder="Busque por uma categoria..."
                searchPlaceholder="Digite para buscar categorias..."
                allowCreate={true}
                onCreateNew={handleCreateCategory}
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

          {/* COMPONENTE DE ENTREGADORES RESPONSÁVEL - MODIFICADO */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  <div>
                    <CardTitle>Entregador Responsável</CardTitle>
                    <CardDescription>
                      {requireDriver 
                        ? 'Selecione um entregador ativo ou ative o modo automático'
                        : 'Modo desligado - Rota será marcada no mapa sem entregador'
                      }
                    </CardDescription>
                  </div>
                </div>
                
                {/* NOVO: Toggle Switch Neon */}
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium transition-colors ${requireDriver ? 'text-gray-900' : 'text-gray-400'}`}>
                    {requireDriver ? 'Ligado' : 'Desligado'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setRequireDriver(!requireDriver)}
                    className={`
                      relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white
                      ${requireDriver 
                        ? 'bg-gradient-to-r from-green-400 to-green-600 shadow-lg shadow-green-500/50 focus:ring-green-500' 
                        : 'bg-gray-300 focus:ring-gray-400'
                      }
                    `}
                  >
                    <span
                      className={`
                        inline-block h-6 w-6 transform rounded-full bg-white transition-all duration-300 shadow-lg
                        ${requireDriver 
                          ? 'translate-x-7 shadow-green-200' 
                          : 'translate-x-1 shadow-gray-200'
                        }
                      `}
                    >
                      {/* Efeito de brilho neon quando ligado */}
                      {requireDriver && (
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-green-600 opacity-20 animate-pulse"></div>
                      )}
                    </span>
                    
                    {/* Brilho neon ao redor do toggle quando ligado */}
                    {requireDriver && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-green-600 opacity-30 blur-sm animate-pulse"></div>
                    )}
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {requireDriver ? (
                <ActiveDriverSelector
                  onDriverSelect={handleDriverSelection}
                  selectedDriverId={selectedDriverId || undefined}
                  disabled={loading}
                />
              ) : (
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Modo Rota Livre Ativado
                      </div>
                      <div className="text-sm text-gray-600">
                        O pedido será criado e a rota marcada no mapa. Um entregador poderá assumir posteriormente.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dados do Pedido */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle>Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* MODIFICADO: Nome do Cliente e Número do Pedido na mesma linha */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Nome do Cliente - ocupa 3 colunas */}
                <div className="md:col-span-3 space-y-2">
                  <Label htmlFor="customer_name" className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Nome do Cliente
                  </Label>
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

                {/* Número do Pedido - ocupa 1 coluna */}
                <div className="space-y-2">
                  <Label htmlFor="order_number" className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Nº Pedido
                  </Label>
                  <Input
                    id="order_number"
                    {...form.register('order_number')}
                    placeholder="12345"
                    className="rounded-xl"
                  />
                  <p className="text-xs text-gray-500">
                    Opcional
                  </p>
                
                </div>
              </div>

              {/* Seletor de Cliente Existente */}
              {customers.length > 0 && (
                <div className="space-y-2">
                  <Label>Ou selecione um cliente existente</Label>
                  <Select onValueChange={handleCustomerSelect}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Buscar cliente cadastrado..." />
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
                </div>
              )}

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
                        value={newProductPriceDisplay}
                        onChange={handlePriceChange}
                        placeholder="R$ 0,00"
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
              disabled={loading || (requireDriver && !selectedDriverId) || !addressData}
              className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white rounded-xl"
            >
              {loading ? 'Criando...' : 'Criar Pedido'}
            </Button>
          </div>
        </form>
      </div>

      {/* Dialog para criar nova categoria */}
      <CreateCategoryDialog
        open={isCreateCategoryOpen}
        onOpenChange={setIsCreateCategoryOpen}
        onCategoryCreated={handleCategoryCreated}
        searchTerm={categorySearchTerm}
      />
    </div>
  )
}