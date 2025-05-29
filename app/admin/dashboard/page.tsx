import { Suspense } from "react"
import AdminDashboard from "@/components/admin/admin-dashboard"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <SidebarTrigger />
        <h1 className="text-2xl font-bold md:text-3xl">Panel de Administración</h1>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <AdminDashboard />
      </Suspense>
    </div>
  )
}
