'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { LoginForm } from '@/components/auth/LoginForm'
import { LeafletMap } from '@/components/map/LeafletMap'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Map, MapPin, Users, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface Order {
  id: string
  customer_name: string
  delivery_latitude: number
  delivery_longitude: number
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
  establishment_type_id: string
  notes: string | null
  created_at: string
}

interface EstablishmentType {
  id: string
  name: string
  emoji: string
  icon_url: string
}

interface DeliveryDriver {
  id: string
  user_id: string
  is_online: boolean
  current_latitude: number | null
  current_longitude: number | null
  vehicle_type: 'moto' | 'carro' | 'caminhao'
}

interface Profile {
  id: string
  full_name: string
}

export default function MapaPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [establishmentTypes, setEstablishmentTypes] = useState<EstablishmentType[]>([])
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (user) {
      loadMapData()
    }
  }, [user])

  const loadMapData = async () => {
    if (!user) return

    setLoadingData(true)

    try {
      console.log('🗺️ [MAPA] Carregando dados do mapa...')

      // Buscar organizações do usuário
      const { data: userOrgs } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)

      const orgIds = userOrgs?.map(uo => uo.organization_id) || []

      if (orgIds.length === 0) {
        console.log('⚠️ [MAPA] Usuário não possui organizações')
        setLoadingData(false)
        return
      }

      // Carregar pedidos com coordenadas
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .in('organization_id', orgIds)
        .not('delivery_latitude', 'is', null)
        .not('delivery_longitude', 'is', null)
        .order('created_at', { ascending: false })

      if (ordersError) {
        console.error('❌ [MAPA] Erro ao carregar pedidos:', ordersError)
        throw ordersError
      }

      console.log('📦 [MAPA] Pedidos carregados:', ordersData?.length || 0)

      // Carregar tipos de estabelecimento
      const { data: typesData } = await supabase
        .from('establishment_types')
        .select('*')

      console.log('🏪 [MAPA] Tipos de estabelecimento:', typesData?.length || 0)

      // Carregar entregadores online
      const { data: driversData } = await supabase
        .from('delivery_drivers')
        .select('*')
        .in('organization_id', orgIds)
        .eq('is_online', true)
        .not('current_latitude', 'is', null)
        .not('current_longitude', 'is', null)

      console.log('🚚 [MAPA] Entregadores online:', driversData?.length || 0)

      // Carregar perfis dos entregadores
      const driverUserIds = driversData?.map(d => d.user_id) || []
      let profilesData: Profile[] = []

      if (driverUserIds.length > 0) {
        const { data: profilesResult } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', driverUserIds)

        profilesData = profilesResult || []
      }

      setOrders(ordersData || [])
      setEstablishmentTypes(typesData || [])
      setDrivers(driversData || [])
      setProfiles(profilesData)

      console.log('✅ [MAPA] Dados carregados com sucesso')

    } catch (error) {
      console.error('❌ [MAPA] Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados do mapa')
    } finally {
      setLoadingData(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg mb-4 animate-pulse">
            <span className="text-2xl font-bold text-white">R</span>
          </div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  // Preparar dados para o mapa
  const mapOrders = orders.map(order => {
    const establishmentType = establishmentTypes.find(type => type.id === order.establishment_type_id)
    
    // Extrair número do pedido das notas se existir
    let orderNumber = ''
    if (order.notes && order.notes.includes('Número do pedido:')) {
      const match = order.notes.match(/Número do pedido:\s*(\w+)/)
      if (match) {
        orderNumber = match[1]
      }
    }

    return {
      id: order.id,
      latitude: order.delivery_latitude,
      longitude: order.delivery_longitude,
      customerName: order.customer_name,
      status: order.status,
      categoryIcon: establishmentType?.icon_url || '',
      categoryEmoji: establishmentType?.emoji || '📍',
      orderNumber
    }
  })

  const mapDrivers = drivers.map(driver => {
    const profile = profiles.find(p => p.id === driver.user_id)
    
    return {
      id: driver.id,
      name: profile?.full_name || 'Entregador',
      latitude: driver.current_latitude!,
      longitude: driver.current_longitude!,
      vehicleType: driver.vehicle_type,
      isOnline: driver.is_online
    }
  })

  // Calcular centro do mapa baseado nos pedidos
  let centerLat = -19.9167 // Belo Horizonte padrão
  let centerLng = -43.9345

  if (mapOrders.length > 0) {
    const avgLat = mapOrders.reduce((sum, order) => sum + order.latitude, 0) / mapOrders.length
    const avgLng = mapOrders.reduce((sum, order) => sum + order.longitude, 0) / mapOrders.length
    centerLat = avgLat
    centerLng = avgLng
  }

  const getStatusCount = (status: string) => {
    return orders.filter(order => order.status === status).length
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
                <Map className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Mapa de Entregas
                </h1>
                <p className="text-sm text-gray-600">Visualização completa dos pedidos</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          
          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
                <div className="text-sm text-gray-600">Total</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{getStatusCount('pending')}</div>
                <div className="text-sm text-gray-600">Pendentes</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{getStatusCount('assigned')}</div>
                <div className="text-sm text-gray-600">Atribuídos</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-pink-600">{getStatusCount('in_transit')}</div>
                <div className="text-sm text-gray-600">Em Trânsito</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{getStatusCount('delivered')}</div>
                <div className="text-sm text-gray-600">Entregues</div>
              </CardContent>
            </Card>
          </div>

          {/* Mapa */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Mapa de Entregas
                <Badge variant="secondary" className="ml-2">
                  {mapOrders.length} pedidos
                </Badge>
                <Badge variant="secondary">
                  {mapDrivers.length} entregadores online
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="h-96 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-gray-600">Carregando mapa...</p>
                  </div>
                </div>
              ) : (
                <div className="h-96 rounded-2xl overflow-hidden">
                  <LeafletMap
                    orders={mapOrders}
                    drivers={mapDrivers}
                    centerLat={centerLat}
                    centerLng={centerLng}
                    zoom={12}
                    className="w-full h-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legenda */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle>Legenda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                  <span className="text-sm">Pendente</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                  <span className="text-sm">Atribuído</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-pink-500"></div>
                  <span className="text-sm">Em Trânsito</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-sm">Entregue</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏍️</span>
                    <span className="text-sm">Entregador - Moto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🚗</span>
                    <span className="text-sm">Entregador - Carro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🚛</span>
                    <span className="text-sm">Entregador - Caminhão</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}