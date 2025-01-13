"use client"

import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react'
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
import { Badge } from "@/components/ui/badge"
import { useDebounce } from "use-debounce"
import { useCallback, useEffect, useState } from "react"

export type Category = {
    label: string
    id: string
    translation?: string
    style?: {
        backgroundColor?: string
        textColor?: string
    }
}

interface CategoryComboboxProps {
    selected: string[]
    onChange: (values: string[]) => void
    onSearch: (query: string) => Promise<Category[]>
}

export function CategoryCombobox({
    selected,
    onChange,
    onSearch,
}: CategoryComboboxProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [inputValue, setInputValue] = useState("")

    const [debouncedValue] = useDebounce(inputValue, 300)

    useEffect(() => {
        async function fetchCategories() {
            setLoading(true)
            try {
                const results = await onSearch(debouncedValue)
                
                console.log('results', results)
                // If we have selected items, ensure they're included in the results
                if (selected.length > 0) {
                    const selectedNotInResults = selected.filter(
                        value => !results.some(c => c.id === value)
                    )
                    
                    if (selectedNotInResults.length > 0) {
                        const selectedCategories = await Promise.all(
                            selectedNotInResults.map(value => onSearch(value))
                        )
                        
                        // Combine and deduplicate
                        const allCategories = [
                            ...results,
                            ...selectedCategories.flat()
                        ].filter((category, index, self) => 
                            index === self.findIndex(c => c.id === category.id)
                        )

                        console.log('allCategories', allCategories)
                        setCategories(allCategories)
                        return
                    }
                }
                console.log('final results', results)
                setCategories(results)
            } catch (error) {
                console.error("Failed to search categories:", error)
                setCategories([])
            } finally {
                setLoading(false)
            }
        }

        fetchCategories()
    }, [debouncedValue, onSearch, selected])

    const handleSelect = useCallback((value: string) => {
        onChange(selected.includes(value)
            ? selected.filter((item) => item !== value)
            : [...selected, value]
        )
    }, [onChange, selected])

    const handleRemove = useCallback((value: string) => {
        onChange(selected.filter((item) => item !== value))
    }, [onChange, selected])

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
                {selected.map((value, index) => {
                    const category = categories.find((c) => c.id === value)
                    if (!category) return null
                    
                    return (
                        <Badge
                            key={`badge-${category.id}-${index}`}
                            variant="secondary"
                            style={category.style}
                        >
                            {category.label}
                            <button
                                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleRemove(category.id)
                                    }
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                }}
                                onClick={() => handleRemove(category.id)}
                            >
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                <span className="sr-only">Remove {category.label}</span>
                            </button>
                        </Badge>
                    )
                })}
            </div>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        <span className="truncate">
                            {selected.length === 0
                                ? "Select categories..."
                                : `${selected.length} selected`}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Search categories..."
                            value={inputValue}
                            onValueChange={setInputValue}
                        />
                        <CommandList>
                            <CommandEmpty>
                                {loading ? (
                                    <div className="flex items-center justify-center p-6">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                ) : (
                                    "No categories found."
                                )}
                            </CommandEmpty>
                            <CommandGroup>
                                {categories.map((category, index) => (
                                    <CommandItem
                                        key={`category-${category.id}-${index}`}
                                        value={category.id}
                                        onSelect={() => handleSelect(category.id)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selected.includes(category.id)
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        {category.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}