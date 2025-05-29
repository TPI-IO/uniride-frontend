"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Users, Calendar, Clock } from "lucide-react"
import { apiService } from "@/services"

interface StatsData {
  totalRidesAsDriver: number
  totalRidesAsPassenger: number
  totalSavedCO2: number
  totalDistance: number
}

export default function DashboardStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiService.getUserStats()
        setStats(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium h-4 bg-gray-200 rounded"></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return <div className="text-center py-4">No se pudieron cargar las estadísticas. Intente nuevamente más tarde.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Viajes como Conductor"
        value={stats.totalRidesAsDriver}
        icon={<Car className="h-5 w-5 text-amber-500" />}
      />
      <StatCard
        title="Viajes como Pasajero"
        value={stats.totalRidesAsPassenger}
        icon={<Users className="h-5 w-5 text-blue-600" />}
      />
      <StatCard
        title="CO₂ Ahorrado (kg)"
        value={stats.totalSavedCO2.toFixed(1)}
        icon={<Calendar className="h-5 w-5 text-yellow-600" />}
      />
      <StatCard
        title="Distancia Total (km)"
        value={stats.totalDistance.toFixed(1)}
        icon={<Clock className="h-5 w-5 text-purple-600" />}
      />
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
