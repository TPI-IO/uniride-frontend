"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Calendar, Clock, User } from "lucide-react"
import { apiService } from "@/services"
import type { Ride } from "@/lib/types"

export default function RecentRides() {
  const [recentRides, setRecentRides] = useState<Ride[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecentRides = async () => {
      try {
        const data = await apiService.getRecentRides()
        setRecentRides(data)
      } catch (error) {
        console.error("Error fetching recent rides:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentRides()
  }, [])

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="h-6 bg-gray-200 rounded w-1/2"></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded mb-2"></div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (recentRides.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Viajes Recientes</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No has realizado ningún viaje recientemente.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Viajes Recientes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentRides.map((ride) => (
          <div key={ride.id} className="border rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">
                  {ride.origin} → {ride.destination}
                </span>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  ride.isDriver ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                }`}
              >
                {ride.isDriver ? "Conductor" : "Pasajero"}
              </span>
            </div>

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(ride.date).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {ride.departureTime}
              </div>
              <div className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                {ride.isDriver ? `${ride.passengers.length} pasajeros` : ride.driverName}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
