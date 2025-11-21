'use client'

import { useEffect, useRef, useState } from 'react'
import { Wrapper, Status } from '@googlemaps/react-wrapper'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navigation, Square, MapPin, Clock } from 'lucide-react'
import { toast } from 'sonner'

const GOOGLE_MAPS_API_KEY = 'AIzaSyAUDPikNgdFO5AM3jOErBGlLvosAP0lvMU'

interface RouteMapProps {
  order: {
    id: string
    customer_name: string
    delivery_address: string
    delivery_latitude: number
    delivery_longitude: number
    status: string
    route_started_at?: string
    route_finished_at?: string
  }
  onRouteStart: (orderId: string) => void
  onRouteFinish: (orderId: string, data: {
    distance_km: number
    duration_minutes: number
  }) => void
  className?: string
}

function MapComponent({ order, onRouteStart, onRouteFinish, className = '' }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const map = useRef<google.maps.Map | null>(null)
  const directionsService = useRef<google.maps.DirectionsService | null>(null)
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null)
  const [currentPosition, setCurrentPosition] = useState<google.maps.LatLng | null>(null)
  const [routeInfo, setRouteInfo] = useState<{distance: string, duration: string} | null>(null)
  const [isTracking, setIsTracking] = useState(false)

  useEffect(() => {
    if (mapRef.current && !map.current && window.google) {
      // Inicializar mapa
      map.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: order.delivery_latitude, lng: order.delivery_longitude },
        zoom: 15,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })

      // Inicializar serviços de direção
      directionsService.current = new window.google.maps.DirectionsService()
      directionsRenderer.current = new window.google.maps.DirectionsRenderer({
        draggable: false,
        panel: undefined
      })
      directionsRenderer.current.setMap(map.current)

      // Adicionar marcador do destino
      new window.google.maps.Marker({
        position: { lat: order.delivery_latitude, lng: order.delivery_longitude },
        map: map.current,
        title: order.customer_name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        }
      })

      // Obter localização atual
      getCurrentLocation()
    }
  }, [order])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = new window.google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          )
          setCurrentPosition(pos)
          
          if (map.current) {
            // Adicionar marcador da posição atual
            new window.google.maps.Marker({
              position: pos,
              map: map.current,
              title: 'Sua localização',
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#22c55e',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }
            })
          }
        },
        () => {
          toast.error('Erro ao obter localização atual')
        }
      )
    }
  }

  const calculateRoute = () => {
    if (!currentPosition || !directionsService.current || !directionsRenderer.current) {
      toast.error('Localização não disponível')
      return
    }

    const request: google.maps.DirectionsRequest = {
      origin: currentPosition,
      destination: { lat: order.delivery_latitude, lng: order.delivery_longitude },
      travelMode: window.google.maps.TravelMode.DRIVING,
    }

    directionsService.current.route(request, (result, status) => {
      if (status === 'OK' && result) {
        directionsRenderer.current?.setDirections(result)
        
        const route = result.routes[0]
        const leg = route.legs[0]
        
        setRouteInfo({
          distance: leg.distance?.text || '',
          duration: leg.duration?.text || ''
        })
      } else {
        toast.error('Erro ao calcular rota')
      }
    })
  }

  const startRoute = () => {
    if (!currentPosition) {
      toast.error('Localização não disponível')
      return
    }

    calculateRoute()
    setIsTracking(true)
    onRouteStart(order.id)
    toast.success('Rota iniciada!')
  }

  const finishRoute = () => {
    if (!routeInfo) {
      toast.error('Rota não calculada')
      return
    }

    // Extrair números da distância e duração
    const distanceKm = parseFloat(routeInfo.distance.replace(/[^\d.,]/g, '').replace(',', '.'))
    const durationMinutes = parseInt(routeInfo.duration.replace(/[^\d]/g, ''))

    setIsTracking(false)
    onRouteFinish(order.id, {
      distance_km: distanceKm,
      duration_minutes: durationMinutes
    })
    toast.success('Rota finalizada!')
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Mapa */}
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-xl border border-gray-200 shadow-sm"
      />

      {/* Informações da rota */}
      {routeInfo && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Distância: {routeInfo.distance}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Tempo: {routeInfo.duration}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controles da rota */}
      <div className="flex gap-2">
        {!isTracking ? (
          <Button
            onClick={startRoute}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl"
            disabled={!currentPosition}
          >
            <Navigation className="w-4 h-4 mr-2" />
            Iniciar Rota
          </Button>
        ) : (
          <Button
            onClick={finishRoute}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl"
          >
            <Square className="w-4 h-4 mr-2" />
            Finalizar Rota
          </Button>
        )}
      </div>
    </div>
  )
}

const LoadingComponent = () => (
  <div className="w-full h-64 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-500 rounded-lg mb-2 animate-pulse">
        <Navigation className="w-4 h-4 text-white" />
      </div>
      <p className="text-gray-600 text-sm">Carregando mapa de rota...</p>
    </div>
  </div>
)

const ErrorComponent = ({ status }: { status: Status }) => (
  <div className="w-full h-64 rounded-xl border border-red-200 bg-red-50 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-8 h-8 bg-red-500 rounded-lg mb-2">
        <span className="text-white text-sm">❌</span>
      </div>
      <p className="text-red-600 text-sm">Erro ao carregar mapa: {status}</p>
    </div>
  </div>
)

export function RouteMap(props: RouteMapProps) {
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