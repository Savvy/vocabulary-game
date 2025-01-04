import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardChartsSkeleton() {
    return (
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
    )
}