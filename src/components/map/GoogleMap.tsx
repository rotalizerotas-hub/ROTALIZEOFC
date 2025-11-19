'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
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
    cancelled: '#ddd',
    preview: '#3b82f6'
  }
  return colors[status as keyof typeof colors] || '#ddd'
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

// Função para carregar Google Maps API
const loadGoogleMapsAPI = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Verificar se já está carregado
    if (window.google && window.google.maps) {
      resolve()
      return
    }

    // Verificar se já existe um script carregando
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve())
      existingScript.addEventListener('error', reject)
      return
    }

    // Criar script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initGoogleMaps`
    script.async = true
    script.defer = true

    // Callback global
    ;(window as any).initGoogleMaps = () => {
      resolve()
      delete (window as any).initGoogleMaps
    }

    script.addEventListener('error', reject)
    document.head.appendChild(script)
  })
}

export function GoogleMap({ 
  orders = [], 
  drivers = [], 
  centerLat = config.defaultLocation.latitude, 
  centerLng = config.defaultLocation.longitude, 
  zoom = config.defaultLocation.zoom,
  onOrderClick,
  className = '',
  height = '100%'
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])

  // Carregar Google Maps API
  useEffect(() => {
    if (!config.googleMaps.apiKey) {
      setError('Chave da API do Google Maps não configurada')
      return
    }

    loadGoogleMapsAPI(config.googleMaps.apiKey)
      .then(() => {
        console.log('✅ [GOOGLE MAPS] API carregada com sucesso')
        setIsLoaded(true)
      })
      .catch((error) => {
        console.error('❌ [GOOGLE MAPS] Erro ao carregar API:', error)
        setError('Erro ao carregar Google Maps')
      })
  }, [])

  // Inicializar mapa
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return

    try {
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom: zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM
        }
      })

      setMap(mapInstance)
      console.log('🗺️ [GOOGLE MAPS] Mapa inicializado')
    } catch (error) {
      console.error('❌ [GOOGLE MAPS] Erro ao inicializar mapa:', error)
      setError('Erro ao inicializar mapa')
    }
  }, [isLoaded, centerLat, centerLng, zoom, map])

  // Limpar marcadores existentes
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []
  }, [])

  // Criar marcador customizado para pedidos
  const createOrderMarker = useCallback((order: OrderMarker) => {
    if (!map) return null

    const isPreview = order.id === 'preview'
    const backgroundColor = getStatusColor(isPreview ? 'preview' : order.status)
    
    // Criar ícone customizado usando SVG
    const svgIcon = {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="${isPreview ? '50' : '40'}" height="${isPreview ? '50' : '40'}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="${isPreview ? '25' : '20'}" cy="${isPreview ? '25' : '20'}" r="${isPreview ? '22' : '17'}" 
                  fill="${backgroundColor}" stroke="white" stroke-width="3"/>
          <text x="50%" y="50%" text-anchor="middle" dy="0.3em" 
                font-size="${isPreview ? '22' : '18'}" fill="black">${order.categoryEmoji || '📍'}</text>
        </svg>
      `)}`,
      scaledSize: new google.maps.Size(isPreview ? 50 : 40, isPreview ? 50 : 40),
      anchor: new google.maps.Point(isPreview ? 25 : 20, isPreview ? 50 : 40)
    }

    const marker = new google.maps.Marker({
      position: { lat: order.latitude, lng: order.longitude },
      map: map,
      icon: svgIcon,
      title: order.customerName
    })

    // InfoWindow para detalhes do pedido
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; min-width: 200px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 20px;">${order.categoryEmoji || '📍'}</span>
            <h3 style="margin: 0; font-weight: 600; color: #333;">${order.customerName}</h3>
          </div>
          ${order.orderNumber ? `
            <p style="margin: 4px 0; color: #666; font-size: 14px;">
              Pedido #${order.orderNumber}
            </p>
          ` : ''}
          <p style="margin: 4px 0; color: #666; font-size: 14px;">
            Status: ${isPreview ? 'Preview' : getStatusText(order.status)}
          </p>
          ${!isPreview ? `
            <button 
              onclick="assumeRoute('${order.id}')"
              style="
                background: linear-gradient(45deg, #00b894, #00cec9);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                margin-top: 8px;
                width: 100%;
              "
            >
              🚀 Assumir Rota
            </button>
          ` : `
            <p style="margin: 8px 0 0 0; color: #3b82f6; font-size: 12px; font-style: italic;">
              📍 Localização encontrada
            </p>
          `}
        </div>
      `
    })

    // Adicionar evento de clique
    marker.addListener('click', () => {
      console.log('🖱️ [GOOGLE MAPS] Clique no marcador:', order.id)
      infoWindow.open(map, marker)
      if (onOrderClick && !isPreview) {
        onOrderClick(order.id)
      }
    })

    return marker
  }, [map, onOrderClick])

  // Criar marcador para entregadores
  const createDriverMarker = useCallback((driver: DeliveryDriver) => {
    if (!map || !driver.isOnline) return null

    // Criar ícone customizado para entregador
    const svgIcon = {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="35" height="35" xmlns="http://www.w3.org/2000/svg">
          <circle cx="17.5" cy="17.5" r="15" fill="#00b894" stroke="white" stroke-width="2"/>
          <text x="50%" y="50%" text-anchor="middle" dy="0.3em" 
                font-size="16" fill="white">${getVehicleIcon(driver.vehicleType)}</text>
        </svg>
      `)}`,
      scaledSize: new google.maps.Size(35, 35),
      anchor: new google.maps.Point(17, 35)
    }

    const marker = new google.maps.Marker({
      position: { lat: driver.latitude, lng: driver.longitude },
      map: map,
      icon: svgIcon,
      title: driver.name
    })

    // InfoWindow para detalhes do entregador
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 18px;">${getVehicleIcon(driver.vehicleType)}</span>
            <h3 style="margin: 0; font-weight: 600; color: #333;">${driver.name}</h3>
          </div>
          <p style="margin: 4px 0; color: #00b894; font-size: 14px;">
            <span style="display: inline-block; width: 8px; height: 8px; background: #00b894; border-radius: 50%; margin-right: 6px;"></span>
            Online
          </p>
        </div>
      `
    })

    marker.addListener('click', () => {
      infoWindow.open(map, marker)
    })

    return marker
  }, [map])

  // Atualizar marcadores quando dados mudarem
  useEffect(() => {
    if (!map) return

    console.log('🗺️ [GOOGLE MAPS] Atualizando marcadores:', { 
      orders: orders.length, 
      drivers: drivers.length 
    })

    // Limpar marcadores existentes
    clearMarkers()

    // Adicionar marcadores de pedidos
    orders.forEach(order => {
      const marker = createOrderMarker(order)
      if (marker) {
        markersRef.current.push(marker)
      }
    })

    // Adicionar marcadores de entregadores
    drivers.forEach(driver => {
      const marker = createDriverMarker(driver)
      if (marker) {
        markersRef.current.push(marker)
      }
    })

    // Ajustar visualização se houver marcadores
    if (orders.length > 0 || drivers.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      
      orders.forEach(order => {
        bounds.extend({ lat: order.latitude, lng: order.longitude })
      })
      
      drivers.forEach(driver => {
        bounds.extend({ lat: driver.latitude, lng: driver.longitude })
      })

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 50 })
      }
    }
  }, [map, orders, drivers, createOrderMarker, createDriverMarker, clearMarkers])

  // Atualizar centro do mapa
  useEffect(() => {
    if (!map) return

    map.setCenter({ lat: centerLat, lng: centerLng })
    map.setZoom(zoom)
  }, [map, centerLat, centerLng, zoom])

  // Função global para assumir rota
  useEffect(() => {
    (window as any).assumeRoute = (orderId: string) => {
      console.log('🚀 [ROUTE] Assumindo rota para pedido:', orderId)
      // Implementar lógica de rota aqui
    }

    return () => {
      delete (window as any).assumeRoute
    }
  }, [])

  if (error) {
    return (
      <div className={`w-full rounded-2xl shadow-lg overflow-hidden bg-red-50 flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center p-8">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Erro no Google Maps</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={`w-full rounded-2xl shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Carregando Google Maps...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div 
        ref={mapRef} 
        className={`w-full rounded-2xl shadow-lg overflow-hidden ${className}`}
        style={{ height }}
      />
      
      <style jsx global>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 184, 148, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(0, 184, 148, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 184, 148, 0); }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  )
}