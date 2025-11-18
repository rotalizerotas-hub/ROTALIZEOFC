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
    cancelled: '#ddd'
  }
  return colors[status as keyof typeof colors] || '#ddd'
}

export function EnhancedMapbox({ 
  orders = [], 
  drivers = [], 
  centerLat = -18.5122, 
  centerLng = -44.5550, 
  zoom = 12,
  onOrderClick,
  className = '' 
}: EnhancedMapboxProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [currentRoute, setCurrentRoute] = useState<any>(null)

  useEffect(() => {
    if (map.current) return // Inicializar apenas uma vez

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
        console.log('🗺️ [MAP] Mapa carregado')
        updateMarkers()
      })
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Atualizar marcadores quando dados mudarem
  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) {
      updateMarkers()
    }
  }, [orders, drivers])

  // Centralizar mapa quando coordenadas mudarem
  useEffect(() => {
    if (map.current && centerLat && centerLng) {
      map.current.flyTo({
        center: [centerLng, centerLat],
        zoom: zoom,
        duration: 1000
      })
    }
  }, [centerLat, centerLng, zoom])

  const updateMarkers = () => {
    if (!map.current) return

    // Limpar marcadores existentes
    const existingMarkers = document.querySelectorAll('.custom-marker')
    existingMarkers.forEach(marker => marker.remove())

    // Adicionar marcadores de pedidos
    orders.forEach(order => {
      const markerElement = document.createElement('div')
      markerElement.className = 'custom-marker order-marker'
      markerElement.innerHTML = `
        <div style="
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
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
          ${order.categoryEmoji}
        </div>
      `

      markerElement.addEventListener('click', () => {
        if (onOrderClick) {
          onOrderClick(order.id)
        }
        showOrderPopup(order)
      })

      new mapboxgl.Marker(markerElement)
        .setLngLat([order.longitude, order.latitude])
        .addTo(map.current!)
    })

    // Adicionar marcadores de entregadores
    drivers.forEach(driver => {
      if (!driver.isOnline) return

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
        showDriverPopup(driver)
      })

      new mapboxgl.Marker(markerElement)
        .setLngLat([driver.longitude, driver.latitude])
        .addTo(map.current!)
    })
  }

  const showOrderPopup = (order: OrderMarker) => {
    if (!map.current) return

    const popup = new mapboxgl.Popup({ offset: 25 })
      .setLngLat([order.longitude, order.latitude])
      .setHTML(`
        <div style="padding: 12px; min-width: 200px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 20px;">${order.categoryEmoji}</span>
            <h3 style="margin: 0; font-weight: 600; color: #333;">${order.customerName}</h3>
          </div>
          ${order.orderNumber ? `<p style="margin: 4px 0; color: #666; font-size: 14px;">Pedido #${order.orderNumber}</p>` : ''}
          <p style="margin: 4px 0; color: #666; font-size: 14px;">Status: ${getStatusText(order.status)}</p>
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
        </div>
      `)
      .addTo(map.current)
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
        // Simular localização atual do entregador (em produção, usar geolocalização real)
        const currentLocation = {
          latitude: -18.5122 + (Math.random() - 0.5) * 0.01,
          longitude: -44.5550 + (Math.random() - 0.5) * 0.01
        }

        await drawRoute(currentLocation, { latitude: order.latitude, longitude: order.longitude })
        
      } catch (error) {
        console.error('❌ [ROUTE] Erro ao assumir rota:', error)
      }
    }

    return () => {
      delete (window as any).assumeRoute
    }
  }, [orders])

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
      `}</style>
    </>
  )
}