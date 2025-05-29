import { Suspense } from "react"
import AdminLogin from "@/components/admin/admin-login"
import LoadingSpinner from "@/components/ui/loading-spinner"

export default function AdminPage() {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Suspense fallback={<LoadingSpinner />}>
        <AdminLogin />
      </Suspense>
    </div>
  )
}
