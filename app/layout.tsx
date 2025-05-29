import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthProvider } from "@/context/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "UniRide - Viajes Compartidos",
  description: "Plataforma de viajes compartidos para la comunidad universitaria",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 overflow-auto">
              <div className="container mx-auto px-4 py-6">{children}</div>
              <footer className="bg-gray-100 py-4 text-center text-sm text-gray-600 mt-8">
                © {new Date().getFullYear()} UniRide - Todos los derechos reservados
              </footer>
            </main>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
