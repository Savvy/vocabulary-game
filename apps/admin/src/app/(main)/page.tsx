import { DashboardMetrics } from "./components/dashboard-metrics"
import { DashboardCharts } from "./components/dashboard-charts"
import { DashboardActions } from "./components/dashboard-actions"
import { getDashboardChartData, getDashboardStats } from "@vocab/database"
import { Suspense } from "react"
import { DashboardMetricsSkeleton } from "./components/skeleton/dashboard-metrics-skeleton"
import { DashboardChartsSkeleton } from "./components/skeleton/dashboard-charts-skeleton"
import { DashboardHeader } from "./components/dashboard-header"

export default async function DashboardPage() {
  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Suspense fallback={<DashboardMetricsSkeleton />}>
          <DashboardMetricsWrapper />
        </Suspense>
        <div className="grid gap-4 lg:grid-cols-8">
          <div className="lg:col-span-6 space-y-4">
            <Suspense fallback={<DashboardChartsSkeleton />}>
              <DashboardChartsWrapper />
            </Suspense>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <DashboardActions />
          </div>
        </div>
      </div>
    </>
  )
}

async function DashboardMetricsWrapper() {
  const metrics = await getDashboardStats()
  return <DashboardMetrics metrics={metrics} />
}

async function DashboardChartsWrapper() {
  const chartData = await getDashboardChartData()
  return <DashboardCharts data={chartData} />
}