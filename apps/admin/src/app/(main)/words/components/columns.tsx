"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
	MoreVertical,
	Pencil,
	Trash,
	ArrowUpDown,
	ArrowDown,
	ArrowUp,
} from "lucide-react";
import Link from "next/link";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WordImagePreview } from "./word-image-preview";
import { ColumnFilter } from "./column-filters";
import { WordWithRelations } from "@/types/words";

interface CreateColumnsOptions {
	onDelete: (word: WordWithRelations) => void;
	categories: Array<{
		id: string;
		translations: Array<{
			id: string;
			translation: string;
			languageId: string;
		}>;
	}>;
}

export function createColumns({
	categories,
	onDelete,
}: CreateColumnsOptions): ColumnDef<WordWithRelations>[] {
	return [
		{
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
					}
					onCheckedChange={(value) =>
						table.toggleAllPageRowsSelected(!!value)
					}
					aria-label="Select all"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
				/>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "translations",
			header: ({ column }) => {
				const sorted = column.getIsSorted();
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(sorted === "asc")}
						className="p-0 hover:bg-transparent"
					>
						Translations
						{sorted === "asc" && (
							<ArrowUp className="ml-2 h-4 w-4" />
						)}
						{sorted === "desc" && (
							<ArrowDown className="ml-2 h-4 w-4" />
						)}
						{!sorted && <ArrowUpDown className="ml-2 h-4 w-4" />}
					</Button>
				);
			},
			cell: ({ row }) => (
				<div className="space-y-1">
					{row.original.translations.length > 0 ? `${row.original.translations.length} translations` : 'Untranslated'}
				</div>
			),
			enableSorting: true,
		},
		{
			accessorKey: "category",
			header: ({ column }) => (
				<ColumnFilter
					column={column}
					title="Category"
					options={categories.map((category) => ({
						label: category.translations[0]?.translation || 'Untranslated',
						value: category.id,
					}))}
				/>
			),
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					{row.original.category.translations[0]?.translation || 'Untranslated'}
				</div>
			),
			filterFn: (row, id, value: string[]) => {
				return value.includes(row.original.categoryId);
			},
		},
		{
			accessorKey: "imageUrl",
			header: "Image",
			cell: ({ row }) => (
				<WordImagePreview
					src={row.original.imageUrl}
					alt={row.original.translations[0]?.translation || 'Word image'}
				/>
			),
		},
		{
			id: "actions",
			cell: ({ row }) => {
				const word = row.original;

				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuItem asChild>
								<Link href={`/words/${word.id}/edit`}>
									<Pencil className="mr-2 h-4 w-4" />
									Edit
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="text-destructive"
								onClick={() => onDelete(word)}
							>
								<Trash className="mr-2 h-4 w-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];
}
