'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { LoginForm } from '@/components/auth/LoginForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Search, FileText, Clock, MapPin, Camera, Navigation, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface OrderRecord {
  id: string
  customer_name: string
  delivery_address: string
  value: number
  status: string
  created_at: string
  route_started_at?: string
  route_finished_at?: string
  route_distance_km?: number
  route_duration_minutes?: number
  delivery_notes?: string
  delivery_photo_url?: string
  establishment_types: {
    name: string
    emoji: string
  }
}

export default function RegistroPedidosPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [filteredOrders, setFilteredOrders] = useState<OrderRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter,Filter])

  const loadOrders = async () => {
    if (!user) return

    try {
      console.log('📋 [REGISTRO] Carregando histórico de pedidos...')

      // Buscar organizações do usuário
      const { data: userOrgs } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)

      const orgIds = userOrgs?.map(uo => uo.organization_id) || []

      if (orgIds.length === 0) {
        setOrders([])
        setLoadingOrders(false)
        return
      }

      // Buscar todos os pedidos com informações completas
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          establishment_types (
            name,
            emoji
          )
        `)
        .in('organization_id', orgIds)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [REGISTRO] Erro ao carregar pedidos:', error)
        return
      }

      const processedOrders = ordersData?.map((order: any) => ({
        id: order.id,
        customer_name: order.customer_name,
        delivery_address: order.delivery_address,
        value: order.value,
        status: order.status,
        created_at: order.created_at,
        route_started_at: order.route_started_at,
        route_finished_at: order.route_finished_at,
        route_distance_km: order.route_distance_km,
        route_duration_minutes: order.route_duration_minutes,
        delivery_notes: order.delivery_notes,
        delivery_photo_url: order.delivery_photo_url,
        establishment_types: order.establishment_types || {
          name: 'Estabelecimento',
          emoji: '🏪'
        }
      })) || []

      console.log('✅ [REGISTRO] Pedidos carregados:', processedOrders.length)
      setOrders(processedOrders)

    } catch (error) {
      console.error('❌ [REGISTRO] Erro geral:', error)
    } finally {
      setLoadingOrders(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.delivery_address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Filtro por data
    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at)
        
        switch (dateFilter) {
          case 'today':
            return orderDate >= today
          case 'yesterday':
            return orderDate >= yesterday && orderDate < today
          case 'week':
            return orderDate >= weekAgo
          default:
            return true
        }
      })
    }

    setFilteredOrders(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'in_transit': return 'bg-blue-100 text-blue-800'
      case 'assigned': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Entregue'
      case 'in_transit': return 'Em Trânsito'
      case 'assigned': return 'Atribuído'
      case 'pending': return 'Pendente'
      case 'cancelled': return 'Cancelado'
      default: return status
    }
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A'
    
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${mins}min`
    }
    return `${mins}min`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg mb-4 animate-pulse">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
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
                  Registro de Pedidos
                </h1>
                <p className="text-sm text-gray-600">Histórico completo de entregas</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Filtros */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  placeholder="Buscar por cliente ou endereço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="delivered">Entregue</SelectItem>
                    <SelectItem value="in_transit">Em Trânsito</SelectItem>
                    <SelectItem value="assigned">Atribuído</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Períodos</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="yesterday">Ontem</SelectItem>
                    <SelectItem value="week">Última Semana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {filteredOrders.length}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {filteredOrders.filter(o => o.status === 'delivered').length}
                  </div>
                  <div className="text-sm text-gray-600">Entregues</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Navigation className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {filteredOrders.reduce((sum, order) => sum + (order.route_distance_km || 0), 0).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">KM Total</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    R$ {filteredOrders.reduce((sum, order) => sum + order.value, 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Valor Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Pedidos */}
        <div className="space-y-4">
          {loadingOrders ? (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
              <CardContent className="p-8 text-center">
                <div className="animate-pulse">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-200 rounded-xl mb-4">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600">Carregando pedidos...</p>
                </div>
              </CardContent>
            </Card>
          ) : filteredOrders.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
              <CardContent className="p-8 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum pedido encontrado
                </h3>
                <p className="text-gray-600">
                  Ajuste os filtros ou verifique se há pedidos cadastrados
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Informações básicas */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{order.establishment_types.emoji}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{order.customer_name}</h3>
                          <p className="text-sm text-gray-600">{order.establishment_types.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{order.delivery_address}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={`rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </Badge>
                        <span className="font-bold text-green-600">
                          R$ {order.value.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Informações de rota */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <Navigation className="w-4 h-4" />
                        Informações da Rota
                      </h4>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Criado:</span>
                          <span>{format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                        </div>
                        
                        {order.route_started_at && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Rota iniciada:</span>
                            <span>{format(new Date(order.route_started_at), 'HH:mm', { locale: ptBR })}</span>
                          </div>
                        )}
                        
                        {order.route_finished_at && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Rota finalizada:</span>
                            <span>{format(new Date(order.route_finished_at), 'HH:mm', { locale: ptBR })}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Distância:</span>
                          <span>{order.route_distance_km ? `${order.route_distance_km} km` : 'N/A'}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duração:</span>
                          <span>{formatDuration(order.route_duration_minutes)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Comprovante de entrega */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Comprovante
                      </h4>
                      
                      {order.delivery_notes && (
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-sm text-gray-700">{order.delivery_notes}</p>
                        </div>
                      )}
                      
                      {order.delivery_photo_url && (
                        <div className="space-y-2">
                          <img
                            src={order.delivery_photo_url}
                            alt="Comprovante de entrega"
                            className="w-full h-32 object-cover rounded-xl border"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(order.delivery_photo_url, '_blank')}
                            className="w-full rounded-xl"
                          >
                            Ver Foto Completa
                          </Button>
                        </div>
                      )}
                      
                      {!order.delivery_notes && !order.delivery_photo_url && (
                        <p className="text-sm text-gray-500 italic">
                          Sem comprovante de entrega
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}