"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiService } from "@/services"
import type { Statistics } from "@/lib/types"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts"
import { Car, DollarSign, Leaf, MapPin, Calendar, Star, TrendingUp } from "lucide-react"
import LoadingSpinner from "@/components/ui/loading-spinner"

export default function StatisticsView() {
  const [stats, setStats] = useState<Statistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiService.getUserDetailedStats()
        setStats(data)
      } catch (error) {
        console.error("Error fetching statistics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No se pudieron cargar las estadísticas. Intente nuevamente más tarde.</p>
      </div>
    )
  }

  // Colores para los gráficos
  const COLORS = ["#F5A800", "#4BC0C0", "#FF8042", "#8884D8", "#82CA9D", "#FFBB28"]

  // Datos para el gráfico de pastel de viajes como conductor vs pasajero
  const driverVsPassengerData = [
    { name: "Como Conductor", value: stats.driverCount },
    { name: "Como Pasajero", value: stats.passengerCount },
  ]

  // Datos para el gráfico de barras de viajes por día de la semana
  const weekdayData = stats.ridesPerWeekday.filter((item) => item.count > 0)

  // Datos para el gráfico de línea de viajes por mes
  const monthlyData = stats.ridesPerMonth.filter((item) => item.count > 0)

  return (
    <div className="space-y-6">
      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Viajes Completados"
          value={stats.totalRidesCompleted}
          icon={<Car className="h-5 w-5 text-amber-500" />}
        />
        <StatCard
          title="Distancia Total (km)"
          value={stats.totalDistanceTraveled.toFixed(1)}
          icon={<MapPin className="h-5 w-5 text-blue-600" />}
        />
        <StatCard
          title="CO₂ Ahorrado (kg)"
          value={stats.totalCO2Saved.toFixed(1)}
          icon={<Leaf className="h-5 w-5 text-green-600" />}
        />
        <StatCard
          title="Calificación Promedio"
          value={stats.averageRating.toFixed(1)}
          icon={<Star className="h-5 w-5 text-yellow-600" />}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de pastel: Conductor vs Pasajero */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Viajes como Conductor vs Pasajero</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={driverVsPassengerData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {driverVsPassengerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} viajes`, ""]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de barras: Viajes por día de la semana */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Viajes por Día de la Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(value) => [`${value} viajes`, "Cantidad"]} />
                  <Bar dataKey="count" name="Viajes" fill="#F5A800" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de línea: Viajes por mes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Viajes por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(value) => [`${value} viajes`, "Cantidad"]} />
                  <Line type="monotone" dataKey="count" name="Viajes" stroke="#F5A800" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tarjetas de estadísticas adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Destino más frecuente</CardTitle>
              <MapPin className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.mostFrequentDestination}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Origen más frecuente</CardTitle>
              <MapPin className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.mostFrequentOrigin}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Día más activo</CardTitle>
              <Calendar className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.mostActiveDay}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tasa de finalización</CardTitle>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Estadísticas financieras */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dinero Ganado</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalMoneyEarned.toFixed(2)}</div>
            <p className="text-sm text-gray-500">Como conductor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dinero Gastado</CardTitle>
            <DollarSign className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalMoneySpent.toFixed(2)}</div>
            <p className="text-sm text-gray-500">Como pasajero</p>
          </CardContent>
        </Card>
      </div>
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
