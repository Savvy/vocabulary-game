"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface DashboardChartsProps {
    data: {
        wordsOverTime: Array<{
            date: string
            count: number
        }>
        categoryDistribution: Array<{
            category: string
            count: number
        }>
        languageUsage: Array<{
            pair: string
            count: number
        }>
    }
}

export function DashboardCharts({ data }: DashboardChartsProps) {
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Words Added Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer height={350}>
                        <LineChart data={data.wordsOverTime}>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="w-full grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Category Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer height={350}>
                            <BarChart data={data.categoryDistribution}>
                                <XAxis dataKey="category" />
                                <YAxis />
                                <Bar
                                    dataKey="count"
                                    fill="hsl(var(--primary))"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Language Pair Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer height={350}>
                            <BarChart data={data.languageUsage} layout="vertical">
                                <XAxis type="number" />
                                <YAxis dataKey="pair" type="category" width={100} />
                                <Bar
                                    dataKey="count"
                                    fill="hsl(var(--primary))"
                                    radius={[0, 4, 4, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </>
    )
} 