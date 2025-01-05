import { Suspense } from "react"
import { CategoriesHeader } from "./components/categories-header"
import { CategoriesGrid } from "./components/categories-grid"
import { CategoriesGridSkeleton } from "./components/skeleton/categories-grid-skeleton"

export default function CategoriesPage() {
    return (
        <>
            <CategoriesHeader />
            <div className="flex-1 flex flex-col gap-4 p-4">
                <Suspense fallback={<CategoriesGridSkeleton />}>
                    <CategoriesGrid />
                </Suspense>
            </div>
        </>
    )
}
