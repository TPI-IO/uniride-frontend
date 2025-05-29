import { Suspense } from "react"
import DriversList from "@/components/drivers/drivers-list"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function DriversPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <SidebarTrigger />
        <h1 className="text-2xl font-bold md:text-3xl">Conductores</h1>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <DriversList />
      </Suspense>
    </div>
  )
}
