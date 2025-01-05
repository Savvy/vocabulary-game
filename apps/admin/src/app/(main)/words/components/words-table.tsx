"use client"

import { useCallback, useState, useTransition, useMemo } from "react"
import { useQueryState } from "nuqs"
import type { ColumnFiltersState, SortingState, VisibilityState } from "@tanstack/react-table"
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useDebouncedCallback } from 'use-debounce'
import { useQuery } from "@tanstack/react-query"
import { WordWithRelations } from "@/types/words"

import { DataTablePagination } from "./data-table-pagination"
import { DataTableViewOptions } from "./data-table-view-options"
import { DeleteWordDialog } from "./delete-word-dialog"
import { BulkDeleteWordsDialog } from "./bulk-delete-words-dialog"
import { WordsTableSkeleton } from "./skeleton/words-table-skeleton"
import { createColumns } from "./columns"
import { Skeleton } from "@/components/ui/skeleton"
import { createQueryParams } from "@/lib/utils"
import { Category } from "@vocab/database"

interface WordsTableState {
    columnVisibility: VisibilityState
    rowSelection: Record<string, boolean>
    wordToDelete: WordWithRelations | null
    isBulkDeleteOpen: boolean
}

const initialState: WordsTableState = {
    columnVisibility: {},
    rowSelection: {},
    wordToDelete: null,
    isBulkDeleteOpen: false
}

export function WordsTable({ categories }: { categories: Category[] }) {
    const router = useRouter()
    const [, startTransition] = useTransition()
    const [state, setState] = useState<WordsTableState>(initialState)

    // URL Query Parameters
    const [page, setPage] = useQueryState('page', { defaultValue: '1' })
    const [pageSize, setPageSize] = useQueryState('size', { defaultValue: '10' })
    const [sortField, setSortField] = useQueryState('sortField')
    const [sortOrder, setSortOrder] = useQueryState('sortOrder')
    const [search, setSearch] = useQueryState('search', {
        defaultValue: '',
        shallow: false,
        clearOnDefault: true
    })
    const [category, setCategory] = useQueryState('category')
    const [source, setSource] = useQueryState('source')
    const [target, setTarget] = useQueryState('target')

    // Debounced search
    const debouncedSetSearchQuery = useDebouncedCallback(setSearch, 300)

    // Memoized sorting state
    const sorting = useMemo<SortingState>(() =>
        sortField && sortOrder
            ? [{ id: sortField, desc: sortOrder === 'desc' }]
            : []
        , [sortField, sortOrder])

    // Memoized column filters
    const columnFilters = useMemo<ColumnFiltersState>(() => {
        const filters: ColumnFiltersState = []
        if (search) filters.push({ id: 'word', value: search })
        if (category) filters.push({ id: 'category', value: category })
        if (source) filters.push({ id: 'sourceLanguage', value: source })
        if (target) filters.push({ id: 'targetLanguage', value: target })
        return filters
    }, [search, category, source, target])

    // Data fetching
    const { data, isLoading } = useQuery({
        queryKey: ['words', { page, pageSize, sortField, sortOrder, search, category, source, target }],
        queryFn: async () => {
            const params = createQueryParams({
                page,
                pageSize,
                sortField,
                sortOrder,
                search,
                category,
                source,
                target
            })

            const response = await fetch(`/api/words?${params}`)
            if (!response.ok) throw new Error('Failed to fetch words')
            return response.json()
        }
    })

    // Table handlers
    const handleSortingChange = useCallback((newSorting: SortingState) => {
        if (newSorting.length) {
            const [sort] = newSorting
            startTransition(() => {
                setSortField(sort.id)
                setSortOrder(sort.desc ? 'desc' : 'asc')
            })
        } else {
            startTransition(() => {
                setSortField(null)
                setSortOrder(null)
            })
        }
    }, [setSortField, setSortOrder])

    const handleFiltersChange = useCallback((filters: ColumnFiltersState) => {
        startTransition(() => {
            const categoryFilter = filters.find(f => f.id === 'category')?.value as string
            const sourceFilter = filters.find(f => f.id === 'sourceLanguage')?.value as string
            const targetFilter = filters.find(f => f.id === 'targetLanguage')?.value as string

            setCategory(categoryFilter || null)
            setSource(sourceFilter || null)
            setTarget(targetFilter || null)
        })
    }, [setCategory, setSource, setTarget])

    const handlePaginationChange = useCallback((updatedPage: number, updatedPageSize: number) => {
        startTransition(() => {
            setPage((updatedPage + 1).toString())
            setPageSize(updatedPageSize.toString())
        })
    }, [setPage, setPageSize])

    // Table configuration
    const columns = useMemo(() => createColumns({
        onDelete: (word: WordWithRelations) => setState(prev => ({ ...prev, wordToDelete: word })),
        categories: categories.map((category) => ({
            id: category.id,
            name: category.name,
            backgroundColor: category.backgroundColor,
        }))
    }), [categories])

    const table = useReactTable({
        data: data?.words || [],
        columns,
        pageCount: data?.pageCount || 0,
        state: {
            sorting,
            columnFilters,
            columnVisibility: state.columnVisibility,
            rowSelection: state.rowSelection,
            pagination: {
                pageIndex: Number(page) - 1,
                pageSize: Number(pageSize),
            },
        },
        onSortingChange: (updaterOrValue) => {
            const newSorting = typeof updaterOrValue === 'function'
                ? updaterOrValue(table.getState().sorting)
                : updaterOrValue
            handleSortingChange(newSorting)
        },
        onColumnFiltersChange: (updaterOrValue) => {
            const filters = typeof updaterOrValue === 'function'
                ? updaterOrValue(table.getState().columnFilters)
                : updaterOrValue
            handleFiltersChange(filters)
        },
        onColumnVisibilityChange: (updaterOrValue) => {
            const visibility = typeof updaterOrValue === 'function'
                ? updaterOrValue(state.columnVisibility)
                : updaterOrValue
            setState(prev => ({ ...prev, columnVisibility: visibility }))
        },
        onRowSelectionChange: (updaterOrValue) => {
            const selection = typeof updaterOrValue === 'function'
                ? updaterOrValue(table.getState().rowSelection)
                : updaterOrValue
            setState(prev => ({ ...prev, rowSelection: selection }))
        },
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        enableColumnFilters: true,
    })

    return (
        <div className="space-y-4">
            {/* Table controls */}
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
                            onClick={() => setState(prev => ({ ...prev, isBulkDeleteOpen: true }))}
                        >
                            Delete Selected ({table.getSelectedRowModel().rows.length})
                        </Button>
                    )}
                </div>
                {isLoading ? (
                    <Skeleton className="h-10 w-[100px]" />
                ) : <DataTableViewOptions table={table} />}
            </div>
            {isLoading ? <WordsTableSkeleton /> : (
                <>
                    {/* Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder ? null :
                                                    flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
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

                    {/* Dialogs */}
                    <DeleteWordDialog
                        isOpen={!!state.wordToDelete}
                        onClose={() => setState(prev => ({ ...prev, wordToDelete: null }))}
                        onConfirm={async () => {
                            if (!state.wordToDelete) return
                            await fetch(`/api/words/${state.wordToDelete.id}`, { method: "DELETE" })
                            setState(prev => ({ ...prev, wordToDelete: null }))
                            router.refresh()
                        }}
                        wordText={state.wordToDelete?.word || ""}
                    />

                    <BulkDeleteWordsDialog
                        isOpen={state.isBulkDeleteOpen}
                        onClose={() => setState(prev => ({ ...prev, isBulkDeleteOpen: false }))}
                        onConfirm={async () => {
                            const selectedRows = table.getSelectedRowModel().rows
                            const wordIds = selectedRows.map(row => row.original.id)
                            await fetch("/api/words/bulk-delete", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ wordIds }),
                            })
                            table.resetRowSelection()
                            router.refresh()
                        }}
                        count={table.getSelectedRowModel().rows.length}
                    />
                </>
            )}
        </div>
    )
} 