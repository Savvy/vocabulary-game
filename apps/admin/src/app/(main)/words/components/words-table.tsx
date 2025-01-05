"use client"

import { useCallback, useState, useTransition, useMemo } from "react"
import { useQueryState } from "nuqs"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableViewOptions } from "./data-table-view-options"
import { Word } from "@vocab/database"
import { DeleteWordDialog } from "./delete-word-dialog"
import { useRouter } from "next/navigation"
import { BulkDeleteWordsDialog } from "./bulk-delete-words-dialog"
import { createColumns } from "./columns"
import { useDebouncedCallback } from 'use-debounce';
import { useQuery } from "@tanstack/react-query"
import { WordWithRelations } from "@/types/words"
import { WordsTableSkeleton } from "./skeleton/words-table-skeleton"

interface WordsResponse {
    words: Array<{
        id: string
        word: string
        translation: string
        imageUrl: string | null
        category: { id: string; name: string; backgroundColor: string }
        sourceLanguage: { id: string; code: string }
        targetLanguage: { id: string; code: string }
    }>
    pageCount: number
}

export function WordsTable() {
    const router = useRouter()
    const [, startTransition] = useTransition()

    const [page, setPage] = useQueryState('page', { defaultValue: '1' })
    const [pageSize, setPageSize] = useQueryState('size', { defaultValue: '10' })
    const [sortField, setSortField] = useQueryState('sortField')
    const [sortOrder, setSortOrder] = useQueryState('sortOrder')
    const [search, setSearch] = useQueryState('search', {
        defaultValue: '',
        shallow: false,
        clearOnDefault: true
    })

    const debouncedSetSearchQuery = useDebouncedCallback(setSearch, 300);

    const [category, setCategory] = useQueryState('category')
    const [source, setSource] = useQueryState('source')
    const [target, setTarget] = useQueryState('target')

    const sorting = useMemo<SortingState>(() => 
        sortField && sortOrder 
            ? [{ id: sortField, desc: sortOrder === 'desc' }]
            : []
    , [sortField, sortOrder])

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => {
        const filters: ColumnFiltersState = []
        if (search) filters.push({ id: 'word', value: search })
        if (category) filters.push({ id: 'category', value: category })
        if (source) filters.push({ id: 'sourceLanguage', value: source })
        if (target) filters.push({ id: 'targetLanguage', value: target })
        return filters
    })

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [wordToDelete, setWordToDelete] = useState<Word | null>(null)
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)

    const { data, isLoading } = useQuery<WordsResponse>({
        queryKey: ['words', {
            page,
            pageSize,
            sortField,
            sortOrder,
            search,
            category,
            source,
            target
        }],
        queryFn: async () => {
            const searchParams = new URLSearchParams({
                page: page,
                pageSize: pageSize,
                ...(sortField && { sortField }),
                ...(sortOrder && { sortOrder }),
                ...(search && { search }),
                ...(category && { category }),
                ...(source && { source }),
                ...(target && { target }),
            })

            const response = await fetch(`/api/words?${searchParams.toString()}`)
            if (!response.ok) throw new Error('Failed to fetch words')

            return response.json()
        }
    })

    const handleSortingChange = useCallback((updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
        const newSorting = typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue
        
        if (newSorting.length) {
            const [sort] = newSorting
            setSortField(sort.id)
            setSortOrder(sort.desc ? 'desc' : 'asc')
        } else {
            setSortField(null)
            setSortOrder(null)
        }
    }, [setSortField, setSortOrder, sorting])

    const handleFiltersChange = useCallback((updaterOrValue: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => {
        const newFilters = typeof updaterOrValue === 'function' ? updaterOrValue(columnFilters) : updaterOrValue
        startTransition(() => {
            setColumnFilters(newFilters)
            const categoryFilter = newFilters.find(f => f.id === 'category')?.value as string
            const sourceFilter = newFilters.find(f => f.id === 'sourceLanguage')?.value as string
            const targetFilter = newFilters.find(f => f.id === 'targetLanguage')?.value as string
            
            /* setSearch(searchFilter || null) */
            setCategory(categoryFilter || null)
            setSource(sourceFilter || null)
            setTarget(targetFilter || null)
        })
    }, [setCategory, setSource, setTarget, columnFilters])

    const handleDelete = useCallback(async (word: Word) => {
        const response = await fetch(`/api/words/${word.id}`, {
            method: "DELETE",
        })

        if (!response.ok) throw new Error("Failed to delete word")
        router.refresh()
    }, [router])

    const columns = createColumns({
        onDelete: setWordToDelete
    })

    const table = useReactTable({
        data: data?.words || [],
        columns: columns as ColumnDef<WordWithRelations>[],
        pageCount: data?.pageCount || 0,
        onSortingChange: handleSortingChange,
        onColumnFiltersChange: handleFiltersChange,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination: {
                pageIndex: Number(page) - 1,
                pageSize: Number(pageSize),
            },
        },
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
    })

    const handleBulkDelete = useCallback(async () => {
        const selectedRows = table.getSelectedRowModel().rows
        const wordIds = selectedRows.map(row => row.original.id)

        const response = await fetch("/api/words/bulk-delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ wordIds }),
        })

        if (!response.ok) throw new Error("Failed to delete words")

        table.resetRowSelection()
        router.refresh()
    }, [table, router])

    const handlePaginationChange = useCallback((updatedPage: number, updatedPageSize: number) => {
        startTransition(() => {
            setPage((updatedPage + 1).toString())
            setPageSize(updatedPageSize.toString())
        })
    }, [setPage, setPageSize])

    if (isLoading) {
        return (
            <WordsTableSkeleton />
        )
    }

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-1 items-center gap-4">
                        <Input
                            placeholder="Filter words..."
                            defaultValue={search}
                            onChange={(e) => debouncedSetSearchQuery(e.target.value)}
                            className="max-w-sm"
                        />
                        {table.getSelectedRowModel().rows.length > 0 && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setIsBulkDeleteOpen(true)}
                            >
                                Delete Selected ({table.getSelectedRowModel().rows.length})
                            </Button>
                        )}
                    </div>
                    <DataTableViewOptions table={table} />
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <DataTablePagination
                    table={table}
                    onPaginationChange={handlePaginationChange}
                />
            </div>
            <DeleteWordDialog
                isOpen={!!wordToDelete}
                onClose={() => setWordToDelete(null)}
                onConfirm={async () => {
                    if (wordToDelete) await handleDelete(wordToDelete)
                }}
                wordText={wordToDelete?.word || ""}
            />
            <BulkDeleteWordsDialog
                isOpen={isBulkDeleteOpen}
                onClose={() => setIsBulkDeleteOpen(false)}
                onConfirm={handleBulkDelete}
                count={table.getSelectedRowModel().rows.length}
            />
        </>
    )
} 