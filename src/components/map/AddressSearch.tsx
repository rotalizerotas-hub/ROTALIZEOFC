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

      // Verificar se a API key está configurada
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        console.warn('⚠️ [ADDRESS] Google Maps API Key não configurada, usando coordenadas simuladas')
        
        // Simular resultado para desenvolvimento
        const simulatedResult = {
          fullAddress: searchQuery,
          street: 'Rua Exemplo',
          number: '123',
          neighborhood: 'Centro',
          city: 'Belo Horizonte',
          latitude: -19.9167 + (Math.random() - 0.5) * 0.01,
          longitude: -43.9345 + (Math.random() - 0.5) * 0.01
        }
        
        onAddressFound(simulatedResult)
        toast.success('Endereço encontrado! (Modo desenvolvimento)')
        return
      }

      // Melhorar a query de busca
      const encodedQuery = encodeURIComponent(searchQuery.trim())
      
      // Usar múltiplas tentativas com diferentes parâmetros
      const searchAttempts = [
        // Tentativa 1: Busca normal
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedQuery}&key=${apiKey}`,
        
        // Tentativa 2: Busca com região Brasil
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedQuery}&region=br&key=${apiKey}`,
        
        // Tentativa 3: Busca com componentes do Brasil
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedQuery}&components=country:BR&key=${apiKey}`
      ]

      let result = null
      let lastError = null

      for (const url of searchAttempts) {
        try {
          console.log('🔍 [ADDRESS] Tentativa de busca:', url.split('&key=')[0])
          
          const response = await fetch(url)
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          const data = await response.json()
          
          console.log('📍 [ADDRESS] Resposta da API:', data)

          if (data.status === 'OK' && data.results && data.results.length > 0) {
            result = data.results[0]
            break
          } else if (data.status === 'ZERO_RESULTS') {
            console.log('⚠️ [ADDRESS] Nenhum resultado encontrado para esta tentativa')
            continue
          } else {
            throw new Error(`API Error: ${data.status} - ${data.error_message || 'Erro desconhecido'}`)
          }
        } catch (error) {
          console.log('❌ [ADDRESS] Erro nesta tentativa:', error)
          lastError = error
          continue
        }
      }

      if (!result) {
        throw lastError || new Error('Nenhum endereço encontrado em todas as tentativas')
      }

      const { geometry, formatted_address, address_components } = result

      console.log('📍 [ADDRESS] Resultado encontrado:', result)

      // Extrair componentes do endereço com mais flexibilidade
      let street = ''
      let number = ''
      let neighborhood = ''
      let city = ''

      address_components.forEach((component: any) => {
        const types = component.types

        if (types.includes('route') && !street) {
          street = component.long_name
        } else if (types.includes('street_number') && !number) {
          number = component.long_name
        } else if ((types.includes('sublocality') || types.includes('neighborhood') || types.includes('sublocality_level_1')) && !neighborhood) {
          neighborhood = component.long_name
        } else if ((types.includes('administrative_area_level_2') || types.includes('locality')) && !city) {
          city = component.long_name
        }
      })

      // Fallback para extrair informações do endereço formatado se componentes estiverem vazios
      if (!street || !city) {
        const addressParts = formatted_address.split(',').map(part => part.trim())
        
        if (!street && addressParts.length > 0) {
          const firstPart = addressParts[0]
          const numberMatch = firstPart.match(/^(.+?)\s+(\d+)/)
          if (numberMatch) {
            street = numberMatch[1].trim()
            if (!number) number = numberMatch[2]
          } else {
            street = firstPart
          }
        }
        
        if (!city && addressParts.length > 1) {
          city = addressParts[addressParts.length - 2] || addressParts[addressParts.length - 1]
        }
      }

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
      
      // Mensagem de erro mais específica
      let errorMessage = 'Erro ao buscar endereço. '
      
      if (error instanceof Error) {
        if (error.message.includes('API Error')) {
          errorMessage += 'Problema com a API do Google Maps.'
        } else if (error.message.includes('HTTP')) {
          errorMessage += 'Problema de conexão.'
        } else {
          errorMessage += 'Tente um endereço mais específico.'
        }
      } else {
        errorMessage += 'Tente novamente.'
      }
      
      toast.error(errorMessage)
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