"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { apiService } from "@/services"
import type { User } from "@/lib/types"
import { Plus, Pencil, Trash2, Search, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    legajo: "",
    dni: "",
    email: "",
    phone: "",
    institutionalRole: [] as string[],
    uniRideRole: [] as string[],
    password: "",
    confirmPassword: "",
  })

  const institutionalRoleOptions = [
    { id: "student", label: "Estudiante" },
    { id: "professor", label: "Profesor" },
    { id: "staff", label: "Personal" },
    { id: "admin", label: "Administrador" },
  ]

  const uniRideRoleOptions = [
    { id: "passenger", label: "Pasajero" },
    { id: "driver", label: "Conductor" },
  ]

  useEffect(() => {
    const checkAdminAndFetchUsers = async () => {
      try {
        const currentUser = await apiService.getCurrentUser()

        if (!currentUser.institutionalRole.includes("admin")) {
          router.push("/")
          return
        }

        const data = await apiService.getAllUsers()
        setUsers(data)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminAndFetchUsers()
  }, [router])

  const handleAddClick = () => {
    setFormData({
      firstName: "",
      lastName: "",
      legajo: "",
      dni: "",
      email: "",
      phone: "",
      institutionalRole: [],
      uniRideRole: [],
      password: "",
      confirmPassword: "",
    })
    setError("")
    setIsAddDialogOpen(true)
  }

  const handleEditClick = (user: User) => {
    setSelectedUser(user)
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      legajo: user.legajo,
      dni: user.dni,
      email: user.email,
      phone: user.phone,
      institutionalRole: [...user.institutionalRole],
      uniRideRole: [...user.uniRideRole],
      password: "",
      confirmPassword: "",
    })
    setError("")
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleInstitutionalRoleChange = (roleId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      institutionalRole: checked
        ? [...prev.institutionalRole, roleId]
        : prev.institutionalRole.filter((r) => r !== roleId),
    }))
  }

  const handleUniRideRoleChange = (roleId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      uniRideRole: checked ? [...prev.uniRideRole, roleId] : prev.uniRideRole.filter((r) => r !== roleId),
    }))
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError("El nombre es obligatorio")
      return false
    }
    if (!formData.lastName.trim()) {
      setError("El apellido es obligatorio")
      return false
    }
    if (!formData.legajo.trim()) {
      setError("El legajo es obligatorio")
      return false
    }
    if (!formData.dni.trim()) {
      setError("El DNI es obligatorio")
      return false
    }
    if (!formData.email.trim()) {
      setError("El email es obligatorio")
      return false
    }
    if (!formData.phone.trim()) {
      setError("El teléfono es obligatorio")
      return false
    }
    if (formData.institutionalRole.length === 0) {
      setError("Debe seleccionar al menos un rol institucional")
      return false
    }
    if (formData.uniRideRole.length === 0) {
      setError("Debe seleccionar al menos un rol en UniRide")
      return false
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("El email no es válido")
      return false
    }

    // Validar DNI
    if (!/^\d{8}$/.test(formData.dni)) {
      setError("El DNI debe tener 8 dígitos")
      return false
    }

    // Validar contraseña en caso de agregar nuevo usuario
    if (!isEditDialogOpen) {
      if (!formData.password) {
        setError("La contraseña es obligatoria")
        return false
      }
      if (formData.password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres")
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Las contraseñas no coinciden")
        return false
      }
    }

    // Validar contraseña en caso de editar (solo si se ingresó una nueva)
    if (isEditDialogOpen && formData.password) {
      if (formData.password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres")
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Las contraseñas no coinciden")
        return false
      }
    }

    return true
  }

  const handleAddSubmit = async () => {
    if (!validateForm()) return

    setIsProcessing(true)
    try {
      // Simulación hardcodeada - crear nuevo usuario
      const newUser: User = {
        id: `user-${Date.now()}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        legajo: formData.legajo,
        dni: formData.dni,
        email: formData.email,
        phone: formData.phone,
        institutionalRole: formData.institutionalRole as ("student" | "professor" | "staff" | "admin")[],
        uniRideRole: formData.uniRideRole as ("passenger" | "driver")[],
        password: formData.password,
        createdAt: new Date().toISOString(),
        createdBy: "admin-1",
      }

      setUsers((prev) => [...prev, newUser])
      setIsAddDialogOpen(false)
    } catch (error: any) {
      console.error("Error adding user:", error)
      setError(error.message || "Error al agregar el usuario")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEditSubmit = async () => {
    if (!selectedUser || !validateForm()) return

    setIsProcessing(true)
    try {
      // Simulación hardcodeada - actualizar usuario
      const updatedUser: User = {
        ...selectedUser,
        firstName: formData.firstName,
        lastName: formData.lastName,
        legajo: formData.legajo,
        dni: formData.dni,
        email: formData.email,
        phone: formData.phone,
        institutionalRole: formData.institutionalRole as ("student" | "professor" | "staff" | "admin")[],
        uniRideRole: formData.uniRideRole as ("passenger" | "driver")[],
        ...(formData.password && { password: formData.password }),
      }

      setUsers((prev) => prev.map((user) => (user.id === selectedUser.id ? updatedUser : user)))
      setIsEditDialogOpen(false)
    } catch (error: any) {
      console.error("Error updating user:", error)
      setError(error.message || "Error al actualizar el usuario")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteSubmit = async () => {
    if (!selectedUser) return

    setIsProcessing(true)
    try {
      // Simulación hardcodeada - eliminar usuario
      setUsers((prev) => prev.filter((user) => user.id !== selectedUser.id))
      setIsDeleteDialogOpen(false)
    } catch (error: any) {
      console.error("Error deleting user:", error)
      setError(error.message || "Error al eliminar el usuario")
    } finally {
      setIsProcessing(false)
    }
  }

  // Filtrar usuarios según el término de búsqueda
  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.legajo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Separar usuarios por rol institucional
  const students = filteredUsers.filter((user) => user.institutionalRole.includes("student"))
  const professors = filteredUsers.filter((user) => user.institutionalRole.includes("professor"))
  const staff = filteredUsers.filter((user) => user.institutionalRole.includes("staff"))
  const admins = filteredUsers.filter((user) => user.institutionalRole.includes("admin"))

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            apiService.logout()
            window.location.href = "/"
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión Admin
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar usuarios..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleAddClick} className="ml-4 bg-amber-500 hover:bg-amber-600">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Usuario
          </Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Todos ({filteredUsers.length})</TabsTrigger>
            <TabsTrigger value="students">Estudiantes ({students.length})</TabsTrigger>
            <TabsTrigger value="professors">Profesores ({professors.length})</TabsTrigger>
            <TabsTrigger value="staff">Personal ({staff.length})</TabsTrigger>
            <TabsTrigger value="admins">Administradores ({admins.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <UsersTable users={filteredUsers} onEdit={handleEditClick} onDelete={handleDeleteClick} />
          </TabsContent>

          <TabsContent value="students">
            <UsersTable users={students} onEdit={handleEditClick} onDelete={handleDeleteClick} />
          </TabsContent>

          <TabsContent value="professors">
            <UsersTable users={professors} onEdit={handleEditClick} onDelete={handleDeleteClick} />
          </TabsContent>

          <TabsContent value="staff">
            <UsersTable users={staff} onEdit={handleEditClick} onDelete={handleDeleteClick} />
          </TabsContent>

          <TabsContent value="admins">
            <UsersTable users={admins} onEdit={handleEditClick} onDelete={handleDeleteClick} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Diálogo para agregar usuario */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar Usuario</DialogTitle>
            <DialogDescription>Ingresa los datos del nuevo usuario.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="legajo">Legajo</Label>
              <Input id="legajo" name="legajo" value={formData.legajo} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dni">DNI</Label>
              <Input id="dni" name="dni" value={formData.dni} onChange={handleInputChange} />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Roles Institucionales</Label>
              <div className="grid grid-cols-2 gap-2">
                {institutionalRoleOptions.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`institutional-${role.id}`}
                      checked={formData.institutionalRole.includes(role.id)}
                      onCheckedChange={(checked) => handleInstitutionalRoleChange(role.id, checked as boolean)}
                    />
                    <Label htmlFor={`institutional-${role.id}`} className="text-sm">
                      {role.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Roles en UniRide</Label>
              <div className="grid grid-cols-2 gap-2">
                {uniRideRoleOptions.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`uniride-${role.id}`}
                      checked={formData.uniRideRole.includes(role.id)}
                      onCheckedChange={(checked) => handleUniRideRoleChange(role.id, checked as boolean)}
                    />
                    <Label htmlFor={`uniride-${role.id}`} className="text-sm">
                      {role.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={handleAddSubmit} className="bg-amber-500 hover:bg-amber-600" disabled={isProcessing}>
              {isProcessing ? "Procesando..." : "Agregar Usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar usuario */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Actualiza los datos del usuario.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-firstName">Nombre</Label>
              <Input id="edit-firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-lastName">Apellido</Label>
              <Input id="edit-lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-legajo">Legajo</Label>
              <Input id="edit-legajo" name="legajo" value={formData.legajo} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-dni">DNI</Label>
              <Input id="edit-dni" name="dni" value={formData.dni} onChange={handleInputChange} />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-phone">Teléfono</Label>
              <Input id="edit-phone" name="phone" value={formData.phone} onChange={handleInputChange} />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Roles Institucionales</Label>
              <div className="grid grid-cols-2 gap-2">
                {institutionalRoleOptions.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-institutional-${role.id}`}
                      checked={formData.institutionalRole.includes(role.id)}
                      onCheckedChange={(checked) => handleInstitutionalRoleChange(role.id, checked as boolean)}
                    />
                    <Label htmlFor={`edit-institutional-${role.id}`} className="text-sm">
                      {role.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Roles en UniRide</Label>
              <div className="grid grid-cols-2 gap-2">
                {uniRideRoleOptions.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-uniride-${role.id}`}
                      checked={formData.uniRideRole.includes(role.id)}
                      onCheckedChange={(checked) => handleUniRideRoleChange(role.id, checked as boolean)}
                    />
                    <Label htmlFor={`edit-uniride-${role.id}`} className="text-sm">
                      {role.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password">Nueva Contraseña (opcional)</Label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="edit-confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={handleEditSubmit} className="bg-amber-500 hover:bg-amber-600" disabled={isProcessing}>
              {isProcessing ? "Procesando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para eliminar usuario */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a este usuario? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="py-2">
              <p>
                <strong>Nombre:</strong> {selectedUser.firstName} {selectedUser.lastName}
              </p>
              <p>
                <strong>Legajo:</strong> {selectedUser.legajo}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={handleDeleteSubmit} className="bg-black hover:bg-gray-800" disabled={isProcessing}>
              {isProcessing ? "Procesando..." : "Eliminar Usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function UsersTable({
  users,
  onEdit,
  onDelete,
}: {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}) {
  const getRoleLabels = (institutionalRole: string[], uniRideRole: string[]) => {
    const institutionalLabels = institutionalRole.map((role) => {
      switch (role) {
        case "student":
          return "Estudiante"
        case "professor":
          return "Profesor"
        case "staff":
          return "Personal"
        case "admin":
          return "Admin"
        default:
          return role
      }
    })

    const uniRideLabels = uniRideRole.map((role) => {
      switch (role) {
        case "passenger":
          return "Pasajero"
        case "driver":
          return "Conductor"
        default:
          return role
      }
    })

    return {
      institutional: institutionalLabels.join(", "),
      uniRide: uniRideLabels.join(", "),
    }
  }

  if (users.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No se encontraron usuarios.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Legajo</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Rol Institucional</TableHead>
              <TableHead>Rol UniRide</TableHead>
              <TableHead>Fecha de Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const roleLabels = getRoleLabels(user.institutionalRole, user.uniRideRole)
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.legajo}</TableCell>
                  <TableCell>{user.dni}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.institutionalRole.map((role) => (
                        <span
                          key={role}
                          className={`px-2 py-1 rounded-full text-xs ${
                            role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : role === "professor"
                                ? "bg-blue-100 text-blue-800"
                                : role === "staff"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-green-100 text-green-800"
                          }`}
                        >
                          {roleLabels.institutional
                            .split(", ")
                            .find(
                              (label) =>
                                (role === "student" && label === "Estudiante") ||
                                (role === "professor" && label === "Profesor") ||
                                (role === "staff" && label === "Personal") ||
                                (role === "admin" && label === "Admin"),
                            )}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.uniRideRole.map((role) => (
                        <span
                          key={role}
                          className={`px-2 py-1 rounded-full text-xs ${
                            role === "driver" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {role === "driver" ? "Conductor" : "Pasajero"}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(user)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
