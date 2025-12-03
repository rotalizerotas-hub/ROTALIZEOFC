'use client'

import * as React from 'react'
import { Check, ChevronDown, Plus, Search } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export type SearchableSelectOption = {
  value: string;
  label: string;
  emoji?: string;
}

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  allowCreate?: boolean;
  onCreateNew?: (searchTerm: string) => void;
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Selecione uma opção",
  searchPlaceholder = "Buscar...",
  emptyText = "Nenhum resultado encontrado.",
  className,
  allowCreate = false,
  onCreateNew,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')

  const selectedOption = React.useMemo(() => {
    return options.find(option => option.value === value)
  }, [options, value])

  const handleCreateNew = (term: string) => {
    if (allowCreate && onCreateNew) {
      onCreateNew(term)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between rounded-xl font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          {selectedOption ? (
            <span className="flex items-center gap-2 truncate">
              {selectedOption.emoji && <span>{selectedOption.emoji}</span>}
              {selectedOption.label}
            </span>
          ) : (
            placeholder
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder={searchPlaceholder} 
            className="h-9" 
            onValueChange={setSearchTerm}
          />
          <CommandEmpty className="py-2">
            <div className="px-2 py-1.5 text-sm text-center">
              {emptyText}
              {allowCreate && onCreateNew && searchTerm.length >= 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full justify-start font-normal gap-1 text-blue-600"
                  onClick={() => handleCreateNew(searchTerm)}
                >
                  <Plus className="h-4 w-4" />
                  Cadastrar "{searchTerm}"
                </Button>
              )}
            </div>
          </CommandEmpty>
          <CommandGroup className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.label}
                onSelect={() => {
                  onValueChange(option.value)
                  setOpen(false)
                }}
              >
                <div className="flex items-center gap-2 w-full">
                  {option.emoji && <span>{option.emoji}</span>}
                  <span>{option.label}</span>
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}