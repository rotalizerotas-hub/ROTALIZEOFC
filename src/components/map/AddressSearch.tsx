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

  const createFallbackAddress = (query: string) => {
    console.log('🔄 [FALLBACK] Criando endereço baseado no texto:', query)
    
    const addressParts = query.split(',').map(s => s.trim())
    let street = 'Rua Exemplo'
    let number = '100'
    let neighborhood = 'Centro'
    let city = 'Belo Horizonte'
    
    // Tentar extrair informações do texto
    if (addressParts.length >= 1) {
      const firstPart = addressParts[0]
      const numberMatch = firstPart.match(/^(.+?)\s+(\d+)/)
      if (numberMatch) {
        street = numberMatch[1]
        number = numberMatch[2]
      } else {
        street = firstPart
      }
    }
    
    if (addressParts.length >= 2) {
      neighborhood = addressParts[1]
    }
    
    if (addressParts.length >= 3) {
      city = addressParts[2]
    }

    // Coordenadas de Belo Horizonte com variação baseada no endereço
    const hash = query.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    const latitude = -19.9167 + (hash % 1000) / 100000
    const longitude = -43.9345 + (hash % 1000) / 100000

    return {
      fullAddress: query,
      street: street,
      number: number,
      neighborhood: neighborhood,
      city: city,
      latitude: latitude,
      longitude: longitude
    }
  }

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

      // Tentar múltiplas variações da busca
      const searchVariations = [
        searchQuery.trim(),
        searchQuery.trim() + ', Brasil',
        searchQuery.trim() + ', Belo Horizonte, MG',
        searchQuery.trim() + ', MG, Brasil'
      ]

      let foundAddress = null

      for (const variation of searchVariations) {
        try {
          console.log('🌐 [MAPBOX] Tentando variação:', variation)
          
          const encodedQuery = encodeURIComponent(variation)
          const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${mapboxToken}&country=BR&language=pt&limit=1`

          const response = await fetch(url)
          
          if (!response.ok) {
            console.warn(`⚠️ [MAPBOX] Erro HTTP ${response.status} para: ${variation}`)
            continue
          }

          const data = await response.json()
          console.log('📡 [MAPBOX] Resposta para', variation, ':', data)

          if (data.features && data.features.length > 0) {
            foundAddress = data.features[0]
            console.log('✅ [MAPBOX] Endereço encontrado com variação:', variation)
            break
          }
        } catch (error) {
          console.warn('⚠️ [MAPBOX] Erro na variação', variation, ':', error)
          continue
        }
      }

      if (!foundAddress) {
        throw new Error('Nenhuma variação encontrou resultados')
      }

      const { geometry, place_name, context } = foundAddress

      console.log('📍 [MAPBOX] Feature selecionada:', foundAddress)

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
      
      // Fallback: criar endereço baseado no texto digitado
      console.log('🔄 [FALLBACK] Usando endereço simulado')
      
      const fallbackData = createFallbackAddress(searchQuery)
      
      console.log('✅ [FALLBACK] Endereço criado:', fallbackData)
      onAddressFound(fallbackData)
      toast.success('Endereço localizado! (Modo simulado)', {
        description: 'Não foi possível encontrar o endereço exato, mas criamos uma localização aproximada.'
      })
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

  // Função para testar a API
  const testMapboxAPI = async () => {
    try {
      const testQuery = 'Praça da Liberdade, Belo Horizonte'
      const mapboxToken = 'pk.eyJ1Ijoicm90YWxpemVvZmljaWFsIiwiYSI6ImNtaHdidmV2dTA1dTgya3B0dGNzZ2Q4ZHUifQ.1kJiJcybFKIyF_0rpNHmbA'
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(testQuery)}.json?access_token=${mapboxToken}&country=BR&limit=1`
      
      const response = await fetch(url)
      const data = await response.json()
      
      console.log('🧪 [TEST] Teste da API Mapbox:', data)
      
      if (data.features && data.features.length > 0) {
        toast.success('API Mapbox funcionando!')
      } else {
        toast.error('API Mapbox não retornou resultados')
      }
    } catch (error) {
      console.error('🧪 [TEST] Erro no teste da API:', error)
      toast.error('Erro ao testar API Mapbox')
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
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-500">
            Busca powered by Mapbox - Digite o endereço completo
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={testMapboxAPI}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Testar API
          </Button>
        </div>
      </div>
    </div>
  )
}