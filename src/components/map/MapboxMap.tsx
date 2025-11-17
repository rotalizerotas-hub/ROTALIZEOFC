'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Token público do Mapbox fornecido
mapboxgl.accessToken = 'pk.eyJ1Ijoicm90YWxpemVvZmljaWFsIiwiYSI6ImNtaHdidmV2dTA1dTgya3B0dGNzZ2Q4ZHUifQ.1kJiJcybFKIyF_0rpNHmbA'

interface MapboxMapProps {
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

export function MapboxMap({ organizations = [], orders = [], className = '' }: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [lng] = useState(-44.5550) // Longitude central de Minas Gerais
  const [lat] = useState(-18.5122) // Latitude central de Minas Gerais
  const [zoom] = useState(10)

  useEffect(() => {
    if (map.current) return // Inicializar mapa apenas uma vez

    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lng, lat],
        zoom: zoom,
        attributionControl: false,
      })

      // Adicionar controles de navegação
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

      // Personalizar estilo do mapa
      map.current.on('load', () => {
        if (map.current) {
          // Adicionar fonte de dados para organizações
          map.current.addSource('organizations', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: organizations.map(org => ({
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [org.longitude, org.latitude]
                },
                properties: {
                  id: org.id,
                  name: org.name,
                  type: org.establishment_type.name,
                  emoji: org.establishment_type.emoji,
                  icon_url: org.establishment_type.icon_url
                }
              }))
            }
          })

          // Adicionar camada para organizações
          map.current.addLayer({
            id: 'organizations',
            type: 'circle',
            source: 'organizations',
            paint: {
              'circle-radius': 12,
              'circle-color': [
                'case',
                ['==', ['get', 'type'], 'Pizzaria'], '#ff6b6b',
                ['==', ['get', 'type'], 'Hamburgueria'], '#4ecdc4',
                ['==', ['get', 'type'], 'Farmácia'], '#45b7d1',
                ['==', ['get', 'type'], 'Supermercado'], '#96ceb4',
                '#6c5ce7' // cor padrão
              ],
              'circle-stroke-width': 3,
              'circle-stroke-color': '#ffffff',
              'circle-opacity': 0.9
            }
          })

          // Adicionar fonte de dados para pedidos
          map.current.addSource('orders', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: orders.map(order => ({
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [order.delivery_longitude, order.delivery_latitude]
                },
                properties: {
                  id: order.id,
                  customer_name: order.customer_name,
                  status: order.status
                }
              }))
            }
          })

          // Adicionar camada para pedidos
          map.current.addLayer({
            id: 'orders',
            type: 'circle',
            source: 'orders',
            paint: {
              'circle-radius': 8,
              'circle-color': [
                'case',
                ['==', ['get', 'status'], 'pending'], '#ffd93d',
                ['==', ['get', 'status'], 'assigned'], '#6c5ce7',
                ['==', ['get', 'status'], 'in_transit'], '#fd79a8',
                ['==', ['get', 'status'], 'delivered'], '#00b894',
                '#ddd' // cancelado
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
              'circle-opacity': 0.8
            }
          })

          // Adicionar popups para organizações
          map.current.on('click', 'organizations', (e) => {
            if (e.features && e.features[0]) {
              const feature = e.features[0]
              const coordinates = (feature.geometry as any).coordinates.slice()
              const properties = feature.properties
              
              if (properties) {
                const { name, type, emoji } = properties

                new mapboxgl.Popup()
                  .setLngLat(coordinates)
                  .setHTML(`
                    <div class="p-3">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="text-2xl">${emoji || '🏪'}</span>
                        <h3 class="font-semibold text-gray-800">${name || 'Estabelecimento'}</h3>
                      </div>
                      <p class="text-sm text-gray-600">${type || 'Tipo não informado'}</p>
                    </div>
                  `)
                  .addTo(map.current!)
              }
            }
          })

          // Adicionar popups para pedidos
          map.current.on('click', 'orders', (e) => {
            if (e.features && e.features[0]) {
              const feature = e.features[0]
              const coordinates = (feature.geometry as any).coordinates.slice()
              const properties = feature.properties
              
              if (properties) {
                const { customer_name, status } = properties
                const statusText = getStatusText(status || 'unknown')

                new mapboxgl.Popup()
                  .setLngLat(coordinates)
                  .setHTML(`
                    <div class="p-3">
                      <h3 class="font-semibold text-gray-800 mb-1">${customer_name || 'Cliente'}</h3>
                      <p class="text-sm text-gray-600">Status: ${statusText}</p>
                    </div>
                  `)
                  .addTo(map.current!)
              }
            }
          })

          // Cursor pointer nos pontos
          map.current.on('mouseenter', 'organizations', () => {
            if (map.current) map.current.getCanvas().style.cursor = 'pointer'
          })
          map.current.on('mouseleave', 'organizations', () => {
            if (map.current) map.current.getCanvas().style.cursor = ''
          })
          map.current.on('mouseenter', 'orders', () => {
            if (map.current) map.current.getCanvas().style.cursor = 'pointer'
          })
          map.current.on('mouseleave', 'orders', () => {
            if (map.current) map.current.getCanvas().style.cursor = ''
          })
        }
      })
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [lng, lat, zoom])

  // Atualizar dados quando props mudarem
  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) {
      const organizationsSource = map.current.getSource('organizations') as mapboxgl.GeoJSONSource
      if (organizationsSource) {
        organizationsSource.setData({
          type: 'FeatureCollection',
          features: organizations.map(org => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [org.longitude, org.latitude]
            },
            properties: {
              id: org.id,
              name: org.name,
              type: org.establishment_type.name,
              emoji: org.establishment_type.emoji,
              icon_url: org.establishment_type.icon_url
            }
          }))
        })
      }

      const ordersSource = map.current.getSource('orders') as mapboxgl.GeoJSONSource
      if (ordersSource) {
        ordersSource.setData({
          type: 'FeatureCollection',
          features: orders.map(order => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [order.delivery_longitude, order.delivery_latitude]
            },
            properties: {
              id: order.id,
              customer_name: order.customer_name,
              status: order.status
            }
          }))
        })
      }
    }
  }, [organizations, orders])

  return (
    <div 
      ref={mapContainer} 
      className={`w-full h-full rounded-2xl shadow-lg overflow-hidden ${className}`}
      style={{ minHeight: '400px' }}
    />
  )
}