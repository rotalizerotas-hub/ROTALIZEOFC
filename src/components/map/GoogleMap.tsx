'use client'

import { useEffect, useRef, useState } from 'react'
import { config } from '@/lib/config'

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

interface GoogleMapProps {
  orders?: OrderMarker[]
  drivers?: DeliveryDriver[]
  centerLat?: number
  centerLng?: number
  zoom?: number
  onOrderClick?: (orderId: string) => void
  className?: string
  height?: string
}

export function GoogleMap({ 
  orders = [], 
  drivers = [], 
  centerLat = -19.9167, 
  centerLng = -43.9345, 
  zoom = 12,
  onOrderClick,
  className = '',
  height = '100%'
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!config.googleMaps.apiKey) {
      console.log('⚠️ [GOOGLE MAPS] API Key não configurada, usando mapa simulado')
      setIsLoaded(true)
      return
    }

    // Verificar se Google Maps já está carregado
    if (window.google && window.google.maps) {
      setIsLoaded(true)
      return
    }

    // Carregar Google Maps
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMaps.apiKey}&libraries=places`
    script.async = true
    script.onload = () => {
      console.log('✅ [GOOGLE MAPS] API carregada')
      setIsLoaded(true)
    }
    script.onerror = () => {
      console.error('❌ [GOOGLE MAPS] Erro ao carregar API')
      setError('Erro ao carregar Google Maps')
      setIsLoaded(true) // Mostrar mapa simulado
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup se necessário
    }
  }, [])

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return

    try {
      if (window.google && window.google.maps) {
        // Inicializar Google Maps real
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: centerLat, lng: centerLng },
          zoom: zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        })

        // Adicionar marcadores simples
        orders.forEach(order => {
          new google.maps.Marker({
            position: { lat: order.latitude, lng: order.longitude },
            map: map,
            title: order.customerName
          })
        })

        drivers.forEach(driver => {
          if (driver.isOnline) {
            new google.maps.Marker({
              position: { lat: driver.latitude, lng: driver.longitude },
              map: map,
              title: driver.name,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="8" fill="#00b894" stroke="white" stroke-width="2"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(20, 20)
              }
            })
          }
        })

        console.log('🗺️ [GOOGLE MAPS] Mapa inicializado com sucesso')
      }
    } catch (error) {
      console.error('❌ [GOOGLE MAPS] Erro ao inicializar:', error)
    }
  }, [isLoaded, centerLat, centerLng, zoom, orders, drivers])

  if (error) {
    return (
      <div className={`w-full rounded-2xl shadow-lg overflow-hidden bg-red-50 flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center p-8">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Erro no Mapa</h3>
          <p className="text-red-600">Não foi possível carregar o Google Maps</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={`w-full rounded-2xl shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    )
  }

  // Mapa simulado se Google Maps não estiver disponível
  if (!window.google || !window.google.maps) {
    return (
      <div className={`w-full rounded-2xl shadow-lg overflow-hidden bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center p-8">
          <div className="text-blue-500 text-4xl mb-4">🗺️</div>
          <h3 className="text-lg font-medium text-blue-800 mb-2">Mapa Simulado</h3>
          <p className="text-blue-600">
            {orders.length > 0 && `${orders.length} pedido(s) `}
            {drivers.length > 0 && `${drivers.length} entregador(es)`}
          </p>
          <div className="mt-4 space-y-2">
            {orders.slice(0, 3).map(order => (
              <div key={order.id} className="bg-white/80 rounded-lg p-2 text-sm">
                {order.categoryEmoji} {order.customerName}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={mapRef} 
      className={`w-full rounded-2xl shadow-lg overflow-hidden ${className}`}
      style={{ height }}
    />
  )
}