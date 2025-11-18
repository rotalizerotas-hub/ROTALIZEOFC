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
      console.log('🔍 [MAPBOX GEOCODING] Buscando:', searchQuery)

      // Token do Mapbox
      const mapboxToken = 'pk.eyJ1Ijoicm90YWxpemVvZmljaWFsIiwiYSI6ImNtaHdidmV2dTA1dTgya3B0dGNzZ2Q4ZHUifQ.1kJiJcybFKIyF_0rpNHmbA'

      // URL da API de Geocoding do Mapbox
      const encodedQuery = encodeURIComponent(searchQuery.trim())
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${mapboxToken}&country=BR&language=pt&limit=1&types=address,poi`

      console.log('🌐 [MAPBOX] Fazendo requisição...')

      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const data = await response.json()
      console.log('📡 [MAPBOX] Resposta completa:', data)

      if (!data.features || data.features.length === 0) {
        throw new Error('Endereço não encontrado')
      }

      const feature = data.features[0]
      const { geometry, place_name, context, properties } = feature

      console.log('📍 [MAPBOX] Feature selecionada:', feature)

      // Extrair componentes do endereço
      let street = ''
      let number = ''
      let neighborhood = ''
      let city = ''

      // Tentar extrair da place_name
      const placeParts = place_name.split(',').map((part: string) => part.trim())
      
      if (placeParts.length > 0) {
        const firstPart = placeParts[0]
        // Extrair número se existir
        const numberMatch = firstPart.match(/^(.+?)\s+(\d+)/)
        if (numberMatch) {
          street = numberMatch[1].trim()
          number = numberMatch[2]
        } else {
          street = firstPart
        }
      }

      // Extrair do contexto
      if (context) {
        context.forEach((item: any) => {
          const id = item.id || ''
          
          if (id.includes('neighborhood') || id.includes('locality')) {
            if (!neighborhood) neighborhood = item.text
          } else if (id.includes('place') || id.includes('district')) {
            if (!city) city = item.text
          } else if (id.includes('region')) {
            if (!city) city = item.text
          }
        })
      }

      // Fallbacks
      if (!neighborhood && placeParts.length > 1) {
        neighborhood = placeParts[1]
      }
      
      if (!city && placeParts.length > 2) {
        city = placeParts[placeParts.length - 1]
      }

      const addressData = {
        fullAddress: place_name,
        street: street || 'Rua não identificada',
        number: number || 'S/N',
        neighborhood: neighborhood || 'Bairro não identificado',
        city: city || 'Cidade não identificada',
        latitude: geometry.coordinates[1], // Mapbox usa [lng, lat]
        longitude: geometry.coordinates[0]
      }

      console.log('✅ [MAPBOX] Endereço processado:', addressData)
      
      onAddressFound(addressData)
      toast.success('Endereço encontrado!')

    } catch (error) {
      console.error('❌ [MAPBOX] Erro na busca:', error)
      toast.error('Endereço não encontrado. Tente ser mais específico.')
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
          Busca powered by Mapbox - Digite o endereço completo
        </p>
      </div>
    </div>
  )
}