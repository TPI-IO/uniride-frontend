"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, User, Calendar } from "lucide-react"
import { apiService } from "@/services"
import type { Ride } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function CurrentRide() {
  const [currentRide, setCurrentRide] = useState<Ride | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    const fetchCurrentRide = async () => {
      try {
        const data = await apiService.getCurrentRide()
        setCurrentRide(data)
      } catch (error) {
        console.error("Error fetching current ride:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrentRide()
  }, [])

  const handleCancelRide = async () => {
    if (!currentRide) return

    setIsCancelling(true)
    try {
      await apiService.cancelRide(currentRide.id)
      setIsDialogOpen(false)
      // Recargar la página para reflejar los cambios
      window.location.reload()
    } catch (error) {
      console.error("Error cancelling ride:", error)
    } finally {
      setIsCancelling(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="h-6 bg-gray-200 rounded w-1/2"></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!currentRide) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Viaje Actual</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No tienes ningún viaje programado actualmente.</p>
          <Button
            className="mt-4 bg-amber-500 hover:bg-amber-600"
            onClick={() => (window.location.href = "/available-rides")}
          >
            Buscar Viajes
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Viaje Actual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-2">
            <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium">Fecha</p>
              <p className="text-sm text-gray-500">{new Date(currentRide.date).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium">Hora de Salida</p>
              <p className="text-sm text-gray-500">{currentRide.departureTime}</p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium">Recorrido del Viaje</p>
              <div className="space-y-1 mt-1">
                {currentRide.route?.map((point, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        index === 0
                          ? "bg-green-500"
                          : index === currentRide.route!.length - 1
                            ? "bg-red-500"
                            : "bg-amber-500"
                      }`}
                    ></span>
                    <span className="text-gray-500">
                      {point.estimatedTime && `${point.estimatedTime} - `}
                      {point.name}
                      {point.isPickupPoint && <span className="text-xs text-amber-600 ml-1">(Recogida)</span>}
                    </span>
                  </div>
                )) || (
                  <>
                    <div className="flex items-center text-sm">
                      <span className="inline-block w-2 h-2 rounded-full mr-2 bg-green-500"></span>
                      <span className="text-gray-500">{currentRide.origin}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="inline-block w-2 h-2 rounded-full mr-2 bg-red-500"></span>
                      <span className="text-gray-500">{currentRide.destination}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/*<div className="flex items-start space-x-2">
            <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium">Destino</p>
              <p className="text-sm text-gray-500">{currentRide.destination}</p>
            </div>
          </div>*/}

          <div className="flex items-start space-x-2">
            <User className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium">{currentRide.isDriver ? "Pasajeros" : "Conductor"}</p>
              <p className="text-sm text-gray-500">
                {currentRide.isDriver
                  ? `${currentRide.passengers.length}/${currentRide.availableSeats}`
                  : currentRide.driverName}
              </p>
            </div>
          </div>

          {currentRide.isDriver && (
            <Button className="w-full mt-2 bg-black hover:bg-gray-800" onClick={() => setIsDialogOpen(true)}>
              Cancelar Viaje
            </Button>
          )}

          {!currentRide.isDriver && (
            <Button className="w-full mt-2 bg-black hover:bg-gray-800" onClick={() => setIsDialogOpen(true)}>
              Abandonar Viaje
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentRide.isDriver ? "Cancelar Viaje" : "Abandonar Viaje"}</DialogTitle>
            <DialogDescription>
              {currentRide.isDriver
                ? "¿Estás seguro de que deseas cancelar este viaje? Esta acción no se puede deshacer y se notificará a todos los pasajeros."
                : "¿Estás seguro de que deseas abandonar este viaje? Esta acción no se puede deshacer."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCancelling}>
              Volver
            </Button>
            <Button onClick={handleCancelRide} className="bg-black hover:bg-gray-800" disabled={isCancelling}>
              {isCancelling ? "Procesando..." : currentRide.isDriver ? "Cancelar Viaje" : "Abandonar Viaje"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
