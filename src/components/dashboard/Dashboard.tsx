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
  Clock,
  CheckCircle,
  User,
  LogOut,
  Menu
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
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full loading mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            {/* Logo */}
            <div className="logo">
              <div className="logo-icon">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="logo-text">RotaLize</div>
                <div className="text-xs text-gray-500">Dashboard</div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-4">
              {/* Busca */}
              <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className="bg-transparent border-none outline-none text-sm w-40"
                />
              </div>
              
              {/* Notificações */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Usuário */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-800">{user?.email?.split('@')[0]}</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
                <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <button 
                  onClick={signOut}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="container py-8">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Visão Geral</h1>
          <p className="text-gray-600">Acompanhe suas entregas em tempo real</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-4 mb-8">
          <div className="stat-card">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="stat-number text-blue-600">{stats.totalOrders}</div>
            <div className="stat-label">Total de Pedidos</div>
          </div>

          <div className="stat-card">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="stat-number text-green-600">{stats.activeDrivers}</div>
            <div className="stat-label">Entregadores Ativos</div>
          </div>

          <div className="stat-card">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="stat-number text-yellow-600">{stats.pendingOrders}</div>
            <div className="stat-label">Pedidos Pendentes</div>
          </div>

          <div className="stat-card">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="stat-number text-purple-600">R$ {stats.todayRevenue.toFixed(2)}</div>
            <div className="stat-label">Receita Hoje</div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Ações Rápidas</h2>
          
          <div className="grid grid-3">
            <div className="card">
              <div className="card-content">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Novo Pedido</h3>
                    <p className="text-sm text-gray-600">Criar pedido de entrega</p>
                  </div>
                </div>
                <Button className="w-full">Criar Pedido</Button>
              </div>
            </div>

            <div className="card">
              <div className="card-content">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Mapa</h3>
                    <p className="text-sm text-gray-600">Ver entregas no mapa</p>
                  </div>
                </div>
                <Button variant="secondary" className="w-full">Ver Mapa</Button>
              </div>
            </div>

            <div className="card">
              <div className="card-content">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Equipe</h3>
                    <p className="text-sm text-gray-600">Gerenciar entregadores</p>
                  </div>
                </div>
                <Button variant="secondary" className="w-full">Gerenciar</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Status do Sistema */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Status do Sistema</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Operacional</span>
              </div>
            </div>
          </div>
          <div className="card-content">
            <div className="grid grid-4">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">API</p>
                <p className="text-xs text-green-600">Online</p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Banco</p>
                <p className="text-xs text-green-600">Online</p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Notificações</p>
                <p className="text-xs text-green-600">Online</p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Pagamentos</p>
                <p className="text-xs text-green-600">Online</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}