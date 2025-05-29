"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Clock, User, Info, Check, X } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function MyRidesList() {
  const [rides, setRides] = useState<Ride[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)

  useEffect(() => {
    const fetchMyRides = async () => {
      try {
        const data = await apiService.getMyRides()
        setRides(data)
      } catch (error) {
        console.error("Error fetching my rides:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMyRides()
  }, [])

  const handleCancelRide = (ride: Ride) => {
    setSelectedRide(ride)
    setIsDialogOpen(true)
  }

  const handleFinishRide = (ride: Ride) => {
    setSelectedRide(ride)
    setIsFinishDialogOpen(true)
  }

  const confirmCancelRide = async () => {
    if (!selectedRide) return

    setIsCancelling(true)
    try {
      await apiService.cancelRide(selectedRide.id)

      // Actualizar el estado del viaje en la lista
      setRides((prev) =>
        prev.map((ride) => {
          if (ride.id === selectedRide.id) {
            if (ride.isDriver) {
              return { ...ride, status: "cancelled" }
            } else {
              const updatedPassengers = ride.passengers.map((p) => {
                if (p.id === JSON.parse(localStorage.getItem("currentUser") || "{}").id) {
                  return { ...p, status: "cancelled" }
                }
                return p
              })
              return { ...ride, passengers: updatedPassengers }
            }
          }
          return ride
        }),
      )

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error cancelling ride:", error)
    } finally {
      setIsCancelling(false)
    }
  }

  const confirmFinishRide = async () => {
    if (!selectedRide) return

    setIsFinishing(true)
    try {
      await apiService.finishRide(selectedRide.id)

      // Actualizar el estado del viaje en la lista
      setRides((prev) =>
        prev.map((ride) => {
          if (ride.id === selectedRide.id) {
            return { ...ride, status: "completed" }
          }
          return ride
        }),
      )

      setIsFinishDialogOpen(false)
    } catch (error) {
      console.error("Error finishing ride:", error)
    } finally {
      setIsFinishing(false)
    }
  }

  // Filtrar viajes por categoría
  const activeRides = rides.filter(
    (ride) =>
      ride.status === "active" &&
      (ride.isDriver ||
        ride.passengers.some(
          (p) => p.id === JSON.parse(localStorage.getItem("currentUser") || "{}").id && p.status === "confirmed",
        )),
  )

  const completedRides = rides.filter(
    (ride) =>
      ride.status === "completed" ||
      (!ride.isDriver &&
        ride.passengers.some(
          (p) => p.id === JSON.parse(localStorage.getItem("currentUser") || "{}").id && p.status === "completed",
        )),
  )

  const cancelledRides = rides.filter(
    (ride) =>
      ride.status === "cancelled" ||
      (!ride.isDriver &&
        ride.passengers.some(
          (p) => p.id === JSON.parse(localStorage.getItem("currentUser") || "{}").id && p.status === "cancelled",
        )),
  )

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        <div className="h-40 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (rides.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500 mb-4">No has realizado ningún viaje aún.</p>
          <Button
            onClick={() => (window.location.href = "/available-rides")}
            className="bg-amber-500 hover:bg-amber-600"
          >
            Buscar Viajes
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Activos <Badge className="ml-2 bg-amber-500">{activeRides.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completados <Badge className="ml-2 bg-green-500">{completedRides.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelados <Badge className="ml-2 bg-gray-500">{cancelledRides.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeRides.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No tienes viajes activos en este momento.</p>
              </CardContent>
            </Card>
          ) : (
            activeRides.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                onCancel={handleCancelRide}
                onFinish={handleFinishRide}
                showCancelButton={true}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedRides.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No tienes viajes completados.</p>
              </CardContent>
            </Card>
          ) : (
            completedRides.map((ride) => (
              <RideCard key={ride.id} ride={ride} onCancel={() => {}} onFinish={() => {}} showCancelButton={false} />
            ))
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledRides.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No tienes viajes cancelados.</p>
              </CardContent>
            </Card>
          ) : (
            cancelledRides.map((ride) => (
              <RideCard key={ride.id} ride={ride} onCancel={() => {}} onFinish={() => {}} showCancelButton={false} />
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRide?.isDriver ? "Cancelar Viaje" : "Abandonar Viaje"}</DialogTitle>
            <DialogDescription>
              {selectedRide?.isDriver
                ? "¿Estás seguro de que deseas cancelar este viaje? Esta acción no se puede deshacer y se notificará a todos los pasajeros."
                : "¿Estás seguro de que deseas abandonar este viaje? Esta acción no se puede deshacer."}
            </DialogDescription>
          </DialogHeader>

          {selectedRide && (
            <div className="space-y-2 py-2">
              <p>
                <strong>{selectedRide.direction === "toUniversity" ? "Origen:" : "Destino:"}</strong>{" "}
                {selectedRide.direction === "toUniversity" ? selectedRide.origin : selectedRide.destination}
              </p>
              <p>
                <strong>Fecha:</strong> {new Date(selectedRide.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Hora:</strong> {selectedRide.departureTime}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCancelling}>
              Volver
            </Button>
            <Button onClick={confirmCancelRide} className="bg-black hover:bg-gray-800" disabled={isCancelling}>
              {isCancelling ? "Procesando..." : selectedRide?.isDriver ? "Cancelar Viaje" : "Abandonar Viaje"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFinishDialogOpen} onOpenChange={setIsFinishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Viaje</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas finalizar este viaje? Esta acción marcará el viaje como completado y se
              notificará a todos los pasajeros.
            </DialogDescription>
          </DialogHeader>

          {selectedRide && (
            <div className="space-y-2 py-2">
              <p>
                <strong>{selectedRide.direction === "toUniversity" ? "Origen:" : "Destino:"}</strong>{" "}
                {selectedRide.direction === "toUniversity" ? selectedRide.origin : selectedRide.destination}
              </p>
              <p>
                <strong>Fecha:</strong> {new Date(selectedRide.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Hora:</strong> {selectedRide.departureTime}
              </p>
              <p>
                <strong>Pasajeros:</strong> {selectedRide.passengers.length}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFinishDialogOpen(false)} disabled={isFinishing}>
              Volver
            </Button>
            <Button onClick={confirmFinishRide} className="bg-green-600 hover:bg-green-700" disabled={isFinishing}>
              {isFinishing ? "Procesando..." : "Finalizar Viaje"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function RideCard({
  ride,
  onCancel,
  onFinish,
  showCancelButton,
}: {
  ride: Ride
  onCancel: (ride: Ride) => void
  onFinish: (ride: Ride) => void
  showCancelButton: boolean
}) {
  // Determinar el estado del viaje para el usuario actual
  let status = ride.status
  if (!ride.isDriver) {
    const currentUserId = JSON.parse(localStorage.getItem("currentUser") || "{}").id
    const passenger = ride.passengers.find((p) => p.id === currentUserId)
    if (passenger) {
      status = passenger.status
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            {ride.isDriver ? (
              <>
                <span className="mr-2">Como Conductor</span>
                <Badge className="bg-amber-500">Conductor</Badge>
              </>
            ) : (
              <>
                <span className="mr-2">Con {ride.driverName}</span>
                <Badge className="bg-blue-500">Pasajero</Badge>
              </>
            )}
          </CardTitle>
          <StatusBadge status={status as "active" | "completed" | "cancelled" | "confirmed"} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-2">
          <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <p className="font-medium">Fecha</p>
            <p className="text-sm text-gray-500">{new Date(ride.date).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <p className="font-medium">Hora de Salida</p>
            <p className="text-sm text-gray-500">{ride.departureTime}</p>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Recorrido</p>
            <div className="space-y-1 mt-1">
              {ride.route?.map((point, index) => (
                <div key={index} className="flex items-center text-sm">
                  <span
                    className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      index === 0 ? "bg-green-500" : index === ride.route!.length - 1 ? "bg-red-500" : "bg-amber-500"
                    }`}
                  ></span>
                  <span className="text-gray-600">
                    {point.estimatedTime && `${point.estimatedTime} - `}
                    {point.name}
                    {point.isPickupPoint && <span className="text-xs text-amber-600 ml-1">(Subir Pasajero)</span>}
                  </span>
                </div>
              )) || (
                // Fallback para viajes sin route definido
                <>
                  <div className="flex items-center text-sm">
                    <span className="inline-block w-2 h-2 rounded-full mr-2 bg-green-500"></span>
                    <span className="text-gray-600">{ride.origin}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="inline-block w-2 h-2 rounded-full mr-2 bg-red-500"></span>
                    <span className="text-gray-600">{ride.destination}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {ride.isDriver ? (
          <div className="flex items-start space-x-2">
            <User className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium">Pasajeros</p>
              {ride.passengers.length > 0 ? (
                <div className="space-y-1 mt-1">
                  {ride.passengers.map((passenger) => (
                    <div key={passenger.id} className="flex items-center text-sm text-gray-500">
                      <StatusIcon status={passenger.status || "confirmed"} className="mr-1" />
                      {passenger.name}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No hay pasajeros</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-start space-x-2">
            <User className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium">Conductor</p>
              <p className="text-sm text-gray-500">{ride.driverName}</p>
            </div>
          </div>
        )}

        {ride.notes && (
          <div className="flex items-start space-x-2">
            <Info className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium">Notas</p>
              <p className="text-sm text-gray-500">{ride.notes}</p>
            </div>
          </div>
        )}

        {showCancelButton && (
          <div className="flex gap-2 mt-4">
            {ride.isDriver ? (
              <>
                <Button onClick={() => onFinish(ride)} className="flex-1 bg-green-600 hover:bg-green-700">
                  Finalizar Viaje
                </Button>
                <Button onClick={() => onCancel(ride)} className="flex-1 bg-black hover:bg-gray-800">
                  Cancelar Viaje
                </Button>
              </>
            ) : (
              <Button onClick={() => onCancel(ride)} className="w-full bg-black hover:bg-gray-800">
                Abandonar Viaje
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: "active" | "completed" | "cancelled" | "confirmed" }) {
  let bgColor = ""
  let text = ""

  switch (status) {
    case "active":
    case "confirmed":
      bgColor = "bg-amber-100 text-amber-800"
      text = "Activo"
      break
    case "completed":
      bgColor = "bg-green-100 text-green-800"
      text = "Completado"
      break
    case "cancelled":
      bgColor = "bg-gray-100 text-gray-800"
      text = "Cancelado"
      break
  }

  return <span className={`text-xs px-2 py-1 rounded-full ${bgColor}`}>{text}</span>
}

function StatusIcon({
  status,
  className = "",
}: { status: "confirmed" | "cancelled" | "completed"; className?: string }) {
  switch (status) {
    case "confirmed":
      return <Check className={`h-3 w-3 text-green-500 ${className}`} />
    case "cancelled":
      return <X className={`h-3 w-3 text-red-500 ${className}`} />
    case "completed":
      return <Check className={`h-3 w-3 text-blue-500 ${className}`} />
    default:
      return null
  }
}
