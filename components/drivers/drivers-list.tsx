"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Star, Phone, Mail } from "lucide-react"
import { apiService } from "@/services"
import type { User as UserType } from "@/lib/types"
import Link from "next/link"

export default function DriversList() {
  const [drivers, setDrivers] = useState<UserType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const data = await apiService.getDrivers()
        setDrivers(data)
      } catch (error) {
        console.error("Error fetching drivers:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDrivers()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-t"></div>
            <CardContent className="space-y-4 pt-6">
              <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </CardContent>
            <CardFooter className="h-10 bg-gray-200 rounded-b m-4"></CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (drivers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No hay conductores disponibles en este momento.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {drivers.map((driver) => (
        <Card key={driver.id} className="overflow-hidden">
          <div className="bg-amber-50 p-6 flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <User className="h-10 w-10 text-amber-600" />
            </div>
            <h3 className="font-medium text-lg text-center">
              {driver.firstName} {driver.lastName}
            </h3>
            <p className="text-sm text-gray-500 capitalize">{driver.role}</p>

            <div className="flex items-center mt-2">
              {driver.rating && (
                <>
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span className="ml-1 text-sm font-medium">{driver.rating.toFixed(1)}</span>
                </>
              )}
            </div>
          </div>

          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{driver.phone}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{driver.email}</span>
            </div>

            {driver.reviews && (
              <p className="text-sm text-gray-500">
                {driver.reviews.length} {driver.reviews.length === 1 ? "opinión" : "opiniones"}
              </p>
            )}
          </CardContent>

          <CardFooter className="bg-gray-50">
            <Link href={`/drivers/${driver.id}`} className="w-full">
              <Button className="w-full bg-amber-500 hover:bg-amber-600">Ver Perfil</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
