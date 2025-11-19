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
      console.log('🔍 [ADDRESS] Iniciando busca para:', searchQuery)

      // Usar OpenStreetMap Nominatim API (gratuita)
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=1`
      console.log('🌐 [ADDRESS] URL da requisição:', url)

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'RotaLize-App/1.0'
        }
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const data = await response.json()
      console.log('📡 [ADDRESS] Resposta da API:', data)

      if (!data || data.length === 0) {
        throw new Error('Endereço não encontrado')
      }

      const result = data[0]
      const { lat, lon, display_name, address } = result

      console.log('📍 [ADDRESS] Resultado encontrado:', result)

      // Extrair componentes do endereço
      const addressData = {
        fullAddress: display_name,
        street: address?.road || address?.pedestrian || 'Rua não identificada',
        number: address?.house_number || 'S/N',
        neighborhood: address?.neighbourhood || address?.suburb || address?.quarter || 'Bairro não identificado',
        city: address?.city || address?.town || address?.municipality || 'Cidade não identificada',
        latitude: parseFloat(lat),
        longitude: parseFloat(lon)
      }

      console.log('✅ [ADDRESS] Dados processados:', addressData)

      onAddressFound(addressData)
      toast.success('Endereço encontrado e marcado no mapa!')

    } catch (error) {
      console.error('❌ [ADDRESS] Erro na busca:', error)
      
      if (error instanceof Error) {
        if (error.message.includes('não encontrado')) {
          toast.error('Endereço não encontrado. Tente ser mais específico.')
        } else {
          toast.error(`Erro na busca: ${error.message}`)
        }
      } else {
        toast.error('Erro desconhecido na busca do endereço')
      }
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
        <div className="mt-2 space-y-1">
          <p className="text-xs text-gray-500">
            Digite o endereço completo para busca automática
          </p>
          <p className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
            ✅ Usando OpenStreetMap - Busca gratuita e sem API key
          </p>
        </div>
      </div>
    </div>
  )
}