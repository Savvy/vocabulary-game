import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function CategoriesGridSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-[200px]" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-8 w-8" />
                        </div>
                        <Skeleton className="h-4 w-full mt-2" />
                    </Card>
                ))}
            </div>
        </div>
    )
} 