import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardLoading() {
    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-4 w-[100px]" />
                </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4">
                {/* Metrics Loading */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    <Skeleton className="h-4 w-[100px]" />
                                </CardTitle>
                                <Skeleton className="h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-7 w-[60px]" />
                                <Skeleton className="mt-1 h-3 w-[140px]" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Charts Loading */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <Skeleton className="h-5 w-[200px]" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-[350px] w-full" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions Loading */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <Skeleton className="h-5 w-[120px]" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full" />
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}