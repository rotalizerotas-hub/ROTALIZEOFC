'use client'

import { useEffect, useRef, useState } from 'react'
import { Wrapper, Status } from '@googlemaps/react-wrapper'

const GOOGLE_MAPS_API_KEY = 'AIzaSyAUDPikNgdFO5AM3jOErBGlLvosAP0lvMU'

interface AddressSearchMapProps {
  onAddressSelect: (address: {
    formatted_address: string
    street: string
    number: string
    neighborhood: string
    city: string
    latitude: number
    longitude: number
  }) => void
  initialAddress?: string
  className?: string
}

function MapComponent({ onAddressSelect, initialAddress, className = '' }: AddressSearchMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const map = useRef<google.maps.Map | null>(null)
  const marker = useRef<google.maps.Marker | null>(null)
  const autocomplete = useRef<google.maps.places.Autocomplete | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (mapRef.current && !map.current && window.google) {
      // Inicializar mapa centrado no Brasil
      map.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: -18.5122, lng: -44.5550 },
        zoom: 13,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })

      // Inicializar marcador
      marker.current = new window.google.maps.Marker({
        map: map.current,
        draggable: true,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        }
      })

      // Listener para arrastar marcador
      marker.current.addListener('dragend', () => {
        if (marker.current) {
          const position = marker.current.getPosition()
          if (position) {
            geocodePosition(position)
          }
        }
      })

      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (searchInputRef.current && window.google && isLoaded && !autocomplete.current) {
      // Configurar autocomplete
      autocomplete.current = new window.google.maps.places.Autocomplete(
        searchInputRef.current,
        {
          componentRestrictions: { country: 'br' },
          fields: ['formatted_address', 'geometry', 'address_components'],
          types: ['address']
        }
      )

      // Listener para seleção de endereço
      autocomplete.current.addListener('place_changed', () => {
        const place = autocomplete.current?.getPlace()
        if (place && place.geometry && place.geometry.location) {
          updateMapLocation(place)
        }
      })
    }
  }, [isLoaded])

  const geocodePosition = (position: google.maps.LatLng) => {
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ location: position }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const result = results[0]
        const addressData = parseAddressComponents(result)
        onAddressSelect({
          ...addressData,
          latitude: position.lat(),
          longitude: position.lng()
        })
        
        if (searchInputRef.current) {
          searchInputRef.current.value = result.formatted_address
        }
      }
    })
  }

  const updateMapLocation = (place: google.maps.places.PlaceResult) => {
    if (!place.geometry?.location || !map.current || !marker.current) return

    const location = place.geometry.location
    map.current.setCenter(location)
    map.current.setZoom(17)
    marker.current.setPosition(location)

    const addressData = parseAddressComponents(place)
    onAddressSelect({
      ...addressData,
      latitude: location.lat(),
      longitude: location.lng()
    })
  }

  const parseAddressComponents = (place: google.maps.places.PlaceResult | google.maps.GeocoderResult) => {
    let street = ''
    let number = ''
    let neighborhood = ''
    let city = ''

    if (place.address_components) {
      place.address_components.forEach(component => {
        const types = component.types
        
        if (types.includes('route')) {
          street = component.long_name
        }
        if (types.includes('street_number')) {
          number = component.long_name
        }
        if (types.includes('sublocality') || types.includes('neighborhood')) {
          neighborhood = component.long_name
        }
        if (types.includes('locality') || types.includes('administrative_area_level_2')) {
          city = component.long_name
        }
      })
    }

    return {
      formatted_address: place.formatted_address || '',
      street,
      number,
      neighborhood,
      city
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Campo de busca */}
      <div>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Digite o endereço completo..."
          defaultValue={initialAddress}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Digite o endereço ou arraste o marcador no mapa
        </p>
      </div>

      {/* Mapa */}
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-xl border border-gray-200 shadow-sm"
      />
    </div>
  )
}

const LoadingComponent = () => (
  <div className="w-full h-64 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-500 rounded-lg mb-2 animate-pulse">
        <span className="text-white text-sm">📍</span>
      </div>
      <p className="text-gray-600 text-sm">Carregando mapa...</p>
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

export function AddressSearchMap(props: AddressSearchMapProps) {
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