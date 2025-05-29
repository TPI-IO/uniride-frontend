"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, List, Users, BarChart2, CreditCard, Plus, MapPin } from "lucide-react"

export default function QuickActions() {
  const actions = [
    {
      title: "Publicar Viaje",
      description: "Ofrece un viaje a otros usuarios",
      icon: <Plus className="h-6 w-6" />,
      href: "/publish-ride",
      color: "bg-amber-500 hover:bg-amber-600",
    },
    {
      title: "Buscar Viajes",
      description: "Encuentra viajes disponibles",
      icon: <Search className="h-6 w-6" />,
      href: "/available-rides",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Mis Viajes",
      description: "Ver todos tus viajes",
      icon: <List className="h-6 w-6" />,
      href: "/my-rides",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Conductores",
      description: "Ver perfiles de conductores",
      icon: <Users className="h-6 w-6" />,
      href: "/drivers",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Estadísticas",
      description: "Ver tus estadísticas detalladas",
      icon: <BarChart2 className="h-6 w-6" />,
      href: "/statistics",
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      title: "Métodos de Pago",
      description: "Gestionar tarjetas y pagos",
      icon: <CreditCard className="h-6 w-6" />,
      href: "/payment-methods",
      color: "bg-pink-500 hover:bg-pink-600",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-amber-500" />
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Button
                variant="outline"
                className={`h-auto p-4 flex flex-col items-center gap-3 w-full text-white border-0 ${action.color} transition-all duration-200 hover:scale-105`}
              >
                {action.icon}
                <div className="text-center">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs opacity-90 mt-1">{action.description}</div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
