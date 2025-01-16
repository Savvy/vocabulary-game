"use client"

import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

interface DataTableToolbarProps {
  searchQuery: string
  onSearch: (value: string) => void
  isLoading: boolean
}

export function DataTableToolbar({ searchQuery, onSearch, isLoading }: DataTableToolbarProps) {
  return (
    <div className="flex items-center gap-4">
      <Input
        placeholder="Search admin users..."
        value={searchQuery ?? ""}
        onChange={(event) => onSearch(event.target.value)}
        className="max-w-sm"
      />
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
    </div>
  )
} 