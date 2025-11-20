'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  Users, 
  MapPin, 
  TrendingUp, 
  Plus, 
  Bell,
  Search,
  Activity,
  Clock,
  CheckCircle,
  User,
  LogOut,
  BarChart3,
  Truck,
  DollarSign
} from 'lucide-react'
import { toast } from 'sonner'

export function Dashboard() {
  const { user, signOut } = useAuth()
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeDrivers: 0,
    pendingOrders: 0,
    todayRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Simular dados
      setStats({
        totalOrders: 156,
        activeDrivers: 8,
        pendingOrders: 12,
        todayRevenue: 2847.50
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Moderno */}
      <header className="header-modern">
        <div className="container-modern">
          <div className="header-content-modern">
            {/* Logo */}
            <div className="logo-modern">
              <div className="logo-icon-modern hover-lift">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <div className="logo-text-modern">RotaLize</div>
                <div className="logo-subtitle-modern">Dashboard</div>
              </div>
            </div>

            {/* Ações do Header */}
            <div className="flex items-center gap-4">
              {/* Busca */}
              <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar pedidos..." 
                  className="bg-transparent border-none outline-none text-sm w-48"
                />
              </div>
              
              {/* Notificações */}
              <button className="relative p-3 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Menu do Usuário */}
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-800">{user?.email?.split('@')[0]}</p>
                  <p className="text-xs text-gray-500">Administrador</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center hover-lift">
                  <User className="w-5 h-5 text-white" />
                </div>
                <button 
                  onClick={signOut}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container-modern page-content-modern">
        {/* Título da Página */}
        <div className="section-header-modern">
          <h2 className="text-heading-1 mb-3">Visão Geral</h2>
          <p className="text-body-lg">
            Acompanhe o desempenho das suas entregas em tempo real
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid-modern grid-4-modern mb-12">
          <div className="stat-card-modern hover-lift">
            <div className="stat-icon-modern bg-blue-100">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="stat-number-modern text-blue-600">{stats.totalOrders}</div>
            <div className="stat-label-modern">Total de Pedidos</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600">+12% vs ontem</span>
            </div>
          </div>

          <div className="stat-card-modern hover-lift">
            <div className="stat-icon-modern bg-green-100">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="stat-number-modern text-green-600">{stats.activeDrivers}</div>
            <div className="stat-label-modern">Entregadores Ativos</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Activity className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600">Online agora</span>
            </div>
          </div>

          <div className="stat-card-modern hover-lift">
            <div className="stat-icon-modern bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="stat-number-modern text-yellow-600">{stats.pendingOrders}</div>
            <div className="stat-label-modern">Pedidos Pendentes</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Clock className="w-3 h-3 text-yellow-500" />
              <span className="text-xs text-yellow-600">Aguardando</span>
            </div>
          </div>

          <div className="stat-card-modern hover-lift">
            <div className="stat-icon-modern bg-purple-100">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="stat-number-modern text-purple-600">R$ {stats.todayRevenue.toFixed(2)}</div>
            <div className="stat-label-modern">Receita Hoje</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-purple-500" />
              <span className="text-xs text-purple-600">+8% vs ontem</span>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="section-modern">
          <h3 className="text-heading-2 mb-8">Ações Rápidas</h3>

          <div className="grid-modern grid-3-modern">
            <div className="card-modern hover-lift p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center hover-scale">
                  <Plus className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">Novo Pedido</h4>
                  <p className="text-sm text-gray-600">Criar pedido de entrega</p>
                </div>
              </div>
              <Button className="w-full">
                Criar Pedido
              </Button>
            </div>

            <div className="card-modern hover-lift p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center hover-scale">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">Mapa ao Vivo</h4>
                  <p className="text-sm text-gray-600">Rastrear entregas em tempo real</p>
                </div>
              </div>
              <Button variant="secondary" className="w-full">
                Ver Mapa
              </Button>
            </div>

            <div className="card-modern hover-lift p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center hover-scale">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">Equipe</h4>
                  <p className="text-sm text-gray-600">Gerenciar entregadores</p>
                </div>
              </div>
              <Button variant="secondary" className="w-full">
                Gerenciar
              </Button>
            </div>
          </div>
        </div>

        {/* Status do Sistema */}
        <div className="card-modern p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-heading-2">Status do Sistema</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Todos os sistemas operacionais</span>
            </div>
          </div>
          
          <div className="grid-modern grid-4-modern">
            <div className="text-center p-4">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900 mb-1">API</p>
              <p className="text-xs text-green-600 uppercase tracking-wide">Operacional</p>
            </div>
            <div className="text-center p-4">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900 mb-1">Banco de Dados</p>
              <p className="text-xs text-green-600 uppercase tracking-wide">Operacional</p>
            </div>
            <div className="text-center p-4">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900 mb-1">Notificações</p>
              <p className="text-xs text-green-600 uppercase tracking-wide">Operacional</p>
            </div>
            <div className="text-center p-4">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900 mb-1">Pagamentos</p>
              <p className="text-xs text-green-600 uppercase tracking-wide">Operacional</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}