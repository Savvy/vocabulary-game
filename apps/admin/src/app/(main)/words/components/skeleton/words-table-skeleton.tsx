import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export function WordsTableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40px]">
                                <Skeleton className="h-4 w-4" />
                            </TableHead>
                            <TableHead>
                                <Skeleton className="h-4 w-[100px]" />
                            </TableHead>
                            <TableHead>
                                <Skeleton className="h-4 w-[100px]" />
                            </TableHead>
                            <TableHead>
                                <Skeleton className="h-4 w-[100px]" />
                            </TableHead>
                            <TableHead>
                                <Skeleton className="h-4 w-[100px]" />
                            </TableHead>
                            <TableHead className="w-[100px]">
                                <Skeleton className="h-4 w-[60px]" />
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <Skeleton className="h-4 w-4" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-[150px]" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-[150px]" />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-2 w-2 rounded-full" />
                                        <Skeleton className="h-4 w-[100px]" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-[80px]" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-8 w-8" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between px-2">
                <Skeleton className="h-8 w-[200px]" />
                <div className="flex items-center space-x-6 lg:space-x-8">
                    <Skeleton className="h-8 w-[70px]" />
                    <Skeleton className="h-8 w-[100px]" />
                    <div className="flex items-center space-x-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                    </div>
                </div>
            </div>
        </div>
    )
} 