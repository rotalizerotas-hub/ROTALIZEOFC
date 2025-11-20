'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Package, 
  Users, 
  MapPin, 
  TrendingUp, 
  Plus, 
  Bell,
  Search,
  Filter,
  MoreVertical,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  LogOut
} from 'lucide-react'
import { toast } from 'sonner'

interface DashboardStats {
  totalOrders: number
  activeDrivers: number
  pendingOrders: number
  todayRevenue: number
}

export function Dashboard() {
  const { user, signOut } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
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
      // Buscar estatísticas do dashboard
      const today = new Date().toISOString().split('T')[0]

      // Total de pedidos
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })

      // Entregadores ativos
      const { count: activeDrivers } = await supabase
        .from('delivery_drivers')
        .select('*', { count: 'exact', head: true })
        .eq('is_online', true)

      // Pedidos pendentes
      const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Receita de hoje (simulada)
      const todayRevenue = Math.random() * 1000 + 500

      setStats({
        totalOrders: totalOrders || 0,
        activeDrivers: activeDrivers || 0,
        pendingOrders: pendingOrders || 0,
        todayRevenue
      })
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-gradient-soft flex items-center justify-center">
        <div className="text-center animate-pulse-soft">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-gradient rounded-2xl shadow-xl mb-6">
            <Package className="w-10 h-10 text-white" />
          </div>
          <p className="text-body text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-gradient-soft">
      {/* Header Moderno */}
      <header className="page-header">
        <div className="container">
          <div className="flex items-center justify-between py-4">
            {/* Logo e Navegação */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-gradient rounded-xl shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-heading-3 text-primary-gradient">RotaLize</h1>
                  <p className="text-caption text-gray-500">Dashboard</p>
                </div>
              </div>
              
              {/* Navegação Principal */}
              <nav className="hidden md:flex items-center gap-1">
                <button className="btn btn-ghost">
                  <Activity className="w-4 h-4" />
                  Visão Geral
                </button>
                <button className="btn btn-ghost">
                  <Package className="w-4 h-4" />
                  Pedidos
                </button>
                <button className="btn btn-ghost">
                  <Users className="w-4 h-4" />
                  Entregadores
                </button>
                <button className="btn btn-ghost">
                  <MapPin className="w-4 h-4" />
                  Mapa
                </button>
              </nav>
            </div>

            {/* Ações do Header */}
            <div className="flex items-center gap-3">
              {/* Busca */}
              <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar pedidos..." 
                  className="bg-transparent border-none outline-none text-sm w-48"
                />
              </div>
              
              {/* Notificações */}
              <button className="btn btn-ghost btn-sm relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Menu do Usuário */}
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-body-sm font-medium text-gray-800">{user?.email?.split('@')[0]}</p>
                  <p className="text-caption text-gray-500">Administrador</p>
                </div>
                <div className="w-10 h-10 bg-primary-gradient rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <button 
                  onClick={signOut}
                  className="btn btn-ghost btn-sm"
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
      <main className="page-content">
        <div className="container">
          {/* Título da Página */}
          <div className="mb-8 animate-fade-in">
            <h2 className="text-heading-1 text-gray-800 mb-2">Visão Geral</h2>
            <p className="text-body text-gray-600">
              Acompanhe o desempenho das suas entregas em tempo real
            </p>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid-4 mb-8 animate-slide-in">
            <div className="card p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-caption text-gray-500 mb-1">Total de Pedidos</p>
                <p className="text-heading-2 text-gray-800 mb-2">{stats.totalOrders}</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-body-sm text-green-600">+12% vs ontem</span>
                </div>
              </div>
            </div>

            <div className="card p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-caption text-gray-500 mb-1">Entregadores Ativos</p>
                <p className="text-heading-2 text-gray-800 mb-2">{stats.activeDrivers}</p>
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-green-500" />
                  <span className="text-body-sm text-green-600">Online agora</span>
                </div>
              </div>
            </div>

            <div className="card p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-caption text-gray-500 mb-1">Pedidos Pendentes</p>
                <p className="text-heading-2 text-gray-800 mb-2">{stats.pendingOrders}</p>
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-yellow-500" />
                  <span className="text-body-sm text-yellow-600">Aguardando</span>
                </div>
              </div>
            </div>

            <div className="card p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-caption text-gray-500 mb-1">Receita Hoje</p>
                <p className="text-heading-2 text-gray-800 mb-2">R$ {stats.todayRevenue.toFixed(2)}</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-purple-500" />
                  <span className="text-body-sm text-purple-600">+8% vs ontem</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-heading-2 text-gray-800">Ações Rápidas</h3>
              <button className="btn btn-secondary btn-sm">
                <Filter className="w-4 h-4" />
                Filtros
              </button>
            </div>

            <div className="grid-3 animate-fade-in">
              <div className="card p-6 group cursor-pointer hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-primary-gradient rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Plus className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h4 className="text-heading-3 text-gray-800 mb-1">Novo Pedido</h4>
                    <p className="text-body-sm text-gray-600">Criar pedido de entrega</p>
                  </div>
                </div>
                <button className="btn btn-primary w-full">
                  Criar Pedido
                </button>
              </div>

              <div className="card p-6 group cursor-pointer hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h4 className="text-heading-3 text-gray-800 mb-1">Mapa ao Vivo</h4>
                    <p className="text-body-sm text-gray-600">Rastrear entregas em tempo real</p>
                  </div>
                </div>
                <button className="btn btn-secondary w-full">
                  Ver Mapa
                </button>
              </div>

              <div className="card p-6 group cursor-pointer hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h4 className="text-heading-3 text-gray-800 mb-1">Equipe</h4>
                    <p className="text-body-sm text-gray-600">Gerenciar entregadores</p>
                  </div>
                </div>
                <button className="btn btn-secondary w-full">
                  Gerenciar
                </button>
              </div>
            </div>
          </div>

          {/* Status Rápido */}
          <div className="card p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-heading-2 text-gray-800">Status do Sistema</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-body-sm text-green-600 font-medium">Todos os sistemas operacionais</span>
              </div>
            </div>
            
            <div className="grid-4">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-body-sm font-medium text-gray-800">API</p>
                <p className="text-caption text-green-600">Operacional</p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-body-sm font-medium text-gray-800">Banco de Dados</p>
                <p className="text-caption text-green-600">Operacional</p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-body-sm font-medium text-gray-800">Notificações</p>
                <p className="text-caption text-green-600">Operacional</p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-body-sm font-medium text-gray-800">Pagamentos</p>
                <p className="text-caption text-green-600">Operacional</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}