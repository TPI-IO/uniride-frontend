"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { apiService } from "@/services"
import { Clock, MapPin, Calendar, Users, Info } from "lucide-react"

export default function PublishRideForm() {
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    date: "",
    departureTime: "",
    availableSeats: "3",
    maxDetourMeters: "500",
    maxWaitingMinutes: "5",
    direction: "toUniversity", // 'toUniversity' o 'fromUniversity'
    notes: "",
  })
  const [estimatedArrivalTime, setEstimatedArrivalTime] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Calcular hora estimada de llegada cuando cambia la hora de salida
    if (formData.departureTime) {
      const departureTime = formData.departureTime.split(":")
      const departureHour = Number.parseInt(departureTime[0])
      const departureMinute = Number.parseInt(departureTime[1])

      // Añadir tiempo estimado de viaje (30-35 minutos)
      let arrivalHour = departureHour
      let arrivalMinute = departureMinute + 30 + Math.floor(Math.random() * 5)

      if (arrivalMinute >= 60) {
        arrivalHour += Math.floor(arrivalMinute / 60)
        arrivalMinute = arrivalMinute % 60
      }

      if (arrivalHour >= 24) {
        arrivalHour = arrivalHour % 24
      }

      setEstimatedArrivalTime(`${arrivalHour.toString().padStart(2, "0")}:${arrivalMinute.toString().padStart(2, "0")}`)
    }
  }, [formData.departureTime, formData.origin, formData.destination, formData.direction])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, direction: value }))
  }

  const validateForm = () => {
    if (formData.direction === "toUniversity" && !formData.origin.trim()) {
      setError("El origen es obligatorio")
      return false
    }
    if (formData.direction === "fromUniversity" && !formData.destination.trim()) {
      setError("El destino es obligatorio")
      return false
    }
    if (!formData.date.trim()) {
      setError("La fecha es obligatoria")
      return false
    }
    if (!formData.departureTime.trim()) {
      setError("La hora de salida es obligatoria")
      return false
    }

    // Validar asientos disponibles
    const seats = Number.parseInt(formData.availableSeats)
    if (isNaN(seats) || seats < 1 || seats > 8) {
      setError("Los asientos disponibles deben ser entre 1 y 8")
      return false
    }

    // Validar desvío máximo
    const detour = Number.parseInt(formData.maxDetourMeters)
    if (isNaN(detour) || detour < 0) {
      setError("El desvío máximo debe ser un número positivo")
      return false
    }

    // Validar tiempo de espera máximo
    const waitingTime = Number.parseInt(formData.maxWaitingMinutes)
    if (isNaN(waitingTime) || waitingTime < 0) {
      setError("El tiempo de espera máximo debe ser un número positivo")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Si es hacia la universidad, el destino es fijo
      const rideData = {
        ...formData,
        origin: formData.direction === "toUniversity" ? formData.origin : "Universidad",
        destination: formData.direction === "toUniversity" ? "Universidad" : formData.destination,
        availableSeats: Number.parseInt(formData.availableSeats),
        maxDetourMeters: Number.parseInt(formData.maxDetourMeters),
        maxWaitingMinutes: Number.parseInt(formData.maxWaitingMinutes),
      }

      await apiService.publishRide(rideData)
      router.push("/dashboard")
    } catch (err) {
      setError("Error al publicar el viaje. Por favor, intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>Dirección del Viaje</Label>
            <RadioGroup
              value={formData.direction}
              onValueChange={handleRadioChange}
              className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="toUniversity" id="toUniversity" />
                <Label htmlFor="toUniversity" className="cursor-pointer">
                  Hacia la Universidad
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fromUniversity" id="fromUniversity" />
                <Label htmlFor="fromUniversity" className="cursor-pointer">
                  Desde la Universidad
                </Label>
              </div>
            </RadioGroup>
          </div>

          {formData.direction === "toUniversity" ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <Label htmlFor="origin">Origen (Tu ubicación)</Label>
              </div>
              <Input
                id="origin"
                name="origin"
                placeholder="Ej: Calle Principal 123, Barrio Norte"
                value={formData.origin}
                onChange={handleChange}
                required
              />

              {formData.origin && (
                <div className="mt-2">
                  <iframe
                    width="100%"
                    height="200"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(formData.origin)}`}
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <Label htmlFor="destination">Destino</Label>
              </div>
              <Input
                id="destination"
                name="destination"
                placeholder="Ej: Calle Principal 123, Barrio Norte"
                value={formData.destination}
                onChange={handleChange}
                required
              />

              {formData.destination && (
                <div className="mt-2">
                  <iframe
                    width="100%"
                    height="200"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(formData.destination)}`}
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Label htmlFor="date">Fecha</Label>
              </div>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <Label htmlFor="departureTime">Hora de Salida</Label>
              </div>
              <Input
                id="departureTime"
                name="departureTime"
                type="time"
                value={formData.departureTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {estimatedArrivalTime && (
            <div className="p-3 bg-amber-50 rounded-md border border-amber-200">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Hora estimada de llegada: {estimatedArrivalTime}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <Label htmlFor="availableSeats">Asientos Disponibles</Label>
              </div>
              <Input
                id="availableSeats"
                name="availableSeats"
                type="number"
                min="1"
                max="8"
                value={formData.availableSeats}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <Label htmlFor="maxDetourMeters">Desvío Máximo (metros)</Label>
              </div>
              <Input
                id="maxDetourMeters"
                name="maxDetourMeters"
                type="number"
                min="0"
                step="100"
                value={formData.maxDetourMeters}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-gray-500">Distancia máxima que estás dispuesto a desviarte</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <Label htmlFor="maxWaitingMinutes">Tiempo de Espera (minutos)</Label>
              </div>
              <Input
                id="maxWaitingMinutes"
                name="maxWaitingMinutes"
                type="number"
                min="0"
                max="30"
                value={formData.maxWaitingMinutes}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-gray-500">Tiempo máximo que estás dispuesto a esperar</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-gray-500" />
              <Label htmlFor="notes">Notas Adicionales (opcional)</Label>
            </div>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Ej: Paso por Av. Santa Fe, tengo espacio para equipaje pequeño..."
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>

        <CardFooter className="flex justify-end gap-2 border-t pt-6">
          <Button variant="outline" type="button" onClick={() => router.push("/dashboard")}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-amber-500 hover:bg-amber-600" disabled={isLoading}>
            {isLoading ? "Publicando..." : "Publicar Viaje"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
