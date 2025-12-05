"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
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
  searchPlaceholder = "Buscar categoria...",
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between rounded-xl h-12"
        >
          {selectedOption ? (
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedOption.emoji}</span>
              <span>{selectedOption.label}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-full p-0 z-[9999]" 
        style={{ zIndex: 9999 }}
        side="bottom"
        align="start"
        sideOffset={4}
      >
        <Command>
          <CommandInput 
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
            className="h-12"
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty className="py-6 text-center text-sm">
              <div className="space-y-2">
                <p>Nenhuma categoria encontrada.</p>
                {allowCreate && searchValue.trim() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCreateNew}
                    className="mx-auto flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Criar "{searchValue}"
                  </Button>
                )}
              </div>
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-lg">{option.emoji}</span>
                    <span className="flex-1">{option.label}</span>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {allowCreate && searchValue.trim() && filteredOptions.length === 0 && (
              <CommandGroup>
                <CommandItem
                  onSelect={handleCreateNew}
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Plus className="h-4 w-4" />
                    <span>Criar categoria "{searchValue}"</span>
                  </div>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}