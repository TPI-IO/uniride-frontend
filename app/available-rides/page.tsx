import { Suspense } from "react"
import AvailableRidesList from "@/components/rides/available-rides-list"
import RideFilters from "@/components/rides/ride-filters"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function AvailableRidesPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <SidebarTrigger />
        <h1 className="text-2xl font-bold md:text-3xl">Viajes Disponibles</h1>
      </div>

      <RideFilters />

      <Suspense fallback={<LoadingSpinner />}>
        <AvailableRidesList />
      </Suspense>
    </div>
  )
}
