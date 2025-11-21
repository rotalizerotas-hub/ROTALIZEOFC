'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowRight, Sparkles, Star } from 'lucide-react'

interface EstablishmentType {
  id: string
  name: string
  emoji: string
  icon_url: string
}

interface CategorySelectorProps {
  onCategorySelect: (category: EstablishmentType) => void
}

// Configurações avançadas de tema por categoria com imagens 3D
const getCategoryTheme = (categoryName: string) => {
  const themes: Record<string, {
    colors: {
      primary: string
      secondary: string
      accent: string
      background: string
      text: string
      shadow: string
    }
    gradient: string
    backgroundImage: string
    description: string
    tagline: string
    features: string[]
    image3d: string
  }> = {
    'Pizzaria': {
      colors: {
        primary: '#dc2626',
        secondary: '#f97316',
        accent: '#fbbf24',
        background: 'from-red-50 via-orange-50 to-yellow-50',
        text: '#7f1d1d',
        shadow: 'rgba(220, 38, 38, 0.3)'
      },
      gradient: 'from-red-500 via-orange-500 to-yellow-500',
      backgroundImage: '🍕',
      description: 'Sabores autênticos da Itália',
      tagline: 'Tradição italiana em cada fatia',
      features: ['Massa artesanal', 'Ingredientes frescos', 'Forno à lenha'],
      image3d: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI4MCIgZmlsbD0iI0ZGQzEwNyIgc3Ryb2tlPSIjRkY4QjAwIiBzdHJva2Utd2lkdGg9IjQiLz48Y2lyY2xlIGN4PSI3MCIgY3k9IjgwIiByPSIxMiIgZmlsbD0iI0VGNDQ0NCIvPjxjaXJjbGUgY3g9IjEzMCIgY3k9IjkwIiByPSIxMCIgZmlsbD0iIzIyQzU1RSIvPjxjaXJjbGUgY3g9IjkwIiBjeT0iMTIwIiByPSI4IiBmaWxsPSIjRkZGRkZGIi8+PGNpcmNsZSBjeD0iMTIwIiBjeT0iMTMwIiByPSI2IiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+'
    },
    'Hamburgueria': {
      colors: {
        primary: '#d97706',
        secondary: '#f59e0b',
        accent: '#fbbf24',
        background: 'from-amber-50 via-yellow-50 to-orange-50',
        text: '#92400e',
        shadow: 'rgba(217, 119, 6, 0.3)'
      },
      gradient: 'from-amber-600 via-yellow-500 to-orange-500',
      backgroundImage: '🍔',
      description: 'Hambúrgueres artesanais irresistíveis',
      tagline: 'Sabor que conquista',
      features: ['Carne premium', 'Pão brioche', 'Molhos especiais'],
      image3d: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGVsbGlwc2UgY3g9IjEwMCIgY3k9IjYwIiByeD0iNzAiIHJ5PSIyMCIgZmlsbD0iI0ZGQzEwNyIvPjxyZWN0IHg9IjMwIiB5PSI4MCIgd2lkdGg9IjE0MCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzIyQzU1RSIgcng9IjEwIi8+PHJlY3QgeD0iMzAiIHk9IjEwNSIgd2lkdGg9IjE0MCIgaGVpZ2h0PSIyNSIgZmlsbD0iIzhCNTEzRiIgcng9IjEyIi8+PHJlY3QgeD0iMzAiIHk9IjEzNSIgd2lkdGg9IjE0MCIgaGVpZ2h0PSIxNSIgZmlsbD0iI0VGNDQ0NCIgcng9IjciLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTYwIiByeD0iNzAiIHJ5PSIyMCIgZmlsbD0iI0ZGQzEwNyIvPjwvc3ZnPg=='
    },
    'Farmácia': {
      colors: {
        primary: '#2563eb',
        secondary: '#3b82f6',
        accent: '#60a5fa',
        background: 'from-blue-50 via-indigo-50 to-cyan-50',
        text: '#1e3a8a',
        shadow: 'rgba(37, 99, 235, 0.3)'
      },
      gradient: 'from-blue-600 via-indigo-500 to-cyan-500',
      backgroundImage: '💊',
      description: 'Cuidando da sua saúde',
      tagline: 'Saúde e bem-estar sempre',
      features: ['Medicamentos', 'Cosméticos', 'Atendimento 24h'],
      image3d: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNzAiIHk9IjUwIiB3aWR0aD0iNjAiIGhlaWdodD0iMjAiIGZpbGw9IiNFRjQ0NDQiIHJ4PSIxMCIvPjxyZWN0IHg9IjkwIiB5PSIzMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRUY0NDQ0IiByeD0iMTAiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMzAiIHI9IjQwIiBmaWxsPSIjM0I4MkY2IiBzdHJva2U9IiMxRTNBOEEiIHN0cm9rZS13aWR0aD0iMyIvPjx0ZXh0IHg9IjEwMCIgeT0iMTM4IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4rPC90ZXh0Pjwvc3ZnPg=='
    },
    'Supermercado': {
      colors: {
        primary: '#059669',
        secondary: '#10b981',
        accent: '#34d399',
        background: 'from-green-50 via-emerald-50 to-teal-50',
        text: '#064e3b',
        shadow: 'rgba(5, 150, 105, 0.3)'
      },
      gradient: 'from-green-600 via-emerald-500 to-teal-500',
      backgroundImage: '🛒',
      description: 'Tudo que você precisa em um lugar',
      tagline: 'Variedade e qualidade',
      features: ['Produtos frescos', 'Preços baixos', 'Entrega rápida'],
      image3d: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNDAiIHk9IjgwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMTBCOTgxIiBzdHJva2U9IiMwNTk2NjkiIHN0cm9rZS13aWR0aD0iMyIgcng9IjEwIi8+PGNpcmNsZSBjeD0iNjAiIGN5PSIxODAiIHI9IjEyIiBmaWxsPSIjMzc0MTUxIi8+PGNpcmNsZSBjeD0iMTQwIiBjeT0iMTgwIiByPSIxMiIgZmlsbD0iIzM3NDE1MSIvPjxwYXRoIGQ9Ik00MCA4MFY2MEw1MCA0MEgxNTBMMTYwIDYwVjgwIiBmaWxsPSIjMzRENzk5IiBzdHJva2U9IiMwNTk2NjkiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg=='
    },
    'Restaurante': {
      colors: {
        primary: '#7c2d12',
        secondary: '#ea580c',
        accent: '#f97316',
        background: 'from-orange-50 via-amber-50 to-yellow-50',
        text: '#7c2d12',
        shadow: 'rgba(124, 45, 18, 0.3)'
      },
      gradient: 'from-orange-700 via-amber-600 to-yellow-500',
      backgroundImage: '🍽️',
      description: 'Experiência gastronômica única',
      tagline: 'Alta gastronomia ao seu alcance',
      features: ['Pratos gourmet', 'Chef especializado', 'Ambiente refinado'],
      image3d: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI3MCIgZmlsbD0iI0ZGRkZGRiIgc3Ryb2tlPSIjN0MyRDEyIiBzdHJva2Utd2lkdGg9IjQiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjUwIiBmaWxsPSIjRkY5NzMzIiBvcGFjaXR5PSIwLjMiLz48cGF0aCBkPSJNNzAgNjBMMTMwIDYwTDEyMCA4MEw4MCA4MFoiIGZpbGw9IiNFQTU4MEMiLz48cGF0aCBkPSJNODAgMTIwTDEyMCAxMjBMMTEwIDE0MEw5MDE0MFoiIGZpbGw9IiMyMkM1NUUiLz48L3N2Zz4='
    },
    'Lanchonete': {
      colors: {
        primary: '#7c3aed',
        secondary: '#8b5cf6',
        accent: '#a78bfa',
        background: 'from-purple-50 via-violet-50 to-indigo-50',
        text: '#581c87',
        shadow: 'rgba(124, 58, 237, 0.3)'
      },
      gradient: 'from-purple-600 via-violet-500 to-indigo-500',
      backgroundImage: '🥪',
      description: 'Lanches rápidos e saborosos',
      tagline: 'Praticidade sem abrir mão do sabor',
      features: ['Lanches variados', 'Entrega rápida', 'Preços acessíveis'],
      image3d: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMzAiIHk9IjcwIiB3aWR0aD0iMTQwIiBoZWlnaHQ9IjE1IiBmaWxsPSIjRkZDMTA3IiByeD0iNyIvPjxyZWN0IHg9IjMwIiB5PSI5MCIgd2lkdGg9IjE0MCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzIyQzU1RSIgcng9IjUiLz48cmVjdCB4PSIzMCIgeT0iMTA1IiB3aWR0aD0iMTQwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjOEI1MTNGIiByeD0iMTAiLz48cmVjdCB4PSIzMCIgeT0iMTMwIiB3aWR0aD0iMTQwIiBoZWlnaHQ9IjE1IiBmaWxsPSIjRkZDMTA3IiByeD0iNyIvPjwvc3ZnPg=='
    },
    'Sorveteria': {
      colors: {
        primary: '#ec4899',
        secondary: '#f472b6',
        accent: '#f9a8d4',
        background: 'from-pink-50 via-rose-50 to-red-50',
        text: '#9d174d',
        shadow: 'rgba(236, 72, 153, 0.3)'
      },
      gradient: 'from-pink-600 via-rose-500 to-red-500',
      backgroundImage: '🍦',
      description: 'Refrescância em cada colherada',
      tagline: 'Momentos doces e refrescantes',
      features: ['Sabores únicos', 'Ingredientes naturais', 'Receitas artesanais'],
      image3d: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iNzAiIHI9IjMwIiBmaWxsPSIjRjQ3MkI2Ii8+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTEwIiByPSIyNSIgZmlsbD0iI0Y5QThENCIvPjxyZWN0IHg9Ijk1IiB5PSIxNDAiIHdpZHRoPSIxMCIgaGVpZ2h0PSI0MCIgZmlsbD0iI0ZGQzEwNyIgcng9IjUiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI0MCIgcj0iMjAiIGZpbGw9IiNGRkZGRkYiLz48L3N2Zz4='
    },
    'Padaria': {
      colors: {
        primary: '#a16207',
        secondary: '#ca8a04',
        accent: '#eab308',
        background: 'from-yellow-50 via-amber-50 to-orange-50',
        text: '#713f12',
        shadow: 'rgba(161, 98, 7, 0.3)'
      },
      gradient: 'from-yellow-700 via-amber-600 to-orange-500',
      backgroundImage: '🥖',
      description: 'Pães frescos todos os dias',
      tagline: 'Tradição e frescor em cada pão',
      features: ['Pães artesanais', 'Doces caseiros', 'Café da manhã'],
      image3d: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGVsbGlwc2UgY3g9IjEwMCIgY3k9IjEwMCIgcng9IjcwIiByeT0iMzAiIGZpbGw9IiNFQUIzMDgiIHN0cm9rZT0iI0ExNjIwNyIgc3Ryb2tlLXdpZHRoPSIzIi8+PGVsbGlwc2UgY3g9IjEwMCIgY3k9Ijk1IiByeD0iNjAiIHJ5PSIyNSIgZmlsbD0iI0ZGRkZGRiIgb3BhY2l0eT0iMC4zIi8+PGxpbmUgeDE9IjUwIiB5MT0iMTAwIiB4Mj0iMTUwIiB5Mj0iMTAwIiBzdHJva2U9IiNBMTYyMDciIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg=='
    },
    'Açaí': {
      colors: {
        primary: '#7c2d12',
        secondary: '#dc2626',
        accent: '#f87171',
        background: 'from-red-50 via-pink-50 to-purple-50',
        text: '#7f1d1d',
        shadow: 'rgba(124, 45, 18, 0.3)'
      },
      gradient: 'from-red-700 via-pink-600 to-purple-500',
      backgroundImage: '🍇',
      description: 'Energia natural e sabor',
      tagline: 'Energia pura da natureza',
      features: ['Açaí premium', 'Frutas frescas', 'Complementos naturais'],
      image3d: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGVsbGlwc2UgY3g9IjEwMCIgY3k9IjE0MCIgcng9IjUwIiByeT0iMjAiIGZpbGw9IiM3QzJEMTIiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjQ1IiBmaWxsPSIjN0MyRDEyIiBzdHJva2U9IiM0QzFEOTUiIHN0cm9rZS13aWR0aD0iMyIvPjxjaXJjbGUgY3g9IjkwIiBjeT0iODAiIHI9IjgiIGZpbGw9IiNGRkZGRkYiLz48Y2lyY2xlIGN4PSIxMTAiIGN5PSI5MCIgcj0iNiIgZmlsbD0iI0ZGRkZGRiIvPjxjaXJjbGUgY3g9IjEwNSIgY3k9IjExNSIgcj0iNCIgZmlsbD0iI0ZGRkZGRiIvPjwvc3ZnPg=='
    },
    'Sushi': {
      colors: {
        primary: '#1f2937',
        secondary: '#374151',
        accent: '#6b7280',
        background: 'from-gray-50 via-slate-50 to-zinc-50',
        text: '#111827',
        shadow: 'rgba(31, 41, 55, 0.3)'
      },
      gradient: 'from-gray-800 via-slate-700 to-zinc-600',
      backgroundImage: '🍣',
      description: 'Tradição japonesa autêntica',
      tagline: 'Arte e sabor do Japão',
      features: ['Peixes frescos', 'Técnica tradicional', 'Apresentação única'],
      image3d: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGVsbGlwc2UgY3g9IjEwMCIgY3k9IjEyMCIgcng9IjYwIiByeT0iMjAiIGZpbGw9IiNGRkZGRkYiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTEwIiByeD0iNjAiIHJ5PSIxNSIgZmlsbD0iI0VGNDQ0NCIvPjxlbGxpcHNlIGN4PSIxMDAiIGN5PSIxMDAiIHJ4PSI2MCIgcnk9IjEwIiBmaWxsPSIjMjJDNTVFIi8+PGVsbGlwc2UgY3g9IjEwMCIgY3k9Ijk1IiByeD0iNjAiIHJ5PSIxNSIgZmlsbD0iIzFGMjkzNyIvPjwvc3ZnPg=='
    }
  }

  return themes[categoryName] || {
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#a78bfa',
      background: 'from-indigo-50 via-purple-50 to-pink-50',
      text: '#4338ca',
      shadow: 'rgba(99, 102, 241, 0.3)'
    },
    gradient: 'from-indigo-500 to-purple-500',
    backgroundImage: '🏪',
    description: 'Categoria especial',
    tagline: 'Experiência única',
    features: ['Qualidade', 'Atendimento', 'Tradição'],
    image3d: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTAiIHk9IjUwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzYzNjZGMSIgcng9IjEwIi8+PC9zdmc+'
  }
}

export function CategorySelector({ onCategorySelect }: CategorySelectorProps) {
  const [categories, setCategories] = useState<EstablishmentType[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<EstablishmentType | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const { data } = await supabase
        .from('establishment_types')
        .select('*')
        .order('name')

      setCategories(data || [])
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySelect = (category: EstablishmentType) => {
    setSelectedCategory(category)
    onCategorySelect(category)
    
    // Salvar categoria selecionada no localStorage
    localStorage.setItem('selectedCategory', JSON.stringify(category))
  }

  const handleContinue = () => {
    if (selectedCategory) {
      router.push('/novo-pedido-manual')
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="h-32 animate-pulse bg-gray-200 rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Compacto */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          Escolha sua categoria
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Que tipo de estabelecimento você representa?
        </h2>
      </div>

      {/* Grid Compacto de Categorias */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-h-96 overflow-y-auto">
        {categories.map((category) => {
          const theme = getCategoryTheme(category.name)
          const isSelected = selectedCategory?.id === category.id
          
          return (
            <Card
              key={category.id}
              className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-2xl border-0 h-32 ${
                isSelected 
                  ? 'ring-4 ring-offset-2 shadow-2xl scale-105' 
                  : 'hover:shadow-lg'
              }`}
              style={{
                ringColor: isSelected ? theme.colors.primary : 'transparent',
                boxShadow: isSelected ? `0 20px 40px ${theme.colors.shadow}` : undefined
              }}
              onClick={() => handleCategorySelect(category)}
            >
              {/* Background com imagem 3D */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${theme.colors.background} opacity-95`}
              />
              
              {/* Imagem 3D de fundo */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `url("${theme.image3d}")`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center'
                }}
              />

              {/* Padrão decorativo */}
              <div 
                className="absolute top-0 right-0 w-16 h-16 opacity-10"
                style={{
                  background: `radial-gradient(circle, ${theme.colors.primary} 2px, transparent 2px)`,
                  backgroundSize: '8px 8px'
                }}
              />

              <CardContent className="relative p-4 h-full flex flex-col justify-between">
                {/* Header da categoria */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div 
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg bg-gradient-to-br ${theme.gradient} shadow-lg`}
                    >
                      <span className="text-white">{category.emoji}</span>
                    </div>
                    {isSelected && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      </div>
                    )}
                  </div>
                  
                  <h3 
                    className="font-bold text-sm leading-tight"
                    style={{ color: theme.colors.text }}
                  >
                    {category.name}
                  </h3>
                  
                  <p 
                    className="text-xs leading-tight opacity-80"
                    style={{ color: theme.colors.text }}
                  >
                    {theme.tagline}
                  </p>
                </div>

                {/* Indicador de seleção */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {isSelected && (
                      <div 
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                    )}
                    <span 
                      className={`text-xs font-medium ${
                        isSelected ? 'opacity-100' : 'opacity-60'
                      }`}
                      style={{ color: theme.colors.text }}
                    >
                      {isSelected ? 'Selecionado' : 'Selecionar'}
                    </span>
                  </div>
                  
                  {isSelected && (
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: theme.colors.primary, color: 'white' }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Preview da Categoria Selecionada */}
      {selectedCategory && (
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              {/* Imagem 3D grande */}
              <div 
                className="w-24 h-24 rounded-2xl flex-shrink-0"
                style={{
                  backgroundImage: `url("${getCategoryTheme(selectedCategory.name).image3d}")`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundColor: getCategoryTheme(selectedCategory.name).colors.background
                }}
              />
              
              {/* Informações detalhadas */}
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {selectedCategory.name}
                  </h3>
                  <p className="text-gray-600">
                    {getCategoryTheme(selectedCategory.name).description}
                  </p>
                </div>
                
                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {getCategoryTheme(selectedCategory.name).features.map((feature, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: getCategoryTheme(selectedCategory.name).colors.primary + '20',
                        color: getCategoryTheme(selectedCategory.name).colors.primary
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Botão Continuar */}
              <Button
                onClick={handleContinue}
                size="lg"
                className={`px-6 py-3 rounded-2xl text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r ${getCategoryTheme(selectedCategory.name).gradient}`}
              >
                Continuar
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}