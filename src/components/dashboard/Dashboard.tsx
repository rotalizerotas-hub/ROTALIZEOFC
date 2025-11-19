'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LeafletMap } from '@/components/map/LeafletMap'
import { 
  Package, 
  Users, 
  MapPin, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Map,
  FileText,
  UserPlus,
  Settings
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  deliveredOrders: number
  activeDrivers: number
}

interface RecentOrder {
  id: string
  customer_name: string
  status: string
  created_at: string
  value: number
}

export function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    activeDrivers: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      console.log('📊 [DASHBOARD] Carregando dados...')

      // Buscar organizações do usuário
      const { data: userOrgs } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)

      const orgIds = userOrgs?.map(uo => uo.organization_id) || []

      if (orgIds.length === 0) {
        setLoading(false)
        return
      }

      // Carregar estatísticas de pedidos
      const { data: orders } = await supabase
        .from('orders')
        .select('id, status, value, customer_name, created_at')
        .in('organization_id', orgIds)
        .order('created_at', { ascending: false })

      // Carregar entregadores ativos
      const { data: drivers } = await supabase
        .from('delivery_drivers')
        .select('id, is_online')
        .in('organization_id', orgIds)

      const totalOrders = orders?.length || 0
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0
      const deliveredOrders = orders?.filter(o => o.status === 'delivered').length || 0
      const activeDrivers = drivers?.filter(d => d.is_online).length || 0

      setStats({
        totalOrders,
        pendingOrders,
        deliveredOrders,
        activeDrivers
      })

      setRecentOrders(orders?.slice(0, 5) || [])

      console.log('✅ [DASHBOARD] Dados carregados:', {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        activeDrivers
      })

    } catch (error) {
      console.error('❌ [DASHBOARD] Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      assigned: { label: 'Atribuído', variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' },
      in_transit: { label: 'Em trânsito', variant: 'secondary' as const, color: 'bg-purple-100 text-purple-800' },
      delivered: { label: 'Entregue', variant: 'secondary' as const, color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelado', variant: 'secondary' as const, color: 'bg-red-100 text-red-800' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg mb-4 animate-pulse">
            <span className="text-2xl font-bold text-white">R</span>
          </div>
          <p className="text-gray-600">Carregando dashboard...</p>
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
                <span className="text-2xl font-bold text-white">R</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  RotaLize
                </h1>
                <p className="text-sm text-gray-600">Sistema de Gestão de Entregas</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/configuracoes')}
                className="rounded-xl"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  Todos os pedidos
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground">
                  Aguardando atribuição
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entregues</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</div>
                <p className="text-xs text-muted-foreground">
                  Concluídos com sucesso
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entregadores Ativos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.activeDrivers}</div>
                <p className="text-xs text-muted-foreground">
                  Online agora
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Ações Rápidas */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesso rápido às principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={() => router.push('/pedidos/novo')}
                  className="h-auto p-6 flex flex-col items-center gap-3 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white rounded-2xl"
                >
                  <Plus className="w-8 h-8" />
                  <div className="text-center">
                    <div className="font-semibold">Novo Pedido</div>
                    <div className="text-xs opacity-90">Criar pedido manual</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push('/mapa')}
                  className="h-auto p-6 flex flex-col items-center gap-3 rounded-2xl"
                >
                  <Map className="w-8 h-8" />
                  <div className="text-center">
                    <div className="font-semibold">Ver Mapa Completo</div>
                    <div className="text-xs text-muted-foreground">Visualizar entregas</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push('/entregadores')}
                  className="h-auto p-6 flex flex-col items-center gap-3 rounded-2xl"
                >
                  <Users className="w-8 h-8" />
                  <div className="text-center">
                    <div className="font-semibold">Entregadores</div>
                    <div className="text-xs text-muted-foreground">Gerenciar equipe</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push('/clientes/novo')}
                  className="h-auto p-6 flex flex-col items-center gap-3 rounded-2xl"
                >
                  <UserPlus className="w-8 h-8" />
                  <div className="text-center">
                    <div className="font-semibold">Novo Cliente</div>
                    <div className="text-xs text-muted-foreground">Cadastrar cliente</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pedidos Recentes */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Pedidos Recentes
              </CardTitle>
              <CardDescription>
                Últimos pedidos criados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum pedido encontrado</p>
                  <Button
                    onClick={() => router.push('/pedidos/novo')}
                    className="mt-4 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Pedido
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{order.customer_name}</div>
                        <div className="text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(order.value)}</div>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}