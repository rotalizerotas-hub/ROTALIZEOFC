'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

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

  useEffect(() => {
    // Simular carregamento do mapa
    const timer = setTimeout(() => {
      setMapLoaded(true)
      console.log('🗺️ [MAP] Mapa simulado carregado')
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Simular atualização de marcadores
  useEffect(() => {
    if (mapLoaded) {
      console.log('🔄 [MAP] Atualizando marcadores...', { orders: orders.length, drivers: drivers.length })
      
      orders.forEach((order, index) => {
        console.log(`📌 [MAP] Marcador ${index + 1}:`, order.customerName, 'em', [order.longitude, order.latitude])
      })

      drivers.forEach((driver, index) => {
        if (driver.isOnline) {
          console.log(`🚚 [MAP] Entregador ${index + 1}:`, driver.name, getVehicleIcon(driver.vehicleType))
        }
      })
    }
  }, [orders, drivers, mapLoaded])

  // Simular centralização do mapa
  useEffect(() => {
    if (mapLoaded && centerLat && centerLng) {
      console.log('📍 [MAP] Centralizando mapa em:', { centerLat, centerLng, zoom })
    }
  }, [centerLat, centerLng, zoom, mapLoaded])

  const handleMarkerClick = (orderId: string) => {
    console.log('🖱️ [MAP] Marcador clicado:', orderId)
    if (onOrderClick) {
      onOrderClick(orderId)
    }
    
    const order = orders.find(o => o.id === orderId)
    if (order) {
      toast.success(`Pedido selecionado: ${order.customerName}`)
    }
  }

  const handleAssumeRoute = (orderId: string) => {
    console.log('🚀 [ROUTE] Assumindo rota para pedido:', orderId)
    
    const order = orders.find(o => o.id === orderId)
    if (order) {
      toast.success(`Rota assumida para ${order.customerName}! 🗺️`)
    }
  }

  return (
    <div className={`relative w-full h-full rounded-2xl shadow-lg overflow-hidden bg-gray-100 ${className}`}>
      {/* Simulação do mapa */}
      <div 
        ref={mapContainer} 
        className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center"
        style={{ minHeight: '400px' }}
      >
        {!mapLoaded ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando mapa...</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-gray-600 mb-4">Mapa Simulado</p>
            
            {/* Mostrar informações dos marcadores */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 max-w-sm">
              {orders.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">📍 Pedidos no Mapa:</h4>
                  {orders.map((order, index) => (
                    <div 
                      key={order.id}
                      className="flex items-center gap-2 p-2 bg-white rounded-lg mb-2 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleMarkerClick(order.id)}
                    >
                      <span className="text-lg">{order.categoryEmoji}</span>
                      <div className="text-left flex-1">
                        <div className="font-medium text-sm">{order.customerName}</div>
                        <div className="text-xs text-gray-500">
                          {order.orderNumber ? `#${order.orderNumber}` : `Pedido ${index + 1}`}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAssumeRoute(order.id)
                        }}
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                      >
                        🚀 Assumir
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {drivers.filter(d => d.isOnline).length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">🚗 Entregadores Online:</h4>
                  {drivers.filter(d => d.isOnline).map((driver) => (
                    <div key={driver.id} className="flex items-center gap-2 p-2 bg-white rounded-lg mb-2">
                      <span className="text-lg">{getVehicleIcon(driver.vehicleType)}</span>
                      <div className="text-left flex-1">
                        <div className="font-medium text-sm">{driver.name}</div>
                        <div className="text-xs text-green-600">Online</div>
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
      
      {/* Controles simulados */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2">
        <div className="flex flex-col gap-1">
          <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-sm font-bold">+</button>
          <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-sm font-bold">-</button>
        </div>
      </div>
      
      {/* Informações de coordenadas */}
      {centerLat && centerLng && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs">
          📍 {centerLat.toFixed(4)}, {centerLng.toFixed(4)} | Zoom: {zoom}
        </div>
      )}
    </div>
  )
}