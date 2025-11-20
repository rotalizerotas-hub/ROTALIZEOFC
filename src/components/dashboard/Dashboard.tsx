'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
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
  LogOut
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
      // Simular dados por enquanto
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #1e40af 0%, #059669 100%)'
                }}
              >
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 
                  className="text-xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #1e40af 0%, #059669 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  RotaLize
                </h1>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Dashboard</p>
              </div>
            </div>

            {/* Ações do Header */}
            <div className="flex items-center space-x-4">
              {/* Busca */}
              <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar pedidos..." 
                  className="bg-transparent border-none outline-none text-sm w-48"
                />
              </div>
              
              {/* Notificações */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Menu do Usuário */}
              <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-800">{user?.email?.split('@')[0]}</p>
                  <p className="text-xs text-gray-500">Administrador</p>
                </div>
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #1e40af 0%, #059669 100%)'
                  }}
                >
                  <User className="w-4 h-4 text-white" />
                </div>
                <button 
                  onClick={signOut}
                  className="p-1 text-gray-400 hover:text-gray-600"
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título da Página */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Visão Geral</h2>
          <p className="text-gray-600">
            Acompanhe o desempenho das suas entregas em tempo real
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total de Pedidos</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">{stats.totalOrders}</p>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-sm text-green-600">+12% vs ontem</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Entregadores Ativos</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">{stats.activeDrivers}</p>
              <div className="flex items-center space-x-1">
                <Activity className="w-3 h-3 text-green-500" />
                <span className="text-sm text-green-600">Online agora</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Pedidos Pendentes</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">{stats.pendingOrders}</p>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-yellow-500" />
                <span className="text-sm text-yellow-600">Aguardando</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Receita Hoje</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">R$ {stats.todayRevenue.toFixed(2)}</p>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-purple-500" />
                <span className="text-sm text-purple-600">+8% vs ontem</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Ações Rápidas</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex items-center space-x-4 mb-4">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{
                    background: 'linear-gradient(135deg, #1e40af 0%, #059669 100%)'
                  }}
                >
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

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
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

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
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
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Status do Sistema</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Todos os sistemas operacionais</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">API</p>
              <p className="text-xs text-green-600 uppercase tracking-wide">Operacional</p>
            </div>
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Banco de Dados</p>
              <p className="text-xs text-green-600 uppercase tracking-wide">Operacional</p>
            </div>
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Notificações</p>
              <p className="text-xs text-green-600 uppercase tracking-wide">Operacional</p>
            </div>
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Pagamentos</p>
              <p className="text-xs text-green-600 uppercase tracking-wide">Operacional</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}