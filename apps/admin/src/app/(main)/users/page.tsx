import { AdminUsersDataTable } from "./components/admin-users-data-table"
import { Suspense } from "react"

export default function AdminUsersPage() {
    return (
        <div className="container mx-auto py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Users</h1>
                    <p className="text-muted-foreground">
                        Manage your admin users here.
                    </p>
                </div>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
                <AdminUsersDataTable />
            </Suspense>
        </div>
    )
} 