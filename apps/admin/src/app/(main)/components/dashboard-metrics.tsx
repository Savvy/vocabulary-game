"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Book, Globe2, FolderTree, Clock, Gamepad2 } from "lucide-react"

interface DashboardMetricsProps {
    metrics: {
        totalWords: number
        languagePairs: number
        categories: number
        recentAdditions: number
    }
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
    const cards = [
        {
            title: "Active Games",
            value: 0,
            icon: Gamepad2,
            description: "Games in progress"
        },
        {
            title: "Total Words",
            value: metrics.totalWords,
            icon: Book,
            description: "Words in the database"
        },
        {
            title: "Language Pairs",
            value: metrics.languagePairs,
            icon: Globe2,
            description: "Active language pairs"
        },
        {
            title: "Categories",
            value: metrics.categories,
            icon: FolderTree,
            description: "Word categories"
        },
        {
            title: "Recent Additions",
            value: metrics.recentAdditions,
            icon: Clock,
            description: "Added in last 7 days"
        }
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {cards.map((card) => (
                <Card key={card.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {card.title}
                        </CardTitle>
                        <card.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <p className="text-xs text-muted-foreground">
                            {card.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
} 