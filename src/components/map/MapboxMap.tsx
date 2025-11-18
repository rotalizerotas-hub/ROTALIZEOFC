'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

interface MapboxMapProps {
  orders?: Array<{
    id: string
    latitude: number
    longitude: number
    customerName: string
    status: string
    categoryEmoji: string
    orderNumber?: string
  }>
  centerLat?: number
  centerLng?: number
  zoom?: number
  onOrderClick?: (orderId: string) => void
  className?: string
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

// Função para validar coordenadas
const isValidCoordinate = (lat: number, lng: number): boolean => {
  return (
    typeof lat === 'number' && 
    typeof lng === 'number' && 
    !isNaN(lat) && 
    !isNaN(lng) && 
    isFinite(lat) && 
    isFinite(lng) &&
    lat >= -90 && 
    lat <= 90 && 
    lng >= -180 && 
    lng <= 180
  )
}

export function MapboxMap({ 
  orders = [], 
  centerLat = -19.9167, 
  centerLng = -43.9345, 
  zoom = 12,
  onOrderClick,
  className = '' 
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    // Simular carregamento do mapa para evitar erros
    const timer = setTimeout(() => {
      setMapLoaded(true)
      console.log('🗺️ [MAPBOX] Mapa simulado carregado')
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

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

  const handleAssumeRoute = (orderId: string) => {
    console.log('🚀 [ROUTE] Assumindo rota para:', orderId)
    const order = orders.find(o => o.id === orderId)
    if (order) {
      toast.success(`Rota assumida para ${order.customerName}! 🗺️`)
    }
  }

  // Filtrar apenas pedidos com coordenadas válidas
  const validOrders = orders.filter(order => 
    isValidCoordinate(order.latitude, order.longitude)
  )

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
            <p className="text-gray-600">Carregando Mapbox...</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-gray-600 mb-2 font-semibold">Mapa Simulado</p>
            <p className="text-xs text-gray-500 mb-4">Coordenadas: {centerLat.toFixed(4)}, {centerLng.toFixed(4)}</p>
            
            {/* Mostrar informações dos marcadores */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 max-w-sm shadow-lg">
              {validOrders.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    📍 Pedidos no Mapa
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {validOrders.length}
                    </span>
                  </h4>
                  {validOrders.map((order, index) => (
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
              
              {validOrders.length === 0 && (
                <p className="text-gray-500 text-sm">Nenhum marcador para exibir</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Controles do mapa */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2">
        <div className="flex flex-col gap-1">
          <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-sm font-bold transition-colors">
            +
          </button>
          <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-sm font-bold transition-colors">
            -
          </button>
        </div>
      </div>
      
      {/* Informações de coordenadas */}
      {centerLat && centerLng && (
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 text-xs shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">📍</span>
            <span className="font-mono">
              {centerLat.toFixed(4)}, {centerLng.toFixed(4)}
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-green-600">🔍</span>
            <span className="font-mono">
              Zoom: {zoom}
            </span>
          </div>
        </div>
      )}

      {/* Badge do Mapbox */}
      <div className="absolute bottom-4 right-4 bg-black/80 text-white px-2 py-1 rounded text-xs">
        Mapbox Simulado
      </div>
    </div>
  )
}