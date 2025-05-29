"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Car, Info } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function LoginForm() {
  const [legajo, setLegajo] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(legajo, password)
      router.push("/dashboard")
    } catch (err) {
      setError("Credenciales inválidas. Por favor, intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 flex flex-col items-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-2">
          <Car className="h-6 w-6 text-amber-600" />
        </div>
        <CardTitle className="text-2xl text-center">Bienvenido a UniRide</CardTitle>
        <CardDescription className="text-center">
          Plataforma de viajes compartidos para la comunidad universitaria
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="legajo">Número de Legajo</Label>
            <Input
              id="legajo"
              type="text"
              placeholder="Ingrese su número de legajo"
              value={legajo}
              onChange={(e) => setLegajo(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4 text-gray-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium">Usuarios de prueba</h4>
                  <div className="text-sm text-gray-500">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Legajo: 12345, Contraseña: profesor123</li>
                      <li>Legajo: 54321, Contraseña: estudiante456</li>
                      <li>Legajo: 67890, Contraseña: carlos789</li>
                    </ul>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
