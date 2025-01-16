"use client"

import { useCallback, useMemo, useState, memo } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useDebounce } from "use-debounce"
import { useQueryState } from "nuqs"
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
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
import { ArrowUpDown } from "lucide-react"
import { format } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import { DataTableRowActions } from "./data-table-row-actions"
import { cn } from "@/lib/utils"

interface AdminUser {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

type setEditingUser = (user: AdminUser) => void
type setDeletingUser = (user: AdminUser) => void

const SortButton = memo(function SortButton({ 
  label, 
  sortKey, 
  currentSort,
  currentOrder,
  onSort 
}: { 
  label: string
  sortKey: string
  currentSort: string
  currentOrder: string
  onSort: (key: string, order: string) => void
}) {
  const isActive = currentSort === sortKey
  const nextOrder = isActive && currentOrder === "asc" ? "desc" : "asc"
  
  return (
    <Button
      variant="ghost"
      onClick={() => onSort(sortKey, nextOrder)}
      className="flex items-center"
    >
      {label}
      <ArrowUpDown 
        className={cn(
          "ml-2 h-4 w-4",
          isActive ? "opacity-100" : "opacity-50"
        )} 
      />
      {isActive && (
        <span className="sr-only">
          {currentOrder === "asc" ? "sorted ascending" : "sorted descending"}
        </span>
      )}
    </Button>
  )
})

export function AdminUsersDataTable() {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [page, setPage] = useQueryState("page", { defaultValue: "1" })
  const [perPage] = useQueryState("per_page", { defaultValue: "10" })
  const [searchQuery, setSearchQuery] = useQueryState("search", { defaultValue: "" })
  const [sort, setSort] = useQueryState("sort", { defaultValue: "createdAt" })
  const [order, setOrder] = useQueryState("order", { defaultValue: "desc" })
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null)
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500)

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-users", page, perPage, debouncedSearchQuery, sort, order],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page,
        perPage: perPage,
        ...(debouncedSearchQuery ? { search: debouncedSearchQuery } : {}),
        ...(sort ? { sort } : {}),
        ...(order ? { order } : {}),
      })
      const response = await fetch(`/api/admin-users?${searchParams.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch admin users")
      const data = await response.json();
      return data
    },
  })

  const users = useMemo(() => data?.data ?? [], [data])

  const handleDelete = useCallback(async (id: string) => {
    const response = await fetch(`/api/admin-users/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to delete admin user")
    }

    refetch()
    setDeletingUser(null)
  }, [refetch])

  const { mutate: editUser } = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; email: string } }) => {
      const response = await fetch(`/api/admin-users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update admin user")
      }

      return response.json()
    },
    onSuccess: () => {
      refetch()
      setEditingUser(null)
    },
  })

  const handleSort = useCallback(async (sortKey: string, nextOrder: string) => {
    try {
      await Promise.all([
        setSort(sortKey),
        setOrder(nextOrder)
      ])
    } catch (error) {
      console.error("Failed to update sort:", error)
    }
  }, [setSort, setOrder])

  const getColumns = useCallback((setEditingUser: setEditingUser, setDeletingUser: setDeletingUser): ColumnDef<AdminUser>[] => [
    {
      accessorKey: "name",
      header: () => (
        <SortButton
          label="Name"
          sortKey="name"
          currentSort={sort ?? ""}
          currentOrder={order ?? "desc"}
          onSort={handleSort}
        />
      ),
    },
    {
      accessorKey: "email",
      header: () => (
        <SortButton
          label="Email"
          sortKey="email"
          currentSort={sort ?? ""}
          currentOrder={order ?? "desc"}
          onSort={handleSort}
        />
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <SortButton
          label="Created At"
          sortKey="createdAt"
          currentSort={sort ?? ""}
          currentOrder={order ?? "desc"}
          onSort={handleSort}
        />
      ),
      cell: ({ row }) => format(new Date(row.getValue("createdAt")), "PPP"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row.original}
          onEdit={setEditingUser}
          onDelete={setDeletingUser}
        />
      ),
    },
  ], [sort, order, handleSort])

  const table = useReactTable({
    data: users,
    columns: getColumns(setEditingUser, setDeletingUser),
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  })

  return (
    <div className="space-y-4">
      <DataTableToolbar
        searchQuery={searchQuery ?? ""}
        onSearch={setSearchQuery}
        isLoading={isLoading}
      />
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
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  {isLoading ? "Loading..." : "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination
        page={page}
        pageCount={data?.meta?.pageCount ?? 0}
        total={data?.meta?.total ?? 0}
        onPageChange={setPage}
      />

      <AlertDialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Admin User</AlertDialogTitle>
            <AlertDialogDescription>
              Make changes to the admin user here. Click save when you&apos;re done.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name">Name</label>
                <Input
                  id="name"
                  defaultValue={editingUser.name}
                  onChange={(e) =>
                    setEditingUser((prev) =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  }
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="email">Email</label>
                <Input
                  id="email"
                  defaultValue={editingUser.email}
                  onChange={(e) =>
                    setEditingUser((prev) =>
                      prev ? { ...prev, email: e.target.value } : null
                    )
                  }
                />
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                editingUser &&
                editUser({
                  id: editingUser.id,
                  data: {
                    name: editingUser.name,
                    email: editingUser.email,
                  },
                })
              }
            >
              Save changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deletingUser}
        onOpenChange={() => setDeletingUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the admin
              user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletingUser && handleDelete(deletingUser.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 