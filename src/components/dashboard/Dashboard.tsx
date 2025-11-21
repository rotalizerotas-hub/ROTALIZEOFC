'use client'

import { useState, useEffect } from 'react'
import { GoogleMap } from '@/components/map/GoogleMap'
import { CategorySelector } from './CategorySelector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Plus, Users, Map, Package, TrendingUp, FileText, ArrowLeft } from 'lucide-react'
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

interface EstablishmentType {
  id: string
  name: string
  emoji: string
  icon_url: string
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
  stats: {
    totalOrders: number
    pendingOrders: number
    activeDrivers: number
    todayRevenue: number
  }
}

// Função para obter tema da categoria
const getCategoryTheme = (categoryName: string) => {
  const themes: Record<string, {
    gradient: string
    background: string
    text: string
    accent: string
  }> = {
    'Pizzaria': {
      gradient: 'from-red-500 to-orange-500',
      background: 'from-red-50 via-orange-50 to-yellow-50',
      text: '#7f1d1d',
      accent: '#dc2626'
    },
    'Hamburgueria': {
      gradient: 'from-amber-500 to-yellow-500',
      background: 'from-amber-50 via-yellow-50 to-orange-50',
      text: '#92400e',
      accent: '#d97706'
    },
    'Farmácia': {
      gradient: 'from-blue-500 to-indigo-500',
      background: 'from-blue-50 via-indigo-50 to-cyan-50',
      text: '#1e3a8a',
      accent: '#2563eb'
    },
    'Supermercado': {
      gradient: 'from-green-500 to-emerald-500',
      background: 'from-green-50 via-emerald-50 to-teal-50',
      text: '#064e3b',
      accent: '#059669'
    }
  }

  return themes[categoryName] || {
    gradient: 'from-blue-500 to-green-500',
    background: 'from-blue-50 via-green-50 to-blue-100',
    text: '#1f2937',
    accent: '#3b82f6'
  }
}

export function Dashboard() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<EstablishmentType | null>(null)
  const [showCategorySelector, setShowCategorySelector] = useState(true)
  const [data, setData] = useState<DashboardData>({
    organizations: [],
    orders: [],
    stats: {
      totalOrders: 0,
      pendingOrders: 0,
      activeDrivers: 0,
      todayRevenue: 0
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se já tem categoria selecionada
    const savedCategory = localStorage.getItem('selectedCategory')
    if (savedCategory) {
      try {
        const category = JSON.parse(savedCategory)
        setSelectedCategory(category)
        setShowCategorySelector(false)
      } catch (error) {
        console.error('Erro ao carregar categoria salva:', error)
      }
    }
    
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
      
      if (orgIds.length > 0) {
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .in('organization_id', orgIds)
          .order('created_at', { ascending: false })
          .limit(50)

        orders = ordersData || []
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
        stats
      })
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySelect = (category: EstablishmentType) => {
    setSelectedCategory(category)
    setShowCategorySelector(false)
  }

  const handleBackToCategories = () => {
    setShowCategorySelector(true)
    setSelectedCategory(null)
    localStorage.removeItem('selectedCategory')
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

  // Mostrar seletor de categoria
  if (showCategorySelector) {
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
                    Rotalize
                  </h1>
                  <p className="text-sm text-gray-600">Selecione sua categoria</p>
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

        <div className="container mx-auto px-4 py-8">
          <CategorySelector onCategorySelect={handleCategorySelect} />
        </div>
      </div>
    )
  }

  // Dashboard temático baseado na categoria
  const theme = selectedCategory ? getCategoryTheme(selectedCategory.name) : getCategoryTheme('')

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.background}`}>
      {/* Header Temático */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={handleBackToCategories}
                className="rounded-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${theme.gradient} rounded-xl shadow-lg`}>
                <span className="text-xl text-white">{selectedCategory?.emoji}</span>
              </div>
              <div>
                <h1 className={`text-2xl font-bold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
                  {selectedCategory?.name} - Rotalize
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
                <TrendingUp className="w-4 h-4" style={{ color: theme.accent }} />
                Receita Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: theme.accent }}>
                R$ {data.stats.todayRevenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botões de Ação Temáticos */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button 
            onClick={() => router.push('/novo-pedido-manual')}
            className={`bg-gradient-to-r ${theme.gradient} hover:opacity-90 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3`}
          >
            <FileText className="w-5 h-5 mr-2" />
            Novo Pedido Manual
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
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
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

        {/* Lista de Pedidos Recentes */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl mt-8">
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
                  <Badge 
                    variant={
                      order.status === 'delivered' ? 'default' :
                      order.status === 'pending' ? 'secondary' :
                      order.status === 'in_transit' ? 'outline' : 'destructive'
                    }
                    className="rounded-full"
                  >
                    {order.status === 'pending' ? 'Pendente' :
                     order.status === 'assigned' ? 'Atribuído' :
                     order.status === 'in_transit' ? 'Em trânsito' :
                     order.status === 'delivered' ? 'Entregue' : 'Cancelado'}
                  </Badge>
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