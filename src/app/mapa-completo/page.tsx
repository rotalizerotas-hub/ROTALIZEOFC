'use client'

import { useState, useEffect } from 'react'
import { GoogleMap } from '@/components/map/GoogleMap'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/components/auth/AuthProvider'
import { LoginForm } from '@/components/auth/LoginForm'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Map, Filter, Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Organization {
  id: string
  name: string
  latitude: number
  longitude: number
  establishment_type: {
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
  establishment_type?: {
    name: string
    emoji: string
  }
}

export default function MapaCompletoPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [showOrganizations, setShowOrganizations] = useState(true)
  const [showOrders, setShowOrders] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mapLoading, setMapLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadMapData()
    }
  }, [user])

  // Detectar mudanças no fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const loadMapData = async () => {
    if (!user) return

    try {
      console.log('🗺️ [MAPA COMPLETO] Carregando dados...')

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

      setOrganizations(organizations)

      // Buscar todos os pedidos das organizações COM dados da categoria
      const orgIds = organizations.map(org => org.id)
      let orders: Order[] = []
      
      if (orgIds.length > 0) {
        const { data: ordersData } = await supabase
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
          .limit(200) // Limitar para performance

        orders = ordersData?.map((order: any) => ({
          id: order.id,
          customer_name: order.customer_name,
          delivery_latitude: order.delivery_latitude,
          delivery_longitude: order.delivery_longitude,
          status: order.status,
          value: order.value,
          created_at: order.created_at,
          establishment_type: order.establishment_types ? {
            name: order.establishment_types.name,
            emoji: order.establishment_types.emoji
          } : undefined
        })) || []
      }

      setOrders(orders)
      console.log('✅ [MAPA COMPLETO] Dados carregados:', {
        organizations: organizations.length,
        orders: orders.length
      })

    } catch (error) {
      console.error('❌ [MAPA COMPLETO] Erro ao carregar dados:', error)
    } finally {
      setMapLoading(false)
    }
  }

  const toggleFullscreen = async () => {
    try {
      // Verificar se a API de fullscreen está disponível
      if (!document.fullscreenEnabled) {
        toast.error('Modo tela cheia não é suportado neste navegador')
        return
      }

      if (!isFullscreen) {
        // Entrar em fullscreen
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen()
        } else {
          toast.error('Não foi possível ativar o modo tela cheia')
        }
      } else {
        // Sair do fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        }
      }
    } catch (error) {
      console.error('Erro ao alternar fullscreen:', error)
      toast.error('Erro ao alternar modo tela cheia')
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true
    return order.status === filterStatus
  })

  const displayOrganizations = showOrganizations ? organizations : []
  const displayOrders = showOrders ? filteredOrders : []

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg mb-4 animate-pulse">
            <Map className="w-8 h-8 text-white" />
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
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100'}`}>
      {/* Header */}
      {!isFullscreen && (
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
                    Mapa Completo
                  </h1>
                  <p className="text-sm text-gray-600">Visualização otimizada de entregas</p>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      <div className={`${isFullscreen ? 'h-full' : 'container mx-auto px-4 py-6'} flex gap-6`}>
        {/* Painel de Controles */}
        {!isFullscreen && (
          <div className="w-80 space-y-6">
            {/* Controles de Visualização */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="w-5 h-5" />
                  Controles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Toggle Organizações */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {showOrganizations ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span className="text-sm font-medium">Estabelecimentos</span>
                  </div>
                  <Switch
                    checked={showOrganizations}
                    onCheckedChange={setShowOrganizations}
                  />
                </div>

                {/* Toggle Pedidos */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {showOrders ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span className="text-sm font-medium">Pedidos</span>
                  </div>
                  <Switch
                    checked={showOrders}
                    onCheckedChange={setShowOrders}
                  />
                </div>

                {/* Filtro de Status */}
                {showOrders && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Status dos Pedidos</span>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={filterStatus === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('all')}
                        className="rounded-xl text-xs"
                      >
                        Todos
                      </Button>
                      <Button
                        variant={filterStatus === 'pending' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('pending')}
                        className="rounded-xl text-xs"
                      >
                        Pendentes
                      </Button>
                      <Button
                        variant={filterStatus === 'assigned' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('assigned')}
                        className="rounded-xl text-xs"
                      >
                        Atribuídos
                      </Button>
                      <Button
                        variant={filterStatus === 'in_transit' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('in_transit')}
                        className="rounded-xl text-xs"
                      >
                        Em Trânsito
                      </Button>
                    </div>
                  </div>
                )}

                {/* Botão Tela Cheia */}
                <Button
                  onClick={toggleFullscreen}
                  className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white rounded-xl"
                >
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Tela Cheia
                </Button>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Estabelecimentos:</span>
                  <Badge variant="outline" className="rounded-full">
                    {organizations.length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total de Pedidos:</span>
                  <Badge variant="outline" className="rounded-full">
                    {orders.length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Exibindo:</span>
                  <Badge variant="outline" className="rounded-full">
                    {displayOrders.length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pendentes:</span>
                  <Badge variant="secondary" className="rounded-full">
                    {orders.filter(o => o.status === 'pending').length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Em Trânsito:</span>
                  <Badge variant="default" className="rounded-full">
                    {orders.filter(o => o.status === 'in_transit').length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Mapa Principal */}
        <div className={`${isFullscreen ? 'w-full h-full' : 'flex-1'} relative`}>
          {isFullscreen && (
            <div className="absolute top-4 right-4 z-10">
              <Button
                onClick={toggleFullscreen}
                variant="outline"
                size="sm"
                className="bg-white/90 backdrop-blur-sm rounded-xl"
              >
                <Minimize2 className="w-4 h-4 mr-2" />
                Sair da Tela Cheia
              </Button>
            </div>
          )}
          
          <Card className={`${isFullscreen ? 'h-full border-0 rounded-none' : 'bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl'} overflow-hidden`}>
            <CardContent className="p-0">
              <div className={`${isFullscreen ? 'h-full' : 'h-[600px]'}`}>
                {mapLoading ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl shadow-lg mb-4 animate-pulse">
                        <Map className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-gray-600">Carregando mapa otimizado...</p>
                    </div>
                  </div>
                ) : (
                  <GoogleMap 
                    organizations={displayOrganizations}
                    orders={displayOrders}
                    className="w-full h-full"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}