'use client'

import { AlertCircle } from "lucide-react"
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { code?: string }
    reset: () => void
}) {
    return (
        <div className="p-4">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Dashboard</AlertTitle>
                <AlertDescription className="mt-2 flex flex-col gap-2">
                    <p>
                        {error.code === 'STATS_ERROR'
                            ? 'Failed to load dashboard statistics.'
                            : error.code === 'CHART_ERROR'
                                ? 'Failed to load dashboard charts.'
                                : 'An unexpected error occurred.'}
                    </p>
                    <Button
                        variant="outline"
                        onClick={reset}
                        className="w-fit"
                    >
                        Try again
                    </Button>
                </AlertDescription>
            </Alert>
        </div>
    )
}