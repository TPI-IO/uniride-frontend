import { redirect } from "next/navigation"
import LoginForm from "@/components/login-form"

export default function Home() {
  // En una implementación real, verificaríamos si el usuario está autenticado
  // y redirigimos al dashboard si ya inició sesión
  const isAuthenticated = false

  if (isAuthenticated) {
    redirect("/dashboard")
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <LoginForm />
    </div>
  )
}
