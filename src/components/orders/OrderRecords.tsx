'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, FileText, Search, Calendar, User, Clock, MapPin, Camera, Route, CheckCircle, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface OrderRecord {
  id: string
  customer_name: string
  customer_phone: string
  delivery_address: string
  value: number
  status: string
  created_at: string
  route_started_at: string | null
  route_finished_at: string | null
  route_distance_km: number | null
  route_duration_minutes: number | null
  delivery_notes: string | null
  delivery_photo_url: string | null
  delivery_driver_id: string | null
  establishment_types: {
    name: string
    emoji: string
  } | null
  delivery_drivers: {
    profiles: {
      full_name: string
    }
  } | null
}

interface DeliveryDriver {
  id: string
  profiles: {
    full_name: string
  }
}

export function OrderRecords() {
  const { user } = useAuth()
  const router = useRouter()
  const [orderRecords, setOrderRecords] = useState<OrderRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<OrderRecord[]>([])
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados dos filtros
  const [searchName, setSearchName] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterDriver, setFilterDriver] = useState('')

  useEffect(() => {
    if (user) {
      loadOrderRecords()
      loadDrivers()
    }
  }, [user])

  useEffect(() => {
    applyFilters()
  }, [orderRecords, searchName, filterDate, filterDriver])

  const loadOrderRecords = async () => {
    if (!user) return

    try {
      console.log('📋 [REGISTROS] Carregando registros de pedidos...')

      // Buscar organizações do usuário
      const { data: userOrgs } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)

      const orgIds = userOrgs?.map(uo => uo.organization_id) || []

      if (orgIds.length === 0) {
        setOrderRecords([])
        setLoading(false)
        return
      }

      // Buscar todos os registros de pedidos
      const { data: recordsData } = await supabase
        .from('orders')
        .select(`
          id,
          customer_name,
          customer_phone,
          delivery_address,
          value,
          status,
          created_at,
          route_started_at,
          route_finished_at,
          route_distance_km,
          route_duration_minutes,
          delivery_notes,
          delivery_photo_url,
          delivery_driver_id,
          establishment_types (
            name,
            emoji
          ),
          delivery_drivers (
            profiles (
              full_name
            )
          )
        `)
        .in('organization_id', orgIds)
        .order('created_at', { ascending: false })

      // Mapear os dados e corrigir os formatos
      const processedRecords: OrderRecord[] = recordsData?.map((record: any) => {
        // Corrigir establishment_types (garantir que é um objeto, não um array)
        const establishmentTypes = Array.isArray(record.establishment_types) && record.establishment_types.length > 0
          ? {
              name: record.establishment_types[0].name || 'Estabelecimento',
              emoji: record.establishment_types[0].emoji || '📦'
            }
          : record.establishment_types || null;

        // Corrigir delivery_drivers (garantir que é um objeto com profiles.full_name)
        const deliveryDrivers = record.delivery_drivers && Array.isArray(record.delivery_drivers) && record.delivery_drivers.length > 0
          ? {
              profiles: {
                full_name: record.delivery_drivers[0].profiles && Array.isArray(record.delivery_drivers[0].profiles) 
                  ? record.delivery_drivers[0].profiles[0]?.full_name || 'Entregador'
                  : record.delivery_drivers[0].profiles?.full_name || 'Entregador'
              }
            }
          : record.delivery_drivers || null;

        return {
          id: record.id,
          customer_name: record.customer_name,
          customer_phone: record.customer_phone,
          delivery_address: record.delivery_address,
          value: record.value,
          status: record.status,
          created_at: record.created_at,
          route_started_at: record.route_started_at,
          route_finished_at: record.route_finished_at,
          route_distance_km: record.route_distance_km,
          route_duration_minutes: record.route_duration_minutes,
          delivery_notes: record.delivery_notes,
          delivery_photo_url: record.delivery_photo_url,
          delivery_driver_id: record.delivery_driver_id,
          establishment_types: establishmentTypes,
          delivery_drivers: deliveryDrivers
        };
      }) || [];

      setOrderRecords(processedRecords);
      console.log('✅ [REGISTROS] Registros carregados:', processedRecords.length || 0);

    } catch (error) {
      console.error('❌ [REGISTROS] Erro ao carregar registros:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDrivers = async () => {
    if (!user) return

    try {
      // Buscar organizações do usuário
      const { data: userOrgs } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)

      const orgIds = userOrgs?.map(uo => uo.organization_id) || []

      if (orgIds.length === 0) return

      // Buscar entregadores
      const { data: driversData } = await supabase
        .from('delivery_drivers')
        .select(`
          id,
          profiles (
            full_name
          )
        `)
        .in('organization_id', orgIds)

      // Corrigir o formato dos dados dos entregadores
      const processedDrivers: DeliveryDriver[] = driversData?.map((driver: any) => {
        // Garantir que profiles seja um objeto com full_name
        const profiles = Array.isArray(driver.profiles) && driver.profiles.length > 0
          ? { full_name: driver.profiles[0].full_name || 'Entregador' }
          : driver.profiles || { full_name: 'Entregador' };

        return {
          id: driver.id,
          profiles: profiles
        };
      }) || [];

      setDrivers(processedDrivers)
    } catch (error) {
      console.error('❌ [REGISTROS] Erro ao carregar entregadores:', error)
    }
  }

  const applyFilters = () => {
    let filtered = [...orderRecords]

    // Filtro por nome do cliente
    if (searchName.trim()) {
      filtered = filtered.filter(record =>
        record.customer_name.toLowerCase().includes(searchName.toLowerCase())
      )
    }

    // Filtro por data
    if (filterDate) {
      filtered = filtered.filter(record =>
        record.created_at.startsWith(filterDate)
      )
    }

    // Filtro por entregador
    if (filterDriver) {
      filtered = filtered.filter(record =>
        record.delivery_driver_id === filterDriver
      )
    }

    setFilteredRecords(filtered)
  }

  const clearFilters = () => {
    setSearchName('')
    setFilterDate('')
    setFilterDriver('')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary' as const },
      assigned: { label: 'Atribuído', variant: 'outline' as const },
      in_transit: { label: 'Em trânsito', variant: 'default' as const },
      delivered: { label: 'Entregue', variant: 'default' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return (
      <Badge variant={config.variant} className="rounded-full">
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg mb-4 animate-pulse">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Carregando registros...</p>
        </div>
      </div>
    )
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
                  Registros de Pedidos
                </h1>
                <p className="text-sm text-gray-600">Histórico completo de entregas</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros e Busca
            </CardTitle>
            <CardDescription>
              Busque e filtre os registros de pedidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Busca por Nome */}
              <div className="space-y-2">
                <Label htmlFor="search-name" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Buscar por Nome
                </Label>
                <Input
                  id="search-name"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Digite o nome do cliente..."
                  className="rounded-xl"
                />
              </div>

              {/* Filtro por Data */}
              <div className="space-y-2">
                <Label htmlFor="filter-date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Filtrar por Data
                </Label>
                <Input
                  id="filter-date"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              {/* Filtro por Entregador */}
              <div className="space-y-2">
                <Label htmlFor="filter-driver" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Filtrar por Entregador
                </Label>
                <Select value={filterDriver} onValueChange={setFilterDriver}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Todos os entregadores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os entregadores</SelectItem>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.profiles.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Botão Limpar Filtros */}
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="w-full rounded-xl"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>

            {/* Contador de Resultados */}
            <div className="mt-4 text-sm text-gray-600">
              Exibindo {filteredRecords.length} de {orderRecords.length} registros
            </div>
          </CardContent>
        </Card>

        {/* Lista de Registros */}
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <Card key={record.id} className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Informações Principais */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                        <span className="text-xl">
                          {record.establishment_types?.emoji || '📦'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{record.customer_name}</h3>
                        <p className="text-sm text-gray-600">{record.customer_phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <p className="text-sm text-gray-700">{record.delivery_address}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-green-600">R$ {record.value.toFixed(2)}</span>
                      {getStatusBadge(record.status)}
                    </div>

                    {/* Entregador */}
                    {record.delivery_drivers && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-700">
                          {record.delivery_drivers.profiles.full_name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Informações da Rota */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-800 flex items-center gap-2">
                      <Route className="w-4 h-4" />
                      Dados da Rota
                    </h4>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-blue-500" />
                        <span className="text-gray-600">Criado:</span>
                        <span className="font-medium">{formatDate(record.created_at)}</span>
                      </div>
                      
                      {record.route_started_at && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-orange-500" />
                          <span className="text-gray-600">Iniciado:</span>
                          <span className="font-medium">{formatDate(record.route_started_at)}</span>
                        </div>
                      )}
                      
                      {record.route_finished_at && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-gray-600">Finalizado:</span>
                          <span className="font-medium">{formatDate(record.route_finished_at)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">Distância:</span>
                          <span className="font-medium">
                            {record.route_distance_km ? `${record.route_distance_km.toFixed(1)} km` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">Duração:</span>
                          <span className="font-medium">{formatDuration(record.route_duration_minutes)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comprovante de Entrega */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-800 flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Comprovante
                    </h4>
                    
                    {record.delivery_notes && (
                      <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Observação:</span> {record.delivery_notes}
                        </p>
                      </div>
                    )}
                    
                    {record.delivery_photo_url ? (
                      <div className="space-y-2">
                        <p className="text-sm text-green-600 font-medium">✅ Foto de entrega anexada</p>
                        <img 
                          src={record.delivery_photo_url} 
                          alt="Comprovante de entrega"
                          className="w-full h-24 object-cover rounded-xl border border-gray-200"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">📷 Nenhuma foto anexada</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredRecords.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {orderRecords.length === 0 ? 'Nenhum registro encontrado' : 'Nenhum resultado para os filtros aplicados'}
              </h3>
              <p className="text-gray-600">
                {orderRecords.length === 0 
                  ? 'Os registros de pedidos aparecerão aqui conforme as entregas forem realizadas'
                  : 'Tente ajustar os filtros para encontrar os registros desejados'
                }
              </p>
              {orderRecords.length > 0 && (
                <Button onClick={clearFilters} className="mt-4 rounded-xl">
                  Limpar Filtros
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}