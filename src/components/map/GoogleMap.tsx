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
  }
  return colorMap[status] || '#ddd'
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
      const marker = new window.google.maps.Marker({
        position: { lat: org.latitude, lng: org.longitude },
        map: map.current,
        title: org.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: getEstablishmentColor(org.establishment_type.name),
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        }
      })

      // InfoWindow para organizações
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; font-family: system-ui;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 24px;">${org.establishment_type.emoji || '🏪'}</span>
              <h3 style="margin: 0; font-weight: 600; color: #1f2937;">${org.name || 'Estabelecimento'}</h3>
            </div>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">${org.establishment_type.name || 'Tipo não informado'}</p>
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
      const marker = new window.google.maps.Marker({
        position: { lat: order.delivery_latitude, lng: order.delivery_longitude },
        map: map.current,
        title: order.customer_name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: getOrderColor(order.status),
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        }
      })

      // InfoWindow para pedidos
      const statusText = getStatusText(order.status || 'unknown')
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; font-family: system-ui;">
            <h3 style="margin: 0 0 4px 0; font-weight: 600; color: #1f2937;">${order.customer_name || 'Cliente'}</h3>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Status: ${statusText}</p>
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