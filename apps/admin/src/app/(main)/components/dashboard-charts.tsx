"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartConfig
} from "@/components/ui/chart"
import { useMemo } from "react"

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

const chartConfig: ChartConfig = {
    words: {
        label: "Words",
        color: "hsl(var(--primary))"
    }
}

export function DashboardCharts({ data }: DashboardChartsProps) {
    const chartData = useMemo(() => {
        return {
            ...data,
            categoryDistribution: data.categoryDistribution.map((item) => ({
                ...item,
                category: item.category.charAt(0).toUpperCase() + item.category.slice(1)
            })),
            languageUsage: data.languageUsage.map((item) => ({
                ...item,
                pair: item.pair.toUpperCase()
            }))
        }
    }, [data])
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Words Added Over Time</CardTitle>
                    <CardDescription>Showing word count growth over time</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[350px] h-[350px] w-full">
                        <AreaChart
                            data={chartData.wordsOverTime}
                            margin={{
                                left: 12,
                                right: 12,
                            }}
                        >
                            <defs>
                                <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis 
                                dataKey="date" 
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <YAxis 
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <ChartTooltip
                                content={<ChartTooltipContent />}
                            />
                            <Area
                                name="Words"
                                type="natural"
                                dataKey="count"
                                fill="url(#colorWords)"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <div className="w-full grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Category Distribution</CardTitle>
                        <CardDescription>Distribution of words across categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig}>
                            <BarChart 
                                data={chartData.categoryDistribution}
                                height={350}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis 
                                    dataKey="category" 
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <YAxis 
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <ChartTooltip
                                    content={<ChartTooltipContent />}
                                    labelClassName="capitalize"
                                />
                                <Bar
                                    name="Words"
                                    dataKey="count"
                                    fill="hsl(var(--primary))"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Language Pair Usage</CardTitle>
                        <CardDescription>Word count by language pair</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig}>
                            <BarChart 
                                data={chartData.languageUsage} 
                                layout="vertical"
                                height={350}
                            >
                                <CartesianGrid horizontal={false} />
                                <XAxis 
                                    type="number"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <YAxis 
                                    dataKey="pair" 
                                    type="category" 
                                    width={100}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <ChartTooltip
                                    content={<ChartTooltipContent />}
                                />
                                <Bar
                                    name="Words"
                                    dataKey="count"
                                    fill="hsl(var(--primary))"
                                    radius={[0, 4, 4, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </>
    )
} 