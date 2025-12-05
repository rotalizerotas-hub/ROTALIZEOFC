'use client'

import { useEffect, useRef } from 'react'
import { Wrapper, Status } from '@googlemaps/react-wrapper'

// API Key do Google Maps
const GOOGLE_MAPS_API_KEY = 'AIzaSyAUDPikNgdFO5AM3jOErBGlLvosAP0lvMU'

interface GoogleMapProps {
  organizations?: Array<{
    id: string
    name: string
    latitude: number
    longitude: number
    establishment_type: {
      name: string
      icon_url: string
      emoji: string
    }
  }>
  orders?: Array<{
    id: string
    customer_name: string
    delivery_latitude: number
    delivery_longitude: number
    status: string
    establishment_type?: {
      name: string
      emoji: string
    }
  }>
  className?: string
}

// Função helper para traduzir status
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

// Função para obter cor por tipo de estabelecimento
const getEstablishmentColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    'Pizzaria': '#ff6b6b',
    'Hamburgueria': '#4ecdc4',
    'Farmácia': '#45b7d1',
    'Supermercado': '#96ceb4',
    'Restaurante': '#fd79a8',
    'Lanchonete': '#fdcb6e',
    'Padaria': '#e17055',
    'Sorveteria': '#74b9ff',
    'Cafeteria': '#6c5ce7',
    'Bar': '#a29bfe',
    'Açougue': '#e84393',
    'Mercado': '#00b894',
    'Conveniência': '#00cec9',
    'Posto': '#ffeaa7',
    'Mecânica': '#636e72',
    'Hospital': '#ff7675',
    'Clínica': '#fd79a8',
    'Dentista': '#fdcb6e',
    'Ótica': '#74b9ff',
    'Perfumaria': '#e17055',
  }
  return colorMap[type] || '#6c5ce7'
}

// Função para obter cor por status do pedido
const getOrderColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'pending': '#ffd93d',
    'assigned': '#6c5ce7',
    'in_transit': '#fd79a8',
    'delivered': '#00b894',
    'cancelled': '#ddd',
  }
  return colorMap[status] || '#ddd'
}

// Função para criar ícone personalizado com emoji
const createCustomIcon = (emoji: string, backgroundColor: string, size: number = 50): string => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) return ''
  
  canvas.width = size
  canvas.height = size
  
  // Fundo circular com gradiente 3D
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
  gradient.addColorStop(0, backgroundColor)
  gradient.addColorStop(0.7, backgroundColor)
  gradient.addColorStop(1, '#000000')
  
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(size/2, size/2, size/2 - 2, 0, 2 * Math.PI)
  ctx.fill()
  
  // Borda branca para destaque
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(size/2, size/2, size/2 - 2, 0, 2 * Math.PI)
  ctx.stroke()
  
  // Sombra interna para efeito 3D
  ctx.shadowColor = 'rgba(0,0,0,0.3)'
  ctx.shadowBlur = 5
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2
  
  // Emoji no centro
  ctx.font = `${size * 0.5}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#000000'
  ctx.fillText(emoji, size/2, size/2)
  
  return canvas.toDataURL()
}

// Componente do mapa
function MapComponent({ organizations = [], orders = [], className = '' }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const map = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])

  useEffect(() => {
    if (mapRef.current && !map.current && window.google) {
      // Inicializar mapa
      map.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: -18.5122, lng: -44.5550 }, // Centro de Minas Gerais
        zoom: 10,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })
    }
  }, [])

  useEffect(() => {
    if (!map.current || !window.google) return

    // Limpar marcadores existentes
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // Adicionar marcadores para organizações
    organizations.forEach(org => {
      const backgroundColor = getEstablishmentColor(org.establishment_type.name)
      const customIcon = createCustomIcon(org.establishment_type.emoji || '🏪', backgroundColor, 60)
      
      const marker = new window.google.maps.Marker({
        position: { lat: org.latitude, lng: org.longitude },
        map: map.current,
        title: org.name,
        icon: {
          url: customIcon,
          scaledSize: new window.google.maps.Size(60, 60),
          anchor: new window.google.maps.Point(30, 30)
        }
      })

      // InfoWindow para organizações
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 16px; font-family: system-ui; min-width: 200px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <div style="
                width: 48px; 
                height: 48px; 
                background: linear-gradient(135deg, ${backgroundColor}, ${backgroundColor}dd);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              ">
                ${org.establishment_type.emoji || '🏪'}
              </div>
              <div>
                <h3 style="margin: 0; font-weight: 600; color: #1f2937; font-size: 16px;">${org.name || 'Estabelecimento'}</h3>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">${org.establishment_type.name || 'Tipo não informado'}</p>
              </div>
            </div>
            <div style="
              padding: 8px 12px;
              background: linear-gradient(135deg, ${backgroundColor}20, ${backgroundColor}10);
              border-radius: 8px;
              border-left: 4px solid ${backgroundColor};
            ">
              <span style="font-size: 12px; color: #374151; font-weight: 500;">📍 Estabelecimento Ativo</span>
            </div>
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(map.current, marker)
      })

      markersRef.current.push(marker)
    })

    // Adicionar marcadores para pedidos
    orders.forEach(order => {
      const statusColor = getOrderColor(order.status)
      const categoryEmoji = order.establishment_type?.emoji || '📦'
      const categoryColor = order.establishment_type ? getEstablishmentColor(order.establishment_type.name) : statusColor
      
      // Usar emoji da categoria se disponível, senão usar ícone baseado no status
      const displayEmoji = order.establishment_type?.emoji || '📦'
      const customIcon = createCustomIcon(displayEmoji, categoryColor, 50)
      
      const marker = new window.google.maps.Marker({
        position: { lat: order.delivery_latitude, lng: order.delivery_longitude },
        map: map.current,
        title: order.customer_name,
        icon: {
          url: customIcon,
          scaledSize: new window.google.maps.Size(50, 50),
          anchor: new window.google.maps.Point(25, 25)
        }
      })

      // InfoWindow para pedidos
      const statusText = getStatusText(order.status || 'unknown')
      const statusBadgeColor = getOrderColor(order.status)
      
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 16px; font-family: system-ui; min-width: 220px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <div style="
                width: 48px; 
                height: 48px; 
                background: linear-gradient(135deg, ${categoryColor}, ${categoryColor}dd);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              ">
                ${displayEmoji}
              </div>
              <div style="flex: 1;">
                <h3 style="margin: 0; font-weight: 600; color: #1f2937; font-size: 16px;">${order.customer_name || 'Cliente'}</h3>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">
                  ${order.establishment_type?.name || 'Pedido de Entrega'}
                </p>
              </div>
            </div>
            <div style="
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 6px 12px;
              background: linear-gradient(135deg, ${statusBadgeColor}20, ${statusBadgeColor}10);
              border-radius: 20px;
              border: 1px solid ${statusBadgeColor}40;
            ">
              <div style="
                width: 8px;
                height: 8px;
                background: ${statusBadgeColor};
                border-radius: 50%;
              "></div>
              <span style="font-size: 12px; color: #374151; font-weight: 500;">${statusText}</span>
            </div>
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(map.current, marker)
      })

      markersRef.current.push(marker)
    })

  }, [organizations, orders])

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full rounded-2xl shadow-lg overflow-hidden ${className}`}
      style={{ minHeight: '400px' }}
    />
  )
}

// Componente de loading
const LoadingComponent = () => (
  <div className="w-full h-full rounded-2xl shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center" style={{ minHeight: '400px' }}>
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl shadow-lg mb-4 animate-pulse">
        <span className="text-xl font-bold text-white">🗺️</span>
      </div>
      <p className="text-gray-600">Carregando mapa...</p>
    </div>
  </div>
)

// Componente de erro
const ErrorComponent = ({ status }: { status: Status }) => (
  <div className="w-full h-full rounded-2xl shadow-lg overflow-hidden bg-red-50 flex items-center justify-center" style={{ minHeight: '400px' }}>
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500 rounded-xl shadow-lg mb-4">
        <span className="text-xl font-bold text-white">❌</span>
      </div>
      <p className="text-red-600">Erro ao carregar mapa: {status}</p>
    </div>
  </div>
)

// Componente principal exportado
export function GoogleMap(props: GoogleMapProps) {
  return (
    <Wrapper 
      apiKey={GOOGLE_MAPS_API_KEY}
      libraries={['places']}
      render={(status) => {
        switch (status) {
          case Status.LOADING:
            return <LoadingComponent />
          case Status.FAILURE:
            return <ErrorComponent status={status} />
          case Status.SUCCESS:
            return <MapComponent {...props} />
        }
      }}
    />
  )
}