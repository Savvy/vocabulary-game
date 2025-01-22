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
import { cn } from "@/lib/utils"
import { Column } from "@tanstack/react-table"
import { Check, Filter } from "lucide-react"
import { useState, useMemo, useCallback } from "react"

interface ColumnFilterProps<TData> {
	column: Column<TData>
	title: string
	options: Array<{ label: string; value: string }>
}

export function ColumnFilter<TData>({
	column,
	title,
	options,
}: ColumnFilterProps<TData>) {
	const [open, setOpen] = useState(false)
	const facetedFilter = column.getFacetedUniqueValues()

	const filterValue = useMemo(() => {
		const value = column.getFilterValue()
		return Array.isArray(value) ? value : []
	}, [column])

	const handleSelect = useCallback(
		(value: string) => {
			const newValues = filterValue.includes(value)
				? filterValue.filter((v) => v !== value)
				: [...filterValue, value]

			column.setFilterValue(newValues.length ? newValues : undefined)
		},
		[column, filterValue]
	)

	const renderedOptions = useMemo(
		() => options.map((option) => {
			const isSelected = filterValue.includes(option.value)
			const count = facetedFilter?.get(option.value)

			return (
				<CommandItem
					key={option.value}
					onSelect={() => handleSelect(option.value)}
				>
					<div className="flex items-center gap-2 flex-1">
						<Check
							className={cn(
								"h-4 w-4",
								isSelected ? "opacity-100" : "opacity-0"
							)}
						/>
						<span>{option.label}</span>
					</div>
					{count && (
						<span className="ml-auto flex h-4 w-4 items-center justify-center text-xs">
							{count}
						</span>
					)}
				</CommandItem>
			)
		}),
		[options, filterValue, facetedFilter, handleSelect]
	)

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="-ml-3 h-8 data-[state=open]:bg-accent"
				>
					<Filter className="mr-2 h-4 w-4" />
					{title}
					{filterValue.length > 0 && (
						<div className="ml-2 rounded-sm bg-primary px-1 text-xs text-primary-foreground">
							{filterValue.length}
						</div>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0" align="start">
				<Command>
					<CommandInput placeholder={`Search ${title.toLowerCase()}...`} />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup heading={title}>
							{renderedOptions}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
