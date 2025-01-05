"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Word } from "@vocab/database"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { MoreVertical, Pencil, Trash, ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { WordImagePreview } from "./word-image-preview"

type WordWithRelations = Word & {
    category: { id: string; name: string; backgroundColor: string }
    sourceLanguage: { id: string; code: string }
    targetLanguage: { id: string; code: string }
}

interface CreateColumnsOptions {
    onDelete: (word: Word) => void
}

export function createColumns({ onDelete }: CreateColumnsOptions): ColumnDef<WordWithRelations>[] {
    return [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
            accessorKey: "word",
            header: ({ column }) => {
                const sorted = column.getIsSorted()
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(sorted === "asc")}
                        className="p-0 hover:bg-transparent"
                    >
                        Word
                        {sorted === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
                        {sorted === "desc" && <ArrowDown className="ml-2 h-4 w-4" />}
                        {!sorted && <ArrowUpDown className="ml-2 h-4 w-4" />}
                    </Button>
                )
            },
            cell: ({ row }) => <div>{row.getValue("word")}</div>,
            enableSorting: true,
        },
        {
            accessorKey: "translation",
            header: ({ column }) => {
                const sorted = column.getIsSorted()
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(sorted === "asc")}
                        className="p-0 hover:bg-transparent"
                    >
                        Translation
                        {sorted === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
                        {sorted === "desc" && <ArrowDown className="ml-2 h-4 w-4" />}
                        {!sorted && <ArrowUpDown className="ml-2 h-4 w-4" />}
                    </Button>
                )
            },
            cell: ({ row }) => <div>{row.getValue("translation")}</div>,
            enableSorting: true,
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div 
                        className="h-2 w-2 rounded-full" 
                        style={{ backgroundColor: row.original.category.backgroundColor }} 
                    />
                    {row.original.category.name}
                </div>
            ),
        },
        {
            accessorKey: "languagePair",
            header: "Language Pair",
            cell: ({ row }) => (
                <div>{row.original.sourceLanguage.code} → {row.original.targetLanguage.code}</div>
            ),
        },
        {
            accessorKey: "imageUrl",
            header: "Image",
            cell: ({ row }) => (
                <WordImagePreview 
                    src={row.getValue("imageUrl") || ""}
                    alt={row.getValue("word")}
                />
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const word = row.original

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
                )
            },
        },
    ]
} 