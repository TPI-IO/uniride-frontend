import { Suspense } from "react"
import StatisticsView from "@/components/statistics/statistics-view"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function StatisticsPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <SidebarTrigger />
        <h1 className="text-2xl font-bold md:text-3xl">Mis Estadísticas</h1>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <StatisticsView />
      </Suspense>
    </div>
  )
}
