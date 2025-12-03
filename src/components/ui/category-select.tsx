'use client'

import * as React from 'react'
import { useState, useEffect, useRef } from 'react'
import { Search, Plus, Check, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface CategoryOption {
  value: string
  label: string
  emoji?: string
}

interface CategorySelectProps {
  options: CategoryOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  allowCreate?: boolean
  onCreateNew?: (term: string) => void
  className?: string
}

export function CategorySelect({
  options,
  value,
  onValueChange,
  placeholder = "Busque por uma categoria...",
  searchPlaceholder = "Digite para buscar...",
  allowCreate = false,
  onCreateNew,
  className
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredOptions, setFilteredOptions] = useState<CategoryOption[]>(options)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find(option => option.value === value)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Atualiza as opções filtradas com base no termo de pesquisa
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOptions(options)
      return
    }

    const normalizedSearchTerm = searchTerm.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const filtered = options.filter(option => {
      const normalizedLabel = option.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      return normalizedLabel.includes(normalizedSearchTerm)
    })
    
    setFilteredOptions(filtered)
  }, [searchTerm, options])

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setSearchTerm('')
      setFilteredOptions(options)
    }
  }

  const handleSelect = (option: CategoryOption) => {
    onValueChange(option.value)
    setIsOpen(false)
  }

  const handleCreateNew = () => {
    if (allowCreate && onCreateNew && searchTerm.trim()) {
      onCreateNew(searchTerm)
      setIsOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'Enter' && searchTerm && filteredOptions.length === 0 && allowCreate && onCreateNew) {
      e.preventDefault()
      handleCreateNew()
    }
  }

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {/* Botão de seleção */}
      <div
        className={cn(
          "flex items-center w-full border rounded-xl px-4 py-2 h-10 bg-white cursor-pointer transition-all",
          isOpen ? "border-blue-500 shadow-sm ring-1 ring-blue-500" : "border-gray-200 hover:border-gray-400",
        )}
        onClick={toggleDropdown}
      >
        {selectedOption ? (
          <div className="flex items-center gap-2 flex-1 text-slate-900">
            {selectedOption.emoji && <span>{selectedOption.emoji}</span>}
            <span>{selectedOption.label}</span>
          </div>
        ) : (
          <span className="flex-1 text-gray-400">{placeholder}</span>
        )}
        <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform", 
          isOpen ? "transform rotate-180" : "")} />
      </div>

      {/* Dropdown de busca e seleção */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          {/* Campo de busca */}
          <div className="p-2 border-b border-gray-100 flex items-center relative">
            <Search className="absolute left-4 w-4 h-4 text-gray-400" />
            <Input
              ref={inputRef}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 pr-8 h-9 focus-visible:ring-0 border-gray-200 rounded-lg"
              onKeyDown={handleKeyDown}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-4 p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Lista de resultados */}
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-md cursor-pointer",
                    value === option.value 
                      ? "bg-blue-50 text-blue-700" 
                      : "hover:bg-gray-50"
                  )}
                  onClick={() => handleSelect(option)}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {option.emoji && <span className="text-xl">{option.emoji}</span>}
                    <span>{option.label}</span>
                  </div>
                  {value === option.value && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              ))
            ) : (
              <div className="py-4 px-2 text-center">
                <p className="text-gray-500 text-sm">Nenhuma categoria encontrada</p>
                
                {allowCreate && onCreateNew && searchTerm.trim() && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCreateNew}
                    className="mt-2 font-normal text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-full gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Criar categoria "{searchTerm}"
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}