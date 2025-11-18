'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

// Definir tipos para evitar erros de TypeScript
declare global {
  interface Window {
    mapboxgl: any
  }
}

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

export function MapboxMap({ 
  orders = [], 
  centerLat = -19.9167, 
  centerLng = -43.9345, 
  zoom = 12,
  onOrderClick,
  className = '' 
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    // Carregar Mapbox GL JS dinamicamente
    if (!window.mapboxgl) {
      const script = document.createElement('script')
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'
      script.onload = initializeMap
      document.head.appendChild(script)

      const link = document.createElement('link')
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css'
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    } else {
      initializeMap()
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  const initializeMap = () => {
    if (map.current || !mapContainer.current) return

    // Token do Mapbox
    window.mapboxgl.accessToken = 'pk.eyJ1Ijoicm90YWxpemVvZmljaWFsIiwiYSI6ImNtaHdidmV2dTA1dTgya3B0dGNzZ2Q4ZHUifQ.1kJiJcybFKIyF_0rpNHmbA'

    console.log('🗺️ [MAPBOX] Inicializando mapa...')

    map.current = new window.mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [centerLng, centerLat],
      zoom: zoom,
      attributionControl: false
    })

    // Adicionar controles
    map.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right')

    map.current.on('load', () => {
      console.log('✅ [MAPBOX] Mapa carregado com sucesso')
      setMapLoaded(true)
      updateMarkers()
    })

    map.current.on('error', (e: any) => {
      console.error('❌ [MAPBOX] Erro no mapa:', e)
    })
  }

  // Atualizar marcadores quando dados mudarem
  useEffect(() => {
    if (mapLoaded && map.current) {
      updateMarkers()
    }
  }, [orders, mapLoaded])

  // Centralizar mapa quando coordenadas mudarem
  useEffect(() => {
    if (mapLoaded && map.current && centerLat && centerLng) {
      console.log('📍 [MAPBOX] Centralizando mapa em:', { centerLat, centerLng, zoom })
      
      map.current.flyTo({
        center: [centerLng, centerLat],
        zoom: zoom,
        duration: 1500
      })
    }
  }, [centerLat, centerLng, zoom, mapLoaded])

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
  }

  const updateMarkers = () => {
    if (!map.current || !window.mapboxgl) return

    console.log('🔄 [MAPBOX] Atualizando marcadores...', orders.length)
    clearMarkers()

    orders.forEach((order, index) => {
      console.log(`📌 [MAPBOX] Criando marcador ${index + 1}:`, order)

      // Criar elemento do marcador
      const markerElement = document.createElement('div')
      markerElement.className = 'custom-marker'
      markerElement.style.cssText = `
        background: ${getStatusColor(order.status)};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
      `
      
      markerElement.innerHTML = order.categoryEmoji

      // Eventos do marcador
      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.transform = 'scale(1.2)'
      })

      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.transform = 'scale(1)'
      })

      markerElement.addEventListener('click', () => {
        console.log('🖱️ [MAPBOX] Marcador clicado:', order.id)
        if (onOrderClick) {
          onOrderClick(order.id)
        }
        showOrderPopup(order)
      })

      // Criar marcador no mapa
      const marker = new window.mapboxgl.Marker(markerElement)
        .setLngLat([order.longitude, order.latitude])
        .addTo(map.current)

      markersRef.current.push(marker)
      
      console.log(`✅ [MAPBOX] Marcador ${index + 1} adicionado em:`, [order.longitude, order.latitude])
    })
  }

  const showOrderPopup = (order: any) => {
    if (!map.current || !window.mapboxgl) return

    console.log('💬 [MAPBOX] Mostrando popup:', order.id)

    const popup = new window.mapboxgl.Popup({ 
      offset: 25,
      closeButton: true,
      closeOnClick: false
    })
      .setLngLat([order.longitude, order.latitude])
      .setHTML(`
        <div style="padding: 16px; min-width: 200px; font-family: system-ui;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <span style="font-size: 24px;">${order.categoryEmoji}</span>
            <h3 style="margin: 0; font-weight: 600; color: #333;">${order.customerName}</h3>
          </div>
          ${order.orderNumber ? `<p style="margin: 6px 0; color: #666; font-size: 14px;">📋 Pedido #${order.orderNumber}</p>` : ''}
          <p style="margin: 6px 0; color: #666; font-size: 14px;">📍 Status: ${order.status}</p>
          <button 
            onclick="window.assumeRoute && window.assumeRoute('${order.id}')" 
            style="
              background: linear-gradient(45deg, #00b894, #00cec9);
              color: white;
              border: none;
              padding: 10px 18px;
              border-radius: 10px;
              cursor: pointer;
              font-weight: 600;
              margin-top: 12px;
              width: 100%;
              font-size: 14px;
            "
          >
            🚀 Assumir Rota
          </button>
        </div>
      `)
      .addTo(map.current)
  }

  // Função global para assumir rota
  useEffect(() => {
    (window as any).assumeRoute = (orderId: string) => {
      console.log('🚀 [ROUTE] Assumindo rota para:', orderId)
      const order = orders.find(o => o.id === orderId)
      if (order) {
        toast.success(`Rota assumida para ${order.customerName}! 🗺️`)
      }
    }

    return () => {
      delete (window as any).assumeRoute
    }
  }, [orders])

  return (
    <div className={`relative w-full h-full rounded-2xl shadow-lg overflow-hidden ${className}`}>
      <div 
        ref={mapContainer} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
      
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando Mapbox...</p>
          </div>
        </div>
      )}

      {/* Badge do Mapbox */}
      <div className="absolute bottom-4 right-4 bg-black/80 text-white px-2 py-1 rounded text-xs">
        Mapbox
      </div>
    </div>
  )
}