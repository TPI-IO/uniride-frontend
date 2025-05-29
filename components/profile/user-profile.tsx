"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Edit, Save, X } from "lucide-react"
import { apiService } from "@/services"
import type { UserProfile as UserProfileType } from "@/lib/types"

export default function UserProfile() {
  const [profile, setProfile] = useState<UserProfileType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const data = await apiService.getUserProfile()
        setProfile(data)
        setEditData({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
        })
      } catch (error) {
        console.error("Error fetching user profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const handleEditClick = () => {
    setIsEditing(true)
    setError("")
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setError("")
    if (profile) {
      setEditData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!editData.firstName.trim()) {
      setError("El nombre es obligatorio")
      return false
    }
    if (!editData.lastName.trim()) {
      setError("El apellido es obligatorio")
      return false
    }
    if (!editData.email.trim()) {
      setError("El email es obligatorio")
      return false
    }
    if (!editData.phone.trim()) {
      setError("El teléfono es obligatorio")
      return false
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(editData.email)) {
      setError("El email no es válido")
      return false
    }

    return true
  }

  const handleSaveClick = async () => {
    if (!validateForm() || !profile) return

    setIsSaving(true)
    try {
      // Simular actualización del perfil
      const updatedProfile = {
        ...profile,
        ...editData,
      }

      // Actualizar el estado local
      setProfile(updatedProfile)

      // Actualizar el usuario en localStorage
      const currentUser = await apiService.getCurrentUser()
      const updatedUser = { ...currentUser, ...editData }
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))

      setIsEditing(false)
      setError("")
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("Error al actualizar el perfil")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gray-200"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No se pudo cargar la información del perfil.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
          <User className="h-8 w-8 text-amber-600" />
        </div>
        <div className="flex-1">
          <CardTitle>
            {profile.firstName} {profile.lastName}
          </CardTitle>
          <p className="text-sm text-gray-500">{profile.role}</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={handleEditClick} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          ) : (
            <>
              <Button
                onClick={handleSaveClick}
                size="sm"
                className="bg-amber-500 hover:bg-amber-600"
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
              <Button onClick={handleCancelEdit} variant="outline" size="sm" disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" name="firstName" value={editData.firstName} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" name="lastName" value={editData.lastName} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={editData.email} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" value={editData.phone} onChange={handleInputChange} />
              </div>
              <ProfileField label="Legajo" value={profile.legajo} readonly />
              <ProfileField label="DNI" value={profile.dni} readonly />
            </>
          ) : (
            <>
              <ProfileField label="Nombre" value={profile.firstName} />
              <ProfileField label="Apellido" value={profile.lastName} />
              <ProfileField label="Legajo" value={profile.legajo} />
              <ProfileField label="DNI" value={profile.dni} />
              <ProfileField label="Email" value={profile.email} />
              <ProfileField label="Teléfono" value={profile.phone} />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ProfileField({ label, value, readonly = false }: { label: string; value: string; readonly?: boolean }) {
  return (
    <div className="space-y-1">
      <p className={`text-sm font-medium ${readonly ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
      <p className={readonly ? "text-gray-400" : ""}>{value}</p>
      {readonly && <p className="text-xs text-gray-400">No editable</p>}
    </div>
  )
}
