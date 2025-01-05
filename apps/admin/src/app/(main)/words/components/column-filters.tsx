import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuCheckboxItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Column } from "@tanstack/react-table";
import { useMemo } from "react";

interface ColumnFilterProps<TData> {
	column: Column<TData>;
	title: string;
	options: Array<{ label: string; value: string }>;
}

export function ColumnFilter<TData>({
	column,
	title,
	options,
}: ColumnFilterProps<TData>) {
	const facetedFilter = column.getFacetedUniqueValues();
	const selectedValues = useMemo(() => {
		const values = column.getFilterValue()
		if (!values) {
			return new Set()
		}
		return new Set(values instanceof Array ? values : (values as string).split(','))
	}, [column.getFilterValue()])

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="-ml-3 h-8 data-[state=open]:bg-accent"
				>
					<Filter className="mr-2 h-4 w-4" />
					{title}
					{selectedValues?.size > 0 && (
						<div className="ml-2 rounded-sm bg-primary px-1 text-xs text-primary-foreground">
							{selectedValues.size}
						</div>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-[200px]">
				{options.map((option) => (
					<DropdownMenuCheckboxItem
						key={option.value}
						checked={selectedValues?.has(option.value)}
						onCheckedChange={(checked) => {
							if (checked) {
								selectedValues.add(option.value);
							} else {
								selectedValues.delete(option.value);
							}
							const filterValues = Array.from(selectedValues);
							column.setFilterValue(
								filterValues.length ? filterValues : undefined
							);
						}}
					>
						{option.label}
						{facetedFilter?.get(option.value) && (
							<span className="ml-auto flex h-4 w-4 items-center justify-center text-xs">
								{facetedFilter.get(option.value)}
							</span>
						)}
					</DropdownMenuCheckboxItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
