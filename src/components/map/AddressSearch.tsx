'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  const [loading, setLoading] = useState(false)

  const searchAddress = async () => {
    if (!searchQuery.trim()) {
      toast.error('Digite um endereço para buscar')
      return
    }

    setLoading(true)

    try {
      console.log('🔍 [ADDRESS SEARCH] Buscando endereço:', searchQuery)

      // Usar API do Nominatim (OpenStreetMap) para geocodificação
      const encodedQuery = encodeURIComponent(searchQuery + ', Brasil')
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1&addressdetails=1`
      )

      if (!response.ok) {
        throw new Error('Erro na busca de endereço')
      }

      const data = await response.json()

      if (!data || data.length === 0) {
        toast.error('Endereço não encontrado. Tente ser mais específico.')
        return
      }

      const result = data[0]
      const address = result.address || {}

      console.log('📍 [ADDRESS SEARCH] Resultado encontrado:', result)

      // Extrair componentes do endereço
      const street = address.road || address.street || ''
      const number = address.house_number || ''
      const neighborhood = address.neighbourhood || address.suburb || address.quarter || ''
      const city = address.city || address.town || address.village || address.municipality || ''
      
      const latitude = parseFloat(result.lat)
      const longitude = parseFloat(result.lon)

      if (!latitude || !longitude) {
        throw new Error('Coordenadas inválidas')
      }

      const addressData = {
        fullAddress: result.display_name,
        street,
        number,
        neighborhood,
        city,
        latitude,
        longitude
      }

      console.log('✅ [ADDRESS SEARCH] Endereço processado:', addressData)

      onAddressFound(addressData)
      toast.success('Endereço encontrado e localizado no mapa!')

    } catch (error) {
      console.error('❌ [ADDRESS SEARCH] Erro na busca:', error)
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
            id="address-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite o endereço completo (ex: Rua das Flores, 123, Centro, Belo Horizonte)"
            className="rounded-xl flex-1"
            disabled={disabled || loading}
          />
          <Button
            onClick={searchAddress}
            disabled={disabled || loading || !searchQuery.trim()}
            className="rounded-xl px-6"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          💡 Dica: Seja específico com o endereço para melhores resultados (rua, número, bairro, cidade)
        </p>
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
              disabled={disabled || loading}
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