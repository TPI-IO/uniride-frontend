import { Suspense } from "react"
import DriverProfile from "@/components/drivers/driver-profile"
import LoadingSpinner from "@/components/ui/loading-spinner"

export default function DriverProfilePage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-4xl mx-auto">
      <Suspense fallback={<LoadingSpinner />}>
        <DriverProfile driverId={params.id} />
      </Suspense>
    </div>
  )
}
