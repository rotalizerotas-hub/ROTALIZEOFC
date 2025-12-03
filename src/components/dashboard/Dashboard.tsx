'use client'

import { useState, useEffect } from 'react'
import { GoogleMap } from '@/components/map/GoogleMap'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Plus, Users, Map, Package, TrendingUp, FileText, Clock, MapPin, Camera, Route, CheckCircle, ClipboardList } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Organization {
  id: string
  name: string
  latitude: number
  longitude: number
  establishment_types: {
    name: string
    icon_url: string
    emoji: string
  }
}

interface Order {
  id: string
  customer_name: string
  delivery_latitude: number
  delivery_longitude: number
  status: string
  value: number
  created_at: string
}

interface OrderRecord {
  id: string
  customer_name: string
  customer_phone: string
  delivery_address: string
  value: number
  status: string
  created_at: string
  route_started_at: string | null
  route_finished_at: string | null
  route_distance_km: number | null
  route_duration_minutes: number | null
  delivery_notes: string | null
  delivery_photo_url: string | null
  establishment_types: {
    name: string
    emoji: string
  } | null
}

interface DashboardData {
  organizations: Array<{
    id: string
    name: string
    latitude: number
    longitude: number
    establishment_type: {
      name: string
      icon_url: string
      emoji: string
    }
  }>
  orders: Order[]
  orderRecords: OrderRecord[]
  stats: {
    totalOrders: number
    pendingOrders: number
    activeDrivers: number
    todayRevenue: number
  }
}

export function Dashboard() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<DashboardData>({
    organizations: [],
    orders: [],
    orderRecords: [],
    stats: {
      totalOrders: 0,
      pendingOrders: 0,
      activeDrivers: 0,
      todayRevenue: 0
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      // Buscar organizações do usuário
      const { data: userOrgs } = await supabase
        .from('user_organizations')
        .select(`
          organization_id,
          organizations (
            id,
            name,
            latitude,
            longitude,
            establishment_types (
              name,
              icon_url,
              emoji
            )
          )
        `)
        .eq('user_id', user.id)

      const organizations = userOrgs?.map((uo: any) => ({
        id: uo.organizations.id,
        name: uo.organizations.name,
        latitude: uo.organizations.latitude,
        longitude: uo.organizations.longitude,
        establishment_type: uo.organizations.establishment_types || {
          name: 'Estabelecimento',
          icon_url: '/icons/default.png',
          emoji: '🏪'
        }
      })) || []

      // Buscar pedidos das organizações
      const orgIds = organizations.map(org => org.id)
      let orders: Order[] = []
      let orderRecords: OrderRecord[] = []
      
      if (orgIds.length > 0) {
        // Pedidos para o mapa (recentes)
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .in('organization_id', orgIds)
          .order('created_at', { ascending: false })
          .limit(50)

        orders = ordersData || []

        // Registros completos de pedidos (últimos 5 para preview)
        const { data: recordsData } = await supabase
          .from('orders')
          .select(`
            id,
            customer_name,
            customer_phone,
            delivery_address,
            value,
            status,
            created_at,
            route_started_at,
            route_finished_at,
            route_distance_km,
            route_duration_minutes,
            delivery_notes,
            delivery_photo_url,
            establishment_types (
              name,
              emoji
            )
          `)
          .in('organization_id', orgIds)
          .order('created_at', { ascending: false })
          .limit(5)

        // Corrigir formato dos dados para OrderRecord[]
        orderRecords = recordsData?.map((record: any) => ({
          id: record.id,
          customer_name: record.customer_name,
          customer_phone: record.customer_phone,
          delivery_address: record.delivery_address,
          value: record.value,
          status: record.status,
          created_at: record.created_at,
          route_started_at: record.route_started_at,
          route_finished_at: record.route_finished_at,
          route_distance_km: record.route_distance_km,
          route_duration_minutes: record.route_duration_minutes,
          delivery_notes: record.delivery_notes,
          delivery_photo_url: record.delivery_photo_url,
          // Garantir que establishment_types seja um objeto e não um array
          establishment_types: Array.isArray(record.establishment_types) && record.establishment_types.length > 0 
            ? {
                name: record.establishment_types[0].name || 'Estabelecimento',
                emoji: record.establishment_types[0].emoji || '📦'
              }
            : record.establishment_types || null
        })) || []
      }

      // Calcular estatísticas
      const today = new Date().toISOString().split('T')[0]
      const todayOrders = orders.filter(order => 
        order.created_at.startsWith(today)
      )

      let activeDriversCount = 0
      if (orgIds.length > 0) {
        const { data: activeDrivers } = await supabase
          .from('delivery_drivers')
          .select('id')
          .in('organization_id', orgIds)
          .eq('is_online', true)

        activeDriversCount = activeDrivers?.length || 0
      }

      const stats = {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        activeDrivers: activeDriversCount,
        todayRevenue: todayOrders.reduce((sum, order) => sum + order.value, 0)
      }

      setData({
        organizations,
        orders,
        orderRecords,
        stats
      })
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary' as const },
      assigned: { label: 'Atribuído', variant: 'outline' as const },
      in_transit: { label: 'Em trânsito', variant: 'default' as const },
      delivered: { label: 'Entregue', variant: 'default' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return (
      <Badge variant={config.variant} className="rounded-full">
        {config.label}
      </Badge>
    )
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl shadow-lg">
                <span className="text-xl font-bold text-white">R</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Rotas
                </h1>
                <p className="text-sm text-gray-600">Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Olá, {user?.email}
              </span>
              <Button 
                variant="outline" 
                onClick={signOut}
                className="rounded-xl"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Total de Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {data.stats.totalOrders}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Package className="w-4 h-4 text-yellow-500" />
                Pedidos Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {data.stats.pendingOrders}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                Entregadores Online
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {data.stats.activeDrivers}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                Receita Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                R$ {data.stats.todayRevenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button 
            onClick={() => router.push('/novo-pedido-manual')}
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
          >
            <FileText className="w-5 h-5 mr-2" />
            Novo Pedido Manual
          </Button>
          <Button 
            onClick={() => router.push('/registros-pedidos')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
          >
            <ClipboardList className="w-5 h-5 mr-2" />
            Registros de Pedidos
          </Button>
          <Button 
            onClick={() => router.push('/entregadores')}
            variant="outline"
            className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 border-2"
          >
            <Users className="w-5 h-5 mr-2" />
            Entregadores
          </Button>
          <Button 
            onClick={() => router.push('/clientes')}
            variant="outline"
            className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 border-2"
          >
            <Users className="w-5 h-5 mr-2" />
            Clientes
          </Button>
          <Button 
            onClick={() => router.push('/produtos')}
            variant="outline"
            className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 border-2"
          >
            <Package className="w-5 h-5 mr-2" />
            Produtos
          </Button>
          <Button 
            onClick={() => router.push('/mapa-completo')}
            variant="outline"
            className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 border-2"
          >
            <Map className="w-5 h-5 mr-2" />
            Ver Mapa Completo
          </Button>
        </div>

        {/* Mapa Principal */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Mapa de Entregas
            </CardTitle>
            <CardDescription>
              Visualize suas organizações e pedidos em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-96">
              <GoogleMap 
                organizations={data.organizations}
                orders={data.orders}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview dos Registros de Pedidos */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Últimos Registros
                </CardTitle>
                <CardDescription>
                  Últimas entregas realizadas
                </CardDescription>
              </div>
              <Button 
                onClick={() => router.push('/registros-pedidos')}
                variant="outline"
                className="rounded-xl"
              >
                Ver Todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.orderRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-sm">
                        {record.establishment_types?.emoji || '📦'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{record.customer_name}</h4>
                      <p className="text-sm text-gray-600">R$ {record.value.toFixed(2)} • {formatDate(record.created_at)}</p>
                    </div>
                  </div>
                  {getStatusBadge(record.status)}
                </div>
              ))}

              {data.orderRecords.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum registro encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Pedidos Recentes */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Pedidos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-900">{order.customer_name}</h4>
                    <p className="text-sm text-gray-600">R$ {order.value.toFixed(2)}</p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              ))}
              {data.orders.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Nenhum pedido encontrado
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}