"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Search, X } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function RideFilters() {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    direction: "all", // 'all', 'toUniversity', 'fromUniversity'
    date: "",
    location: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (value: string) => {
    setFilters((prev) => ({ ...prev, direction: value }))
  }

  const handleApplyFilters = () => {
    // Aquí se aplicarían los filtros a la lista de viajes
    // En una implementación real, esto podría ser una llamada a la API
    setIsOpen(false)
  }

  const handleResetFilters = () => {
    setFilters({
      direction: "all",
      date: "",
      location: "",
    })
  }

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por ubicación..."
          className="pl-10"
          value={filters.location}
          onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
        />
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="ml-2">
            Filtros
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filtrar Viajes</SheetTitle>
            <SheetDescription>Ajusta los filtros para encontrar el viaje que necesitas</SheetDescription>
          </SheetHeader>

          <div className="py-4 space-y-6">
            <div className="space-y-2">
              <Label>Dirección del Viaje</Label>
              <RadioGroup
                value={filters.direction}
                onValueChange={handleRadioChange}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="cursor-pointer">
                    Todos
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="toUniversity" id="toUniversityFilter" />
                  <Label htmlFor="toUniversityFilter" className="cursor-pointer">
                    Hacia la Universidad
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fromUniversity" id="fromUniversityFilter" />
                  <Label htmlFor="fromUniversityFilter" className="cursor-pointer">
                    Desde la Universidad
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input id="date" name="date" type="date" value={filters.date} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                name="location"
                placeholder="Ej: Barrio Norte"
                value={filters.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <SheetFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleResetFilters} className="w-full sm:w-auto">
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
            <Button onClick={handleApplyFilters} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
              <Search className="h-4 w-4 mr-2" />
              Aplicar Filtros
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
