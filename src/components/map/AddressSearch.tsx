'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AddressSearchProps {
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

export function AddressSearch({ onAddressFound, disabled = false }: AddressSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const searchAddress = async () => {
    if (!searchQuery.trim()) {
      toast.error('Digite um endereço para buscar')
      return
    }

    setIsSearching(true)

    try {
      console.log('🔍 [ADDRESS] Buscando endereço:', searchQuery)

      // Usar Google Maps Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      )

      if (!response.ok) {
        throw new Error('Erro na busca do endereço')
      }

      const data = await response.json()

      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        throw new Error('Endereço não encontrado')
      }

      const result = data.results[0]
      const { geometry, formatted_address, address_components } = result

      console.log('📍 [ADDRESS] Resultado encontrado:', result)

      // Extrair componentes do endereço
      let street = ''
      let number = ''
      let neighborhood = ''
      let city = ''

      address_components.forEach((component: any) => {
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

      const addressData = {
        fullAddress: formatted_address,
        street: street || 'Rua não identificada',
        number: number || 'S/N',
        neighborhood: neighborhood || 'Bairro não identificado',
        city: city || 'Cidade não identificada',
        latitude: geometry.location.lat,
        longitude: geometry.location.lng
      }

      console.log('✅ [ADDRESS] Dados processados:', addressData)

      onAddressFound(addressData)
      toast.success('Endereço encontrado!')

    } catch (error) {
      console.error('❌ [ADDRESS] Erro na busca:', error)
      toast.error('Erro ao buscar endereço. Tente novamente.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      searchAddress()
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address_search" className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Buscar Endereço
        </Label>
        <div className="flex gap-2 mt-2">
          <Input
            id="address_search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ex: Rua Francisco Augusto Rocha, 150 - Planalto - Belo Horizonte"
            className="rounded-xl flex-1"
            disabled={disabled || isSearching}
          />
          <Button
            type="button"
            onClick={searchAddress}
            disabled={disabled || isSearching || !searchQuery.trim()}
            className="rounded-xl bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Digite o endereço completo para busca automática
        </p>
      </div>
    </div>
  )
}