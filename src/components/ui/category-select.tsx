"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, Search, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface CategoryOption {
  value: string
  label: string
  emoji: string
}

interface CategorySelectProps {
  options: CategoryOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  allowCreate?: boolean
  onCreateNew?: (searchTerm: string) => void
}

export function CategorySelect({
  options,
  value,
  onValueChange,
  placeholder = "Selecione uma categoria...",
  searchPlaceholder = "Busque por uma categoria...",
  allowCreate = false,
  onCreateNew,
}: CategorySelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const selectedOption = options.find((option) => option.value === value)

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  )

  const handleSelect = (selectedValue: string) => {
    onValueChange?.(selectedValue)
    setOpen(false)
    setSearchValue("")
  }

  const handleCreateNew = () => {
    if (onCreateNew && searchValue.trim()) {
      onCreateNew(searchValue.trim())
      setOpen(false)
      setSearchValue("")
    }
  }

  const clearSearch = () => {
    setSearchValue("")
  }

  const highlightMatch = (text: string, search: string) => {
    if (!search) return text
    
    const parts = text.split(new RegExp(`(${search})`, 'gi'))
    return parts.map((part, index) => 
      part.toLowerCase() === search.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 rounded px-1">
          {part}
        </mark>
      ) : part
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between rounded-xl h-12 bg-gradient-to-r from-background to-muted/20 hover:from-muted/30 hover:to-muted/40 transition-all duration-200 border-2 hover:border-primary/20"
        >
          {selectedOption ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                <span className="text-lg">{selectedOption.emoji}</span>
              </div>
              <span className="font-medium">{selectedOption.label}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Search className="h-4 w-4" />
              <span>{placeholder}</span>
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-full p-0 z-[9999] shadow-2xl border-2" 
        style={{ zIndex: 9999 }}
        side="bottom"
        align="start"
        sideOffset={8}
      >
        <Command className="rounded-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <CommandInput 
              placeholder={searchPlaceholder}
              value={searchValue}
              onValueChange={setSearchValue}
              className="h-12 pl-10 pr-10 text-sm border-0 border-b border-border/50 rounded-none focus:border-primary/50"
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <CommandList className="max-h-[320px] overflow-y-auto p-2">
            <CommandEmpty className="py-8 text-center">
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">Nenhuma categoria encontrada</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tente buscar com outros termos
                  </p>
                </div>
                {allowCreate && searchValue.trim() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCreateNew}
                    className="mx-auto flex items-center gap-2 rounded-lg"
                  >
                    <Sparkles className="h-4 w-4" />
                    Criar "{searchValue}"
                  </Button>
                )}
              </div>
            </CommandEmpty>
            
            {filteredOptions.length > 0 && (
              <CommandGroup>
                <div className="text-xs font-medium text-gray-600 px-2 py-1 mb-1">
                  {filteredOptions.length} categoria{filteredOptions.length !== 1 ? 's' : ''} encontrada{filteredOptions.length !== 1 ? 's' : ''}
                </div>
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className="cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all duration-150 px-3 py-3 rounded-lg mx-1 my-0.5 group border border-gray-200 bg-white"
                    onClick={() => handleSelect(option.value)}
                  >
                    <div className="flex items-center gap-3 w-full pointer-events-none">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300 flex items-center justify-center transition-all duration-150">
                        <span className="text-lg">{option.emoji}</span>
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-sm text-gray-900">
                          {highlightMatch(option.label, searchValue)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check
                          className={cn(
                            "h-4 w-4 text-blue-600 transition-opacity duration-150",
                            value === option.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelect(option.value)
                          }}
                          className="h-7 px-3 text-xs font-medium hover:bg-blue-600 hover:text-white transition-colors pointer-events-auto border-blue-300 text-blue-700"
                        >
                          Usar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CommandGroup>
            )}
            
            {allowCreate && searchValue.trim() && filteredOptions.length === 0 && (
              <CommandGroup>
                <div
                  className="cursor-pointer hover:bg-green-50 hover:border-green-200 transition-all duration-150 px-3 py-3 rounded-lg mx-1 my-0.5 group border border-gray-200 bg-white"
                  onClick={handleCreateNew}
                >
                  <div className="flex items-center gap-3 w-full pointer-events-none">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-green-200 group-hover:from-green-200 group-hover:to-green-300 flex items-center justify-center transition-all duration-150">
                      <Sparkles className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-sm text-gray-900">Criar categoria "{searchValue}"</span>
                      <p className="text-xs text-gray-600">Nova categoria personalizada</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCreateNew()
                      }}
                      className="h-7 px-3 text-xs font-medium hover:bg-green-600 hover:text-white transition-colors pointer-events-auto border-green-300 text-green-700"
                    >
                      Usar
                    </Button>
                  </div>
                </div>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}