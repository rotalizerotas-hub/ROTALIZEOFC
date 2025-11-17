'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Users, Plus, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface DeliveryDriver {
  id: string
  user_id: string
  is_online: boolean
  total_today: number
  profiles: {
    full_name: string
    phone: string
    email: string
  }
  current_latitude: number | null
  current_longitude: number | null
}

export function DriversManagement() {
  const { user } = useAuth()
  const router = useRouter()
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDrivers()
  }, [user])

  const loadDrivers = async () => {
    if (!user) return

    try {
      // Buscar organizações do usuário
      const { data: userOrgs } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)

      const orgIds = userOrgs?.map(uo => uo.organization_id) || []

      // Buscar entregadores das organizações
      const { data } = await supabase
        .from('delivery_drivers')
        .select(`
          *,
          profiles (
            full_name,
            phone,
            email
          )
        `)
        .in('organization_id', orgIds)

      setDrivers(data || [])
    } catch (error) {
      console.error('Erro ao carregar entregadores:', error)
      toast.error('Erro ao carregar entregadores')
    } finally {
      setLoading(false)
    }
  }

  const toggleDriverStatus = async (driverId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('delivery_drivers')
        .update({ 
          is_online: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId)

      if (error) throw error

      setDrivers(prev => prev.map(driver => 
        driver.id === driverId 
          ? { ...driver, is_online: !currentStatus }
          : driver
      ))

      toast.success(`Motoboy ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`)
    } catch (error) {
      console.error('Erro ao alterar status do entregador:', error)
      toast.error('Erro ao alterar status do entregador')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg mb-4 animate-pulse">
            <Users className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Carregando motoboys...</p>
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
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="rounded-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    Motoboys
                  </h1>
                  <p className="text-sm text-gray-600">Gerenciar entregadores</p>
                </div>
              </div>
            </div>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white rounded-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Cadastrar Motoboy
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Motoboys
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {drivers.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Online Agora
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {drivers.filter(d => d.is_online).length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Receita Total Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                R$ {drivers.reduce((sum, driver) => sum + driver.total_today, 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Motoboys */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Lista de Motoboys
            </CardTitle>
            <CardDescription>
              Gerencie o status e acompanhe o desempenho dos entregadores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {drivers.map((driver) => (
                <div 
                  key={driver.id} 
                  className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {driver.profiles.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        driver.is_online ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {driver.profiles.full_name || 'Nome não informado'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {driver.profiles.phone} • {driver.profiles.email}
                      </p>
                      {driver.current_latitude && driver.current_longitude && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>
                            {driver.current_latitude.toFixed(4)}, {driver.current_longitude.toFixed(4)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Hoje</p>
                      <p className="font-semibold text-green-600">
                        R$ {driver.total_today.toFixed(2)}
                      </p>
                    </div>

                    <Badge 
                      variant={driver.is_online ? 'default' : 'secondary'}
                      className="rounded-full"
                    >
                      {driver.is_online ? 'Online' : 'Offline'}
                    </Badge>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {driver.is_online ? 'Ativo' : 'Inativo'}
                      </span>
                      <Switch
                        checked={driver.is_online}
                        onCheckedChange={() => toggleDriverStatus(driver.id, driver.is_online)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {drivers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum motoboy cadastrado
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Comece cadastrando seu primeiro entregador
                  </p>
                  <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white rounded-xl">
                    <Plus className="w-5 h-5 mr-2" />
                    Cadastrar Primeiro Motoboy
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}