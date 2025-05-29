"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Clock, User, Info, CreditCard } from "lucide-react"
import { apiService } from "@/services"
import type { Ride, PaymentMethod } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function AvailableRidesList() {
  const [rides, setRides] = useState<Ride[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")
  const [securityCode, setSecurityCode] = useState<string>("")
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ridesData, paymentMethodsData] = await Promise.all([
          apiService.getAvailableRides(),
          apiService.getPaymentMethods(),
        ])
        setRides(ridesData)
        setPaymentMethods(paymentMethodsData)
        if (paymentMethodsData.length > 0) {
          const defaultMethod = paymentMethodsData.find((pm) => pm.isDefault)
          setSelectedPaymentMethod(defaultMethod?.id || paymentMethodsData[0].id)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleJoinRide = async (ride: Ride) => {
    setSelectedRide(ride)
    setIsDialogOpen(true)
    setError("")
    setSecurityCode("")
  }

  const confirmJoinRide = async () => {
    if (!selectedRide || !selectedPaymentMethod) return

    if (!securityCode || securityCode.length !== 3) {
      setError("Por favor, ingrese un código de seguridad válido de 3 dígitos.")
      return
    }

    setIsJoining(true)
    try {
      await apiService.joinRide(selectedRide.id, selectedPaymentMethod)
      setIsDialogOpen(false)
      // Redirigir al dashboard o actualizar la lista
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("Error joining ride:", error)
      setError("Error al unirse al viaje. Por favor, intente nuevamente.")
    } finally {
      setIsJoining(false)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-6 bg-gray-200 rounded m-4"></CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </CardContent>
            <CardFooter className="h-10 bg-gray-200 rounded m-4"></CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <Link href="/payment-methods">
          <Button className="bg-amber-500 hover:bg-amber-600">
            <CreditCard className="h-4 w-4 mr-2" />
            Gestionar Métodos de Pago
          </Button>
        </Link>
      </div>

      {rides.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No hay viajes disponibles en este momento.</p>
          <Button onClick={() => (window.location.href = "/publish-ride")} className="bg-amber-500 hover:bg-amber-600">
            Publicar un Viaje
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {rides.map((ride) => (
            <Card key={ride.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 pb-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{ride.driverName}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                    {ride.direction === "toUniversity" ? "Hacia Universidad" : "Desde Universidad"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Recorrido</p>
                    <div className="space-y-1 mt-1">
                      {ride.route?.slice(0, 3).map((point, index) => (
                        <div key={index} className="flex items-center text-xs">
                          <span
                            className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                              index === 0
                                ? "bg-green-500"
                                : index === ride.route!.length - 1
                                  ? "bg-red-500"
                                  : "bg-amber-500"
                            }`}
                          ></span>
                          <span className="text-gray-500">
                            {point.estimatedTime && `${point.estimatedTime} - `}
                            {point.name}
                          </span>
                        </div>
                      )) || (
                        <>
                          <div className="flex items-center text-xs">
                            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 bg-green-500"></span>
                            <span className="text-gray-500">{ride.origin}</span>
                          </div>
                          <div className="flex items-center text-xs">
                            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 bg-red-500"></span>
                            <span className="text-gray-500">{ride.destination}</span>
                          </div>
                        </>
                      )}
                      {ride.route && ride.route.length > 3 && (
                        <div className="text-xs text-gray-400">+{ride.route.length - 3} puntos más...</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Fecha</p>
                    <p className="text-xs text-gray-500">{new Date(ride.date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Hora de Salida</p>
                    <p className="text-xs text-gray-500">{ride.departureTime}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <User className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Asientos Disponibles</p>
                    <p className="text-xs text-gray-500">
                      {ride.availableSeats - ride.passengers.length} de {ride.availableSeats}
                    </p>
                  </div>
                </div>

                {ride.notes && (
                  <div className="flex items-start space-x-2">
                    <Info className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Notas</p>
                      <p className="text-xs text-gray-500">{ride.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50">
                <Button
                  onClick={() => handleJoinRide(ride)}
                  className="w-full bg-amber-500 hover:bg-amber-600"
                  disabled={ride.availableSeats - ride.passengers.length === 0}
                >
                  Unirse al Viaje
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Unirse al Viaje</DialogTitle>
            <DialogDescription>
              Para confirmar tu viaje, selecciona un método de pago e ingresa el código de seguridad.
            </DialogDescription>
          </DialogHeader>

          {selectedRide && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <p>
                  <strong>Conductor:</strong> {selectedRide.driverName}
                </p>
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

              {paymentMethods.length > 0 ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Selecciona un método de pago</Label>
                    <RadioGroup
                      value={selectedPaymentMethod}
                      onValueChange={setSelectedPaymentMethod}
                      className="space-y-2"
                    >
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center space-x-2 border p-2 rounded">
                          <RadioGroupItem value={method.id} id={method.id} />
                          <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                            <div className="flex justify-between items-center">
                              <span>{method.cardNumber}</span>
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {method.type === "visa" ? "VISA" : method.type === "mastercard" ? "MasterCard" : "AMEX"}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {method.cardHolder} • Vence: {method.expiryDate}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="securityCode">Código de seguridad (CVV)</Label>
                    <Input
                      id="securityCode"
                      type="password"
                      maxLength={3}
                      placeholder="123"
                      value={securityCode}
                      onChange={(e) => setSecurityCode(e.target.value)}
                      className="w-20"
                    />
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-red-500 mb-2">No tienes métodos de pago registrados.</p>
                  <Link href="/payment-methods">
                    <Button variant="outline" size="sm">
                      Agregar Método de Pago
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isJoining}>
              Cancelar
            </Button>
            <Button
              onClick={confirmJoinRide}
              className="bg-amber-500 hover:bg-amber-600"
              disabled={isJoining || paymentMethods.length === 0}
            >
              {isJoining ? "Procesando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
