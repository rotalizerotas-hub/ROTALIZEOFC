'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowRight, Sparkles } from 'lucide-react'

interface EstablishmentType {
  id: string
  name: string
  emoji: string
  icon_url: string
}

interface CategorySelectorProps {
  onCategorySelect: (category: EstablishmentType) => void
}

// Configurações de tema por categoria
const getCategoryTheme = (categoryName: string) => {
  const themes: Record<string, {
    colors: {
      primary: string
      secondary: string
      accent: string
      background: string
      text: string
    }
    gradient: string
    backgroundImage: string
    description: string
  }> = {
    'Pizzaria': {
      colors: {
        primary: '#dc2626',
        secondary: '#f97316',
        accent: '#fbbf24',
        background: 'from-red-50 via-orange-50 to-yellow-50',
        text: '#7f1d1d'
      },
      gradient: 'from-red-500 to-orange-500',
      backgroundImage: '🍕',
      description: 'Sabores autênticos da Itália'
    },
    'Hamburgueria': {
      colors: {
        primary: '#d97706',
        secondary: '#f59e0b',
        accent: '#fbbf24',
        background: 'from-amber-50 via-yellow-50 to-orange-50',
        text: '#92400e'
      },
      gradient: 'from-amber-500 to-yellow-500',
      backgroundImage: '🍔',
      description: 'Hambúrgueres artesanais irresistíveis'
    },
    'Farmácia': {
      colors: {
        primary: '#2563eb',
        secondary: '#3b82f6',
        accent: '#60a5fa',
        background: 'from-blue-50 via-indigo-50 to-cyan-50',
        text: '#1e3a8a'
      },
      gradient: 'from-blue-500 to-indigo-500',
      backgroundImage: '💊',
      description: 'Cuidando da sua saúde'
    },
    'Supermercado': {
      colors: {
        primary: '#059669',
        secondary: '#10b981',
        accent: '#34d399',
        background: 'from-green-50 via-emerald-50 to-teal-50',
        text: '#064e3b'
      },
      gradient: 'from-green-500 to-emerald-500',
      backgroundImage: '🛒',
      description: 'Tudo que você precisa em um lugar'
    },
    'Restaurante': {
      colors: {
        primary: '#7c2d12',
        secondary: '#ea580c',
        accent: '#f97316',
        background: 'from-orange-50 via-amber-50 to-yellow-50',
        text: '#7c2d12'
      },
      gradient: 'from-orange-600 to-amber-500',
      backgroundImage: '🍽️',
      description: 'Experiência gastronômica única'
    },
    'Lanchonete': {
      colors: {
        primary: '#7c3aed',
        secondary: '#8b5cf6',
        accent: '#a78bfa',
        background: 'from-purple-50 via-violet-50 to-indigo-50',
        text: '#581c87'
      },
      gradient: 'from-purple-500 to-violet-500',
      backgroundImage: '🥪',
      description: 'Lanches rápidos e saborosos'
    },
    'Sorveteria': {
      colors: {
        primary: '#ec4899',
        secondary: '#f472b6',
        accent: '#f9a8d4',
        background: 'from-pink-50 via-rose-50 to-red-50',
        text: '#9d174d'
      },
      gradient: 'from-pink-500 to-rose-500',
      backgroundImage: '🍦',
      description: 'Refrescância em cada colherada'
    },
    'Padaria': {
      colors: {
        primary: '#a16207',
        secondary: '#ca8a04',
        accent: '#eab308',
        background: 'from-yellow-50 via-amber-50 to-orange-50',
        text: '#713f12'
      },
      gradient: 'from-yellow-600 to-amber-500',
      backgroundImage: '🥖',
      description: 'Pães frescos todos os dias'
    },
    'Açaí': {
      colors: {
        primary: '#7c2d12',
        secondary: '#dc2626',
        accent: '#f87171',
        background: 'from-red-50 via-pink-50 to-purple-50',
        text: '#7f1d1d'
      },
      gradient: 'from-red-600 to-pink-500',
      backgroundImage: '🍇',
      description: 'Energia natural e sabor'
    },
    'Sushi': {
      colors: {
        primary: '#1f2937',
        secondary: '#374151',
        accent: '#6b7280',
        background: 'from-gray-50 via-slate-50 to-zinc-50',
        text: '#111827'
      },
      gradient: 'from-gray-700 to-slate-600',
      backgroundImage: '🍣',
      description: 'Tradição japonesa autêntica'
    }
  }

  return themes[categoryName] || {
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#a78bfa',
      background: 'from-indigo-50 via-purple-50 to-pink-50',
      text: '#4338ca'
    },
    gradient: 'from-indigo-500 to-purple-500',
    backgroundImage: '🏪',
    description: 'Categoria especial'
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-48 animate-pulse bg-gray-200 rounded-3xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          Escolha sua categoria
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Que tipo de estabelecimento você representa?
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Selecione a categoria que melhor representa seu negócio. O design será personalizado para sua área.
        </p>
      </div>

      {/* Grid de Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const theme = getCategoryTheme(category.name)
          const isSelected = selectedCategory?.id === category.id
          
          return (
            <Card
              key={category.id}
              className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-3xl border-0 ${
                isSelected 
                  ? 'ring-4 ring-offset-4 shadow-2xl scale-105' 
                  : 'hover:shadow-xl'
              }`}
              style={{
                ringColor: isSelected ? theme.colors.primary : 'transparent'
              }}
              onClick={() => handleCategorySelect(category)}
            >
              {/* Background com gradiente temático */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${theme.colors.background} opacity-90`}
              />
              
              {/* Emoji de fundo decorativo */}
              <div 
                className="absolute -top-4 -right-4 text-8xl opacity-10 select-none"
                style={{ color: theme.colors.primary }}
              >
                {theme.backgroundImage}
              </div>

              <CardContent className="relative p-6 h-48 flex flex-col justify-between">
                {/* Header da categoria */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-gradient-to-br ${theme.gradient} shadow-lg`}
                    >
                      <span className="text-white">{category.emoji}</span>
                    </div>
                    <div>
                      <h3 
                        className="font-bold text-lg"
                        style={{ color: theme.colors.text }}
                      >
                        {category.name}
                      </h3>
                    </div>
                  </div>
                  
                  <p 
                    className="text-sm leading-relaxed"
                    style={{ color: theme.colors.text }}
                  >
                    {theme.description}
                  </p>
                </div>

                {/* Indicador de seleção */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <div 
                        className="w-3 h-3 rounded-full animate-pulse"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                    )}
                    <span 
                      className={`text-sm font-medium ${
                        isSelected ? 'opacity-100' : 'opacity-60'
                      }`}
                      style={{ color: theme.colors.text }}
                    >
                      {isSelected ? 'Selecionado' : 'Clique para selecionar'}
                    </span>
                  </div>
                  
                  {isSelected && (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Botão Continuar */}
      {selectedCategory && (
        <div className="flex justify-center pt-8">
          <Button
            onClick={handleContinue}
            size="lg"
            className={`px-8 py-4 rounded-2xl text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r ${getCategoryTheme(selectedCategory.name).gradient}`}
          >
            Continuar com {selectedCategory.name}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}