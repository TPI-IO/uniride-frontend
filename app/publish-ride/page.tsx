import PublishRideForm from "@/components/rides/publish-ride-form"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function PublishRidePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <SidebarTrigger />
        <h1 className="text-2xl font-bold md:text-3xl">Publicar Viaje</h1>
      </div>
      <PublishRideForm />
    </div>
  )
}
