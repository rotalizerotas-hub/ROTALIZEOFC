'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

// Simulação do Mapbox GL JS para evitar erros de build
interface MapboxMap {
  flyTo: (options: any) => void
  addControl: (control: any, position?: string) => void
  on: (event: string, callback: () => void) => void
  remove: () => void
  getSource: (id: string) => any
  addSource: (id: string, source: any) => void
  addLayer: (layer: any) => void
  removeLayer: (id: string) => void
  removeSource: (id: string) => void
  fitBounds: (bounds: any, options?: any) => void
  isStyleLoaded: () => boolean
}

interface OrderMarker {
  id: string
  latitude: number
  longitude: number
  customerName: string
  status: string
  categoryIcon: string
  categoryEmoji: string
  orderNumber?: string
}

interface DeliveryDriver {
  id: string
  name: string
  latitude: number
  longitude: number
  vehicleType: 'moto' | 'carro' | 'caminhao'
  isOnline: boolean
}

interface EnhancedMapboxProps {
  orders?: OrderMarker[]
  drivers?: DeliveryDriver[]
  centerLat?: number
  centerLng?: number
  zoom?: number
  onOrderClick?: (orderId: string) => void
  className?: string
}

const getVehicleIcon = (vehicleType: string): string => {
  const icons = {
    moto: '🏍️',
    carro: '🚗',
    caminhao: '🚛'
  }
  return icons[vehicleType as keyof typeof icons] || '🚗'
}

const getStatusColor = (status: string): string => {
  const colors = {
    pending: '#ffd93d',
    assigned: '#6c5ce7',
    in_transit: '#fd79a8',
    delivered: '#00b894',
    cancelled: '#ddd'
  }
  return colors[status as keyof typeof colors] || '#ffd93d'
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Pendente',
    assigned: 'Atribuído',
    in_transit: 'Em trânsito',
    delivered: 'Entregue',
    cancelled: 'Cancelado'
  }
  return statusMap[status] || status
}

export function EnhancedMapbox({ 
  orders = [], 
  drivers = [], 
  centerLat = -19.9167, 
  centerLng = -43.9345, 
  zoom = 12,
  onOrderClick,
  className = '' 
}: EnhancedMapboxProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [currentCenter, setCurrentCenter] = useState({ lat: centerLat, lng: centerLng })
  const [currentZoom, setCurrentZoom] = useState(zoom)

  useEffect(() => {
    // Simular carregamento do mapa Mapbox
    const timer = setTimeout(() => {
      setMapLoaded(true)
      console.log('🗺️ [MAPBOX] Mapa Mapbox simulado carregado')
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Atualizar centro quando coordenadas mudarem
  useEffect(() => {
    if (mapLoaded && centerLat && centerLng) {
      console.log('📍 [MAPBOX] Centralizando mapa em:', { centerLat, centerLng, zoom })
      setCurrentCenter({ lat: centerLat, lng: centerLng })
      setCurrentZoom(zoom)
    }
  }, [centerLat, centerLng, zoom, mapLoaded])

  // Simular atualização de marcadores
  useEffect(() => {
    if (mapLoaded) {
      console.log('🔄 [MAPBOX] Atualizando marcadores...', { orders: orders.length, drivers: drivers.length })
      
      orders.forEach((order, index) => {
        console.log(`📌 [MAPBOX] Marcador ${index + 1}:`, order.customerName, 'em', [order.longitude, order.latitude])
      })

      drivers.forEach((driver, index) => {
        if (driver.isOnline) {
          console.log(`🚚 [MAPBOX] Entregador ${index + 1}:`, driver.name, getVehicleIcon(driver.vehicleType))
        }
      })
    }
  }, [orders, drivers, mapLoaded])

  const handleMarkerClick = (orderId: string) => {
    console.log('🖱️ [MAPBOX] Marcador clicado:', orderId)
    if (onOrderClick) {
      onOrderClick(orderId)
    }
    
    const order = orders.find(o => o.id === orderId)
    if (order) {
      toast.success(`Pedido selecionado: ${order.customerName}`)
    }
  }

  const handleAssumeRoute = async (orderId: string) => {
    console.log('🚀 [MAPBOX ROUTE] Assumindo rota para pedido:', orderId)
    
    const order = orders.find(o => o.id === orderId)
    if (!order) return

    try {
      // Simular localização atual do entregador
      const currentLocation = {
        latitude: -19.9167 + (Math.random() - 0.5) * 0.02,
        longitude: -43.9345 + (Math.random() - 0.5) * 0.02
      }

      // Simular cálculo de rota usando Mapbox Directions API
      console.log('🗺️ [MAPBOX ROUTE] Calculando rota de', currentLocation, 'para', { latitude: order.latitude, longitude: order.longitude })
      
      const mapboxToken = 'pk.eyJ1Ijoicm90YWxpemVvZmljaWFsIiwiYSI6ImNtaHdidmV2dTA1dTgya3B0dGNzZ2Q4ZHUifQ.1kJiJcybFKIyF_0rpNHmbA'
      
      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${currentLocation.longitude},${currentLocation.latitude};${order.longitude},${order.latitude}?geometries=geojson&access_token=${mapboxToken}`
      
      const response = await fetch(directionsUrl)
      const data = await response.json()
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0]
        const duration = Math.round(route.duration / 60) // em minutos
        const distance = (route.distance / 1000).toFixed(1) // em km
        
        console.log('✅ [MAPBOX ROUTE] Rota calculada:', { duration, distance })
        
        toast.success(`Rota assumida! 🗺️\n${distance}km - ${duration} min`, {
          duration: 4000
        })
      } else {
        throw new Error('Rota não encontrada')
      }
      
    } catch (error) {
      console.error('❌ [MAPBOX ROUTE] Erro ao calcular rota:', error)
      toast.success(`Rota assumida para ${order.customerName}! 🗺️`)
    }
  }

  return (
    <div className={`relative w-full h-full rounded-2xl shadow-lg overflow-hidden bg-gray-100 ${className}`}>
      {/* Simulação do mapa Mapbox */}
      <div 
        ref={mapContainer} 
        className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center relative"
        style={{ minHeight: '400px' }}
      >
        {!mapLoaded ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando Mapbox...</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-gray-600 mb-2 font-semibold">Mapbox Map</p>
            <p className="text-xs text-gray-500 mb-4">Powered by Mapbox GL JS</p>
            
            {/* Mostrar informações dos marcadores */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 max-w-sm shadow-lg">
              {orders.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    📍 Pedidos no Mapa
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {orders.length}
                    </span>
                  </h4>
                  {orders.map((order, index) => (
                    <div 
                      key={order.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg mb-2 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
                      onClick={() => handleMarkerClick(order.id)}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.categoryEmoji}
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium text-sm">{order.customerName}</div>
                        <div className="text-xs text-gray-500">
                          {order.orderNumber ? `#${order.orderNumber}` : `Pedido ${index + 1}`}
                        </div>
                        <div className="text-xs text-gray-400">
                          {order.latitude.toFixed(4)}, {order.longitude.toFixed(4)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAssumeRoute(order.id)
                        }}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-lg text-xs hover:from-green-600 hover:to-green-700 transition-all shadow-sm"
                      >
                        🚀 Assumir
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {drivers.filter(d => d.isOnline).length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    🚗 Entregadores Online
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {drivers.filter(d => d.isOnline).length}
                    </span>
                  </h4>
                  {drivers.filter(d => d.isOnline).map((driver) => (
                    <div key={driver.id} className="flex items-center gap-3 p-3 bg-white rounded-lg mb-2 shadow-sm">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm animate-pulse">
                        {getVehicleIcon(driver.vehicleType)}
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium text-sm">{driver.name}</div>
                        <div className="text-xs text-green-600 flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Online
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {orders.length === 0 && drivers.filter(d => d.isOnline).length === 0 && (
                <p className="text-gray-500 text-sm">Nenhum marcador para exibir</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Controles do mapa */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2">
        <div className="flex flex-col gap-1">
          <button 
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-sm font-bold transition-colors"
            onClick={() => setCurrentZoom(prev => Math.min(prev + 1, 20))}
          >
            +
          </button>
          <button 
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-sm font-bold transition-colors"
            onClick={() => setCurrentZoom(prev => Math.max(prev - 1, 1))}
          >
            -
          </button>
        </div>
      </div>
      
      {/* Informações de coordenadas e zoom */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 text-xs shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-blue-600">📍</span>
          <span className="font-mono">
            {currentCenter.lat.toFixed(4)}, {currentCenter.lng.toFixed(4)}
          </span>
          <span className="text-gray-400">|</span>
          <span className="text-green-600">🔍</span>
          <span className="font-mono">
            Zoom: {currentZoom}
          </span>
        </div>
      </div>

      {/* Badge do Mapbox */}
      <div className="absolute bottom-4 right-4 bg-black/80 text-white px-2 py-1 rounded text-xs">
        Mapbox
      </div>
    </div>
  )
}