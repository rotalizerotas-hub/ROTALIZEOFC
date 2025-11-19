'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GoogleAddressSearch } from '@/components/map/GoogleAddressSearch'
import { GoogleMap } from '@/components/map/GoogleMap'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, FileText, Home, Package, MapPin, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const orderSchema = z.object({
  establishment_type_id: z.string().min(1, 'Selecione uma categoria'),
  address_street: z.string().min(2, 'Rua é obrigatória'),
  address_number: z.string().min(1, 'Número é obrigatório'),
  address_neighborhood: z.string().min(2, 'Bairro é obrigatório'),
  address_city: z.string().min(2, 'Cidade é obrigatória'),
  customer_name: z.string().min(2, 'Nome do cliente é obrigatório'),
})

type OrderFormData = z.infer<typeof orderSchema>

interface EstablishmentType {
  id: string
  name: string
  emoji: string
  icon_url: string
}

export function ManualOrderForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [establishmentTypes, setEstablishmentTypes] = useState<EstablishmentType[]>([])
  const [addressCoordinates, setAddressCoordinates] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [selectedEstablishmentType, setSelectedEstablishmentType] = useState<EstablishmentType | null>(null)
  const [addressFound, setAddressFound] = useState(false)

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      establishment_type_id: '',
      address_street: '',
      address_number: '',
      address_neighborhood: '',
      address_city: '',
      customer_name: '',
    },
  })

  useEffect(() => {
    loadEstablishmentTypes()
  }, [])

  const loadEstablishmentTypes = async () => {
    try {
      const { data } = await supabase
        .from('establishment_types')
        .select('*')
        .order('name')

      setEstablishmentTypes(data || [])
    } catch (error) {
      console.error('Erro ao carregar tipos:', error)
    }
  }

  const handleAddressFound = (addressData: {
    fullAddress: string
    street: string
    number: string
    neighborhood: string
    city: string
    latitude: number
    longitude: number
  }) => {
    form.setValue('address_street', addressData.street)
    form.setValue('address_number', addressData.number)
    form.setValue('address_neighborhood', addressData.neighborhood)
    form.setValue('address_city', addressData.city)
    
    setAddressCoordinates({
      latitude: addressData.latitude,
      longitude: addressData.longitude
    })
    
    setAddressFound(true)
  }

  const handleEstablishmentTypeChange = (value: string) => {
    form.setValue('establishment_type_id', value)
    const selectedType = establishmentTypes.find(type => type.id === value)
    setSelectedEstablishmentType(selectedType || null)
  }

  const onSubmit = async (data: OrderFormData) => {
    if (!user) {
      toast.error('Usuário não autenticado')
      return
    }

    if (!addressCoordinates) {
      toast.error('Busque o endereço no mapa antes de criar o pedido')
      return
    }

    setLoading(true)
    
    try {
      const fullAddress = `${data.address_street}, ${data.address_number}, ${data.address_neighborhood}, ${data.address_city}`

      const { data: userOrgs } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)

      if (!userOrgs || userOrgs.length === 0) {
        throw new Error('Usuário não possui organização')
      }

      const organizationId = userOrgs[0].organization_id

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          organization_id: organizationId,
          customer_name: data.customer_name,
          customer_phone: '',
          delivery_address: fullAddress,
          delivery_latitude: addressCoordinates.latitude,
          delivery_longitude: addressCoordinates.longitude,
          address_street: data.address_street,
          address_number: data.address_number,
          address_neighborhood: data.address_neighborhood,
          address_city: data.address_city,
          establishment_type_id: data.establishment_type_id,
          value: 0,
          status: 'pending',
          is_manual: true
        })
        .select()
        .single()

      if (orderError) throw orderError

      await supabase
        .from('order_events')
        .insert({
          order_id: order.id,
          event_type: 'created',
          description: `Pedido manual criado para ${data.customer_name}`
        })

      toast.success('Pedido criado com sucesso!')
      router.push('/')
    } catch (error) {
      console.error('Erro ao criar pedido:', error)
      toast.error('Erro ao criar pedido')
    } finally {
      setLoading(false)
    }
  }

  const mapOrders = addressCoordinates && selectedEstablishmentType ? [{
    id: 'preview',
    latitude: addressCoordinates.latitude,
    longitude: addressCoordinates.longitude,
    customerName: form.watch('customer_name') || 'Novo Pedido',
    status: 'preview',
    categoryIcon: selectedEstablishmentType.icon_url,
    categoryEmoji: selectedEstablishmentType.emoji
  }] : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
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
              <CardTitle>Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={form.watch('establishment_type_id')} 
                onValueChange={handleEstablishmentTypeChange}
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
                {addressFound && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <GoogleAddressSearch 
                onAddressFound={handleAddressFound}
                disabled={loading}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="address_street">Rua</Label>
                  <Input
                    id="address_street"
                    {...form.register('address_street')}
                    placeholder="Nome da rua"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="address_number">Número</Label>
                  <Input
                    id="address_number"
                    {...form.register('address_number')}
                    placeholder="123"
                    className="rounded-xl"
                  />
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
                </div>
                <div>
                  <Label htmlFor="address_city">Cidade</Label>
                  <Input
                    id="address_city"
                    {...form.register('address_city')}
                    placeholder="Nome da cidade"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Localização no Mapa
                </Label>
                <div className="h-96 rounded-2xl overflow-hidden border border-gray-200">
                  <GoogleMap
                    orders={mapOrders}
                    centerLat={addressCoordinates?.latitude}
                    centerLng={addressCoordinates?.longitude}
                    zoom={addressCoordinates ? 17 : 12}
                    className="w-full h-full"
                    height="100%"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cliente */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="customer_name">Nome do Cliente</Label>
                <Input
                  id="customer_name"
                  {...form.register('customer_name')}
                  placeholder="Digite o nome do cliente"
                  className="rounded-xl"
                />
                {form.formState.errors.customer_name && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.customer_name.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Botões */}
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
              disabled={loading || !addressCoordinates}
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