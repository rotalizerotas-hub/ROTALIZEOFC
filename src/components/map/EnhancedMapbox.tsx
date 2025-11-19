'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Token público do Mapbox
mapboxgl.accessToken = 'pk.eyJ1Ijoicm90YWxpemVvZmljaWFsIiwiYSI6ImNtaHdidmV2dTA1dTgya3B0dGNzZ2Q4ZHUifQ.1kJiJcybFKIyF_0rpNHmbA'

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
    cancelled: '#ddd',
    preview: '#3b82f6' // Cor especial para preview
  }
  return colors[status as keyof typeof colors] || '#ddd'
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
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  useEffect(() => {
    if (map.current) return // Inicializar apenas uma vez

    console.log('🗺️ [MAP] Inicializando mapa...')

    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [centerLng, centerLat],
        zoom: zoom,
        attributionControl: false,
      })

      // Adicionar controles
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

      map.current.on('load', () => {
        console.log('✅ [MAP] Mapa carregado com sucesso')
        updateMarkers()
      })

      map.current.on('error', (e) => {
        console.error('❌ [MAP] Erro no mapa:', e)
      })
    }

    return () => {
      if (map.current) {
        console.log('🗺️ [MAP] Removendo mapa...')
        clearMarkers()
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Atualizar marcadores quando dados mudarem
  useEffect(() => {
    console.log('🔄 [MAP] Atualizando marcadores...', { 
      orders: orders.length, 
      drivers: drivers.length,
      mapLoaded: map.current?.isStyleLoaded() 
    })
    
    if (map.current && map.current.isStyleLoaded()) {
      updateMarkers()
    }
  }, [orders, drivers])

  // Centralizar mapa quando coordenadas mudarem
  useEffect(() => {
    if (map.current && centerLat && centerLng) {
      console.log('📍 [MAP] Centralizando mapa em:', { centerLat, centerLng, zoom })
      
      map.current.flyTo({
        center: [centerLng, centerLat],
        zoom: zoom,
        duration: 1500,
        essential: true
      })
    }
  }, [centerLat, centerLng, zoom])

  const clearMarkers = () => {
    console.log('🧹 [MAP] Limpando marcadores existentes:', markersRef.current.length)
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
  }

  const updateMarkers = () => {
    if (!map.current) {
      console.warn('⚠️ [MAP] Mapa não inicializado')
      return
    }

    console.log('🎯 [MAP] Atualizando marcadores...', { orders: orders.length, drivers: drivers.length })

    // Limpar marcadores existentes
    clearMarkers()

    // Adicionar marcadores de pedidos
    orders.forEach((order, index) => {
      console.log(`📍 [MAP] Adicionando marcador de pedido ${index + 1}:`, order)

      const markerElement = document.createElement('div')
      markerElement.className = 'custom-marker order-marker'
      markerElement.style.cursor = 'pointer'
      
      const isPreview = order.id === 'preview'
      const backgroundColor = getStatusColor(isPreview ? 'preview' : order.status)
      
      markerElement.innerHTML = `
        <div style="
          background: ${backgroundColor};
          width: ${isPreview ? '50px' : '40px'};
          height: ${isPreview ? '50px' : '40px'};
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${isPreview ? '22px' : '18px'};
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          transition: transform 0.2s;
          ${isPreview ? 'animation: bounce 2s infinite;' : ''}
        " 
        onmouseover="this.style.transform='scale(1.1)'" 
        onmouseout="this.style.transform='scale(1)'">
          ${order.categoryEmoji || '📍'}
        </div>
      `

      markerElement.addEventListener('click', () => {
        console.log('🖱️ [MAP] Clique no marcador:', order.id)
        if (onOrderClick && !isPreview) {
          onOrderClick(order.id)
        }
        showOrderPopup(order)
      })

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([order.longitude, order.latitude])
        .addTo(map.current!)

      markersRef.current.push(marker)
      
      console.log(`✅ [MAP] Marcador ${index + 1} adicionado em:`, [order.longitude, order.latitude])
    })

    // Adicionar marcadores de entregadores
    drivers.forEach((driver, index) => {
      if (!driver.isOnline) {
        console.log(`⏸️ [MAP] Entregador ${driver.name} offline, pulando...`)
        return
      }

      console.log(`🚗 [MAP] Adicionando marcador de entregador ${index + 1}:`, driver)

      const markerElement = document.createElement('div')
      markerElement.className = 'custom-marker driver-marker'
      markerElement.innerHTML = `
        <div style="
          background: #00b894;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          animation: pulse 2s infinite;
        ">
          ${getVehicleIcon(driver.vehicleType)}
        </div>
      `

      markerElement.addEventListener('click', () => {
        console.log('🖱️ [MAP] Clique no entregador:', driver.id)
        showDriverPopup(driver)
      })

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([driver.longitude, driver.latitude])
        .addTo(map.current!)

      markersRef.current.push(marker)
    })

    console.log(`✅ [MAP] Total de marcadores adicionados: ${markersRef.current.length}`)
  }

  const showOrderPopup = (order: OrderMarker) => {
    if (!map.current) return

    const isPreview = order.id === 'preview'
    
    const popup = new mapboxgl.Popup({ 
      offset: 25,
      closeButton: true,
      closeOnClick: false
    })
      .setLngLat([order.longitude, order.latitude])
      .setHTML(`
        <div style="padding: 12px; min-width: 200px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 20px;">${order.categoryEmoji || '📍'}</span>
            <h3 style="margin: 0; font-weight: 600; color: #333;">${order.customerName}</h3>
          </div>
          ${order.orderNumber ? `<p style="margin: 4px 0; color: #666; font-size: 14px;">Pedido #${order.orderNumber}</p>` : ''}
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
      `)
      .addTo(map.current)

    console.log('💬 [MAP] Popup exibido para:', order.customerName)
  }

  const showDriverPopup = (driver: DeliveryDriver) => {
    if (!map.current) return

    const popup = new mapboxgl.Popup({ offset: 25 })
      .setLngLat([driver.longitude, driver.latitude])
      .setHTML(`
        <div style="padding: 12px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 18px;">${getVehicleIcon(driver.vehicleType)}</span>
            <h3 style="margin: 0; font-weight: 600; color: #333;">${driver.name}</h3>
          </div>
          <p style="margin: 4px 0; color: #00b894; font-size: 14px;">
            <span style="display: inline-block; width: 8px; height: 8px; background: #00b894; border-radius: 50%; margin-right: 6px;"></span>
            Online
          </p>
        </div>
      `)
      .addTo(map.current)
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

  // Função global para assumir rota
  useEffect(() => {
    (window as any).assumeRoute = async (orderId: string) => {
      console.log('🚀 [ROUTE] Assumindo rota para pedido:', orderId)
      
      const order = orders.find(o => o.id === orderId)
      if (!order) return

      try {
        // Simular localização atual do entregador
        const currentLocation = {
          latitude: centerLat + (Math.random() - 0.5) * 0.01,
          longitude: centerLng + (Math.random() - 0.5) * 0.01
        }

        await drawRoute(currentLocation, { latitude: order.latitude, longitude: order.longitude })
        
      } catch (error) {
        console.error('❌ [ROUTE] Erro ao assumir rota:', error)
      }
    }

    return () => {
      delete (window as any).assumeRoute
    }
  }, [orders, centerLat, centerLng])

  const drawRoute = async (from: { latitude: number, longitude: number }, to: { latitude: number, longitude: number }) => {
    if (!map.current) return

    try {
      console.log('🗺️ [ROUTE] Calculando rota de', from, 'para', to)

      // Usar Mapbox Directions API
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      )

      const data = await response.json()

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0]

        // Remover rota anterior se existir
        if (map.current.getSource('route')) {
          map.current.removeLayer('route')
          map.current.removeSource('route')
        }

        // Adicionar nova rota
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          }
        })

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#00b894',
            'line-width': 6,
            'line-opacity': 0.8
          }
        })

        // Ajustar zoom para mostrar toda a rota
        const coordinates = route.geometry.coordinates
        const bounds = coordinates.reduce((bounds: any, coord: any) => {
          return bounds.extend(coord)
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))

        map.current.fitBounds(bounds, { padding: 50 })

        console.log('✅ [ROUTE] Rota desenhada com sucesso')
      }

    } catch (error) {
      console.error('❌ [ROUTE] Erro ao desenhar rota:', error)
    }
  }

  return (
    <>
      <div 
        ref={mapContainer} 
        className={`w-full h-full rounded-2xl shadow-lg overflow-hidden ${className}`}
        style={{ minHeight: '400px' }}
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
        
        .custom-marker {
          z-index: 1000;
        }
      `}</style>
    </>
  )
}