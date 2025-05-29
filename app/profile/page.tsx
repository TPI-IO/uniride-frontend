import { Suspense } from "react"
import UserProfile from "@/components/profile/user-profile"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <SidebarTrigger />
        <h1 className="text-2xl font-bold md:text-3xl">Mi Perfil</h1>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <UserProfile />
      </Suspense>
    </div>
  )
}
