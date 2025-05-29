import { Suspense } from "react"
import PaymentMethodsList from "@/components/payment/payment-methods-list"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function PaymentMethodsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <SidebarTrigger />
        <h1 className="text-2xl font-bold md:text-3xl">Mis Métodos de Pago</h1>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <PaymentMethodsList />
      </Suspense>
    </div>
  )
}
