import { Suspense } from "react"
import MyRidesList from "@/components/rides/my-rides-list"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function MyRidesPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <SidebarTrigger />
        <h1 className="text-2xl font-bold md:text-3xl">Mis Viajes</h1>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <MyRidesList />
      </Suspense>
    </div>
  )
}
