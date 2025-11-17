'use client'

import { useState, useEffect } from 'react'
import { MapboxMap } from '@/components/map/MapboxMap'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Package, MapPin, Clock, DollarSign, Navigation } from 'lucide-react'
import { toast } from 'sonner'

interface DeliveryOrder {
  id: string
  customer_name: string
  delivery_address: string
  delivery_latitude: number
  delivery_longitude: number
  value: number
  status: string
  created_at: string
  establishment_types: {
    name: string
    emoji: string
  }
}

interface DeliveryStats {
  todayDeliveries: number
  todayEarnings: number
  pendingOrders: number
  isOnline: boolean
}

export function DeliveryDashboard() {
  const { user, signOut } = useAuth()
  const [orders, setOrders] = useState<DeliveryOrder[]>([])
  const [stats, setStats] = useState<DeliveryStats>({
    todayDeliveries: 0,
    todayEarnings: 0,
    pendingOrders: 0,
    isOnline: false
  })
  const [loading, setLoading] = useState(true)
  const [driverId, setDriverId] = useState<string>('')

  useEffect(() => {
    loadDeliveryData()
  }, [user])

  const loadDeliveryData = async () => {
    if (!user) return

    try {
      // Buscar dados do entregador
      const { data: driverData } = await supabase
        .from('delivery_drivers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!driverData) {
        toast.error('Entregador não encontrado')
        return
      }

      setDriverId(driverData.id)

      // Buscar pedidos atribuídos ao entregador
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          establishment_types (
            name,
            emoji
          )
        `)
        .eq('delivery_driver_id', driverData.id)
        .in('status', ['pending', 'assigned', 'in_transit'])
        .order('created_at', { ascending: false })

      const orders = ordersData?.map((order: any) => ({
        id: order.id,
        customer_name: order.customer_name,
        delivery_address: order.delivery_address,
        delivery_latitude: order.delivery_latitude,
        delivery_longitude: order.delivery_longitude,
        value: order.value,
        status: order.status,
        created_at: order.created_at,
        establishment_types: order.establishment_types || {
          name: 'Estabelecimento',
          emoji: '🏪'
        }
      })) || []

      setOrders(orders)

      // Calcular estatísticas
      const today = new Date().toISOString().split('T')[0]
      const todayOrders = orders.filter(order => 
        order.created_at.startsWith(today) && order.status === 'delivered'
      )

      setStats({
        todayDeliveries: todayOrders.length,
        todayEarnings: driverData.total_today || 0,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        isOnline: driverData.is_online
      })
    } catch (error) {
      console.error('Erro ao carregar dados de entrega:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const toggleOnlineStatus = async () => {
    if (!driverId) return

    try {
      const newStatus = !stats.isOnline

      const { error } = await supabase
        .from('delivery_drivers')
        .update({ 
          is_online: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId)

      if (error) throw error

      setStats(prev => ({ ...prev, isOnline: newStatus }))
      toast.success(`Status alterado para ${newStatus ? 'Online' : 'Offline'}`)
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status')
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) throw error

      // Criar evento
      await supabase
        .from('order_events')
        .insert({
          order_id: orderId,
          event_type: newStatus as any,
          description: `Pedido ${newStatus === 'in_transit' ? 'coletado' : 'entregue'} pelo entregador`
        })

      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ))

      toast.success(`Pedido ${newStatus === 'in_transit' ? 'coletado' : 'entregue'} com sucesso!`)
      
      if (newStatus === 'delivered') {
        loadDeliveryData() // Recarregar para atualizar estatísticas
      }
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error)
      toast.error('Erro ao atualizar pedido')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg mb-4 animate-pulse">
            <Package className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Carregando entregas...</p>
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
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Minhas Entregas
                </h1>
                <p className="text-sm text-gray-600">Painel do Entregador</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {stats.isOnline ? 'Online' : 'Offline'}
                </span>
                <Switch
                  checked={stats.isOnline}
                  onCheckedChange={toggleOnlineStatus}
                />
              </div>
              <span className="text-sm text-gray-600">
                {user?.email}
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
                Entregas Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats.todayDeliveries}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                Ganhos Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                R$ {stats.todayEarnings.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {stats.pendingOrders}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-500" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge 
                variant={stats.isOnline ? 'default' : 'secondary'}
                className="text-lg px-4 py-2 rounded-full"
              >
                {stats.isOnline ? 'Online' : 'Offline'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Mapa de Entregas */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Mapa de Entregas
            </CardTitle>
            <CardDescription>
              Visualize suas entregas pendentes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-96">
              <MapboxMap 
                organizations={[]}
                orders={orders}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Pedidos */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Minhas Entregas
            </CardTitle>
            <CardDescription>
              Gerencie suas entregas pendentes e em andamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">{order.establishment_types.emoji}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{order.customer_name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {order.delivery_address}
                      </p>
                      <p className="text-sm font-medium text-green-600">
                        R$ {order.value.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge 
                      variant={
                        order.status === 'pending' ? 'secondary' :
                        order.status === 'assigned' ? 'outline' :
                        order.status === 'in_transit' ? 'default' : 'destructive'
                      }
                      className="rounded-full"
                    >
                      {order.status === 'pending' ? 'Pendente' :
                       order.status === 'assigned' ? 'Atribuído' :
                       order.status === 'in_transit' ? 'Em trânsito' : 'Entregue'}
                    </Badge>

                    <div className="flex gap-2">
                      {order.status === 'assigned' && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, 'in_transit')}
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                        >
                          Coletar
                        </Button>
                      )}
                      {order.status === 'in_transit' && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white rounded-xl"
                        >
                          Entregar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma entrega pendente
                  </h3>
                  <p className="text-gray-600">
                    {stats.isOnline ? 'Aguardando novas entregas...' : 'Ative seu status para receber entregas'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}