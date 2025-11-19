'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

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

  const searchAddress = async () => {
    if (!searchQuery.trim()) {
      toast.error('Digite um endereço para buscar')
      return
    }

    setLoading(true)

    try {
      console.log('🔍 [ADDRESS SEARCH] Buscando:', searchQuery)

      // Usar Nominatim como fallback
      const encodedQuery = encodeURIComponent(searchQuery + ', Brasil')
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1&addressdetails=1`
      )

      if (!response.ok) {
        throw new Error('Erro na busca')
      }

      const data = await response.json()

      if (!data || data.length === 0) {
        toast.error('Endereço não encontrado')
        return
      }

      const result = data[0]
      const address = result.address || {}

      const addressData = {
        fullAddress: result.display_name,
        street: address.road || address.street || '',
        number: address.house_number || '',
        neighborhood: address.neighbourhood || address.suburb || '',
        city: address.city || address.town || '',
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      }

      onAddressFound(addressData)
      toast.success('Endereço encontrado!')

    } catch (error) {
      console.error('❌ [ADDRESS SEARCH] Erro:', error)
      toast.error('Erro ao buscar endereço')
    } finally {
      setLoading(false)
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
            placeholder="Digite o endereço completo"
            className="rounded-xl flex-1"
            disabled={disabled || loading}
            onKeyPress={(e) => e.key === 'Enter' && searchAddress()}
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
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-gray-600">Exemplos:</Label>
        <div className="flex flex-wrap gap-2">
          {[
            'Rua da Bahia, 1200, Centro, Belo Horizonte',
            'Avenida Paulista, 1000, São Paulo'
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