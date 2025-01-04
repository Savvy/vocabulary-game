import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardMetrics } from "./components/dashboard-metrics"
import { DashboardCharts } from "./components/dashboard-charts"
import { DashboardActions } from "./components/dashboard-actions"
import { getDashboardChartData, getDashboardStats } from "@vocab/database"
import { Suspense } from "react"
import { DashboardMetricsSkeleton } from "./components/skeleton/dashboard-metrics-skeleton"
import { DashboardChartsSkeleton } from "./components/skeleton/dashboard-charts-skeleton"

export default async function DashboardPage() {

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
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