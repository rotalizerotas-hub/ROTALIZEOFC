'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { config } from '@/lib/config'

interface GoogleAddressSearchProps {
  onAddressFound: (addressData: {
    fullAddress: string
    street: string
    number: string
    neighborhood: string
    city: string
    latitude: number
    longitude: number
  }) => void
  disabled?: boolean
}

export function GoogleAddressSearch({ onAddressFound, disabled = false }: GoogleAddressSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  // Verificar se Google Maps está carregado
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log('✅ [GOOGLE PLACES] API disponível')
        setIsLoaded(true)
        return true
      }
      return false
    }

    if (checkGoogleMaps()) return

    // Aguardar carregamento
    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(interval)
      }
    }, 100)

    // Timeout após 10 segundos
    const timeout = setTimeout(() => {
      clearInterval(interval)
      if (!isLoaded) {
        console.warn('⚠️ [GOOGLE PLACES] Timeout ao aguardar API')
      }
    }, 10000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [isLoaded])

  // Inicializar Autocomplete
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return

    try {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'BR' },
        fields: ['address_components', 'formatted_address', 'geometry', 'name'],
        types: ['address']
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        
        if (!place.geometry || !place.geometry.location) {
          toast.error('Endereço não encontrado. Tente novamente.')
          return
        }

        handlePlaceSelect(place)
      })

      autocompleteRef.current = autocomplete
      console.log('✅ [GOOGLE PLACES] Autocomplete inicializado')
    } catch (error) {
      console.error('❌ [GOOGLE PLACES] Erro ao inicializar autocomplete:', error)
    }
  }, [isLoaded])

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (!place.geometry?.location || !place.address_components) {
      toast.error('Dados do endereço incompletos')
      return
    }

    console.log('📍 [GOOGLE PLACES] Local selecionado:', place)

    // Extrair componentes do endereço
    let street = ''
    let number = ''
    let neighborhood = ''
    let city = ''

    place.address_components.forEach(component => {
      const types = component.types

      if (types.includes('route')) {
        street = component.long_name
      } else if (types.includes('street_number')) {
        number = component.long_name
      } else if (types.includes('sublocality') || types.includes('neighborhood')) {
        neighborhood = component.long_name
      } else if (types.includes('administrative_area_level_2') || types.includes('locality')) {
        city = component.long_name
      }
    })

    const latitude = place.geometry.location.lat()
    const longitude = place.geometry.location.lng()

    const addressData = {
      fullAddress: place.formatted_address || '',
      street,
      number,
      neighborhood,
      city,
      latitude,
      longitude
    }

    console.log('✅ [GOOGLE PLACES] Endereço processado:', addressData)

    onAddressFound(addressData)
    toast.success('Endereço encontrado e localizado no mapa!')
  }

  const searchAddress = async () => {
    if (!searchQuery.trim()) {
      toast.error('Digite um endereço para buscar')
      return
    }

    if (!isLoaded) {
      toast.error('Google Maps ainda está carregando...')
      return
    }

    setLoading(true)

    try {
      console.log('🔍 [GOOGLE GEOCODING] Buscando endereço:', searchQuery)

      const geocoder = new google.maps.Geocoder()
      
      const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode(
          { 
            address: searchQuery + ', Brasil',
            componentRestrictions: { country: 'BR' }
          },
          (results, status) => {
            if (status === 'OK' && results) {
              resolve(results)
            } else {
              reject(new Error(`Geocoding failed: ${status}`))
            }
          }
        )
      })

      if (result.length === 0) {
        toast.error('Endereço não encontrado. Tente ser mais específico.')
        return
      }

      const place = result[0]
      
      // Extrair componentes do endereço
      let street = ''
      let number = ''
      let neighborhood = ''
      let city = ''

      place.address_components.forEach(component => {
        const types = component.types

        if (types.includes('route')) {
          street = component.long_name
        } else if (types.includes('street_number')) {
          number = component.long_name
        } else if (types.includes('sublocality') || types.includes('neighborhood')) {
          neighborhood = component.long_name
        } else if (types.includes('administrative_area_level_2') || types.includes('locality')) {
          city = component.long_name
        }
      })

      const latitude = place.geometry.location.lat()
      const longitude = place.geometry.location.lng()

      const addressData = {
        fullAddress: place.formatted_address,
        street,
        number,
        neighborhood,
        city,
        latitude,
        longitude
      }

      console.log('✅ [GOOGLE GEOCODING] Endereço processado:', addressData)

      onAddressFound(addressData)
      toast.success('Endereço encontrado e localizado no mapa!')

    } catch (error) {
      console.error('❌ [GOOGLE GEOCODING] Erro na busca:', error)
      toast.error('Erro ao buscar endereço. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && !disabled) {
      searchAddress()
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address-search" className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          Buscar Endereço
        </Label>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            id="address-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite o endereço completo (ex: Rua das Flores, 123, Centro, Belo Horizonte)"
            className="rounded-xl flex-1"
            disabled={disabled || loading || !isLoaded}
          />
          <Button
            onClick={searchAddress}
            disabled={disabled || loading || !searchQuery.trim() || !isLoaded}
            className="rounded-xl px-6"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4  h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          💡 Dica: Digite o endereço e selecione uma das sugestões ou clique em buscar
        </p>
        {!isLoaded && (
          <p className="text-xs text-amber-600">
            ⏳ Carregando Google Places API...
          </p>
        )}
      </div>

      {/* Exemplos de busca */}
      <div className="space-y-2">
        <Label className="text-xs text-gray-600">Exemplos de busca:</Label>
        <div className="flex flex-wrap gap-2">
          {[
            'Rua da Bahia, 1200, Centro, Belo Horizonte',
            'Avenida Paulista, 1000, São Paulo',
            'Rua das Flores, 50, Copacabana, Rio de Janeiro'
          ].map((example, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery(example)}
              disabled={disabled || loading || !isLoaded}
              className="text-xs rounded-lg"
            >
              {example}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}