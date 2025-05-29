"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Plus, Pencil, Trash2 } from "lucide-react"
import { apiService } from "@/services"
import type { PaymentMethod } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

export default function PaymentMethodsList() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    type: "visa",
    isDefault: false,
  })

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const data = await apiService.getPaymentMethods()
        setPaymentMethods(data)
      } catch (error) {
        console.error("Error fetching payment methods:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPaymentMethods()
  }, [])

  const handleAddClick = () => {
    setFormData({
      cardNumber: "",
      cardHolder: "",
      expiryDate: "",
      type: "visa",
      isDefault: paymentMethods.length === 0, // Si no hay métodos, este será el predeterminado
    })
    setError("")
    setIsAddDialogOpen(true)
  }

  const handleEditClick = (method: PaymentMethod) => {
    setSelectedMethod(method)
    setFormData({
      cardNumber: method.cardNumber,
      cardHolder: method.cardHolder,
      expiryDate: method.expiryDate,
      type: method.type,
      isDefault: method.isDefault || false,
    })
    setError("")
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = (method: PaymentMethod) => {
    setSelectedMethod(method)
    setIsDeleteDialogOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value as "visa" | "mastercard" | "amex" }))
  }

  const handleDefaultChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isDefault: checked }))
  }

  const validateForm = () => {
    if (!formData.cardNumber.trim()) {
      setError("El número de tarjeta es obligatorio")
      return false
    }
    if (!formData.cardHolder.trim()) {
      setError("El nombre del titular es obligatorio")
      return false
    }
    if (!formData.expiryDate.trim()) {
      setError("La fecha de vencimiento es obligatoria")
      return false
    }
    return true
  }

  const handleAddSubmit = async () => {
    if (!validateForm()) return

    setIsProcessing(true)
    try {
      const newMethod = await apiService.addPaymentMethod({
        cardNumber: formData.cardNumber,
        cardHolder: formData.cardHolder,
        expiryDate: formData.expiryDate,
        type: formData.type as "visa" | "mastercard" | "amex",
        isDefault: formData.isDefault,
      })

      setPaymentMethods((prev) => {
        // Si el nuevo método es predeterminado, actualizar los demás
        const updated = prev.map((pm) => ({
          ...pm,
          isDefault: formData.isDefault ? false : pm.isDefault,
        }))
        return [...updated, newMethod]
      })

      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error adding payment method:", error)
      setError("Error al agregar el método de pago")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEditSubmit = async () => {
    if (!selectedMethod || !validateForm()) return

    setIsProcessing(true)
    try {
      const updatedMethod = await apiService.updatePaymentMethod(selectedMethod.id, {
        cardNumber: formData.cardNumber,
        cardHolder: formData.cardHolder,
        expiryDate: formData.expiryDate,
        type: formData.type as "visa" | "mastercard" | "amex",
        isDefault: formData.isDefault,
      })

      setPaymentMethods((prev) => {
        // Si el método actualizado es predeterminado, actualizar los demás
        const updated = prev.map((pm) => {
          if (pm.id === selectedMethod.id) {
            return updatedMethod
          }
          return {
            ...pm,
            isDefault: formData.isDefault ? false : pm.isDefault,
          }
        })
        return updated
      })

      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating payment method:", error)
      setError("Error al actualizar el método de pago")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteSubmit = async () => {
    if (!selectedMethod) return

    setIsProcessing(true)
    try {
      await apiService.deletePaymentMethod(selectedMethod.id)

      setPaymentMethods((prev) => {
        const filtered = prev.filter((pm) => pm.id !== selectedMethod.id)

        // Si el método eliminado era predeterminado y hay otros métodos, establecer el primero como predeterminado
        if (selectedMethod.isDefault && filtered.length > 0) {
          filtered[0].isDefault = true
        }

        return filtered
      })

      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting payment method:", error)
      setError("Error al eliminar el método de pago")
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        <div className="h-40 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <Button onClick={handleAddClick} className="bg-amber-500 hover:bg-amber-600">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Método de Pago
        </Button>
      </div>

      {paymentMethods.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No tienes métodos de pago registrados.</p>
            <Button onClick={handleAddClick} className="bg-amber-500 hover:bg-amber-600">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Método de Pago
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <Card key={method.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">{method.cardNumber}</span>
                      {method.isDefault && (
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          Predeterminada
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>{method.cardHolder}</p>
                      <p>Vence: {method.expiryDate}</p>
                      <p className="uppercase">{method.type}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditClick(method)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteClick(method)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Diálogo para agregar método de pago */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Método de Pago</DialogTitle>
            <DialogDescription>Ingresa los datos de tu tarjeta para agregarla como método de pago.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Número de Tarjeta</Label>
              <Input
                id="cardNumber"
                name="cardNumber"
                placeholder="4111 1111 1111 1111"
                value={formData.cardNumber}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardHolder">Titular de la Tarjeta</Label>
              <Input
                id="cardHolder"
                name="cardHolder"
                placeholder="NOMBRE APELLIDO"
                value={formData.cardHolder}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Fecha de Vencimiento</Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Tarjeta</Label>
              <RadioGroup value={formData.type} onValueChange={handleTypeChange} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="visa" id="visa" />
                  <Label htmlFor="visa">Visa</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mastercard" id="mastercard" />
                  <Label htmlFor="mastercard">MasterCard</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="amex" id="amex" />
                  <Label htmlFor="amex">American Express</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="isDefault" checked={formData.isDefault} onCheckedChange={handleDefaultChange} />
              <Label htmlFor="isDefault">Establecer como método de pago predeterminado</Label>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={handleAddSubmit} className="bg-amber-500 hover:bg-amber-600" disabled={isProcessing}>
              {isProcessing ? "Procesando..." : "Agregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar método de pago */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Método de Pago</DialogTitle>
            <DialogDescription>Actualiza los datos de tu tarjeta.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Número de Tarjeta</Label>
              <Input
                id="cardNumber"
                name="cardNumber"
                placeholder="4111 1111 1111 1111"
                value={formData.cardNumber}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardHolder">Titular de la Tarjeta</Label>
              <Input
                id="cardHolder"
                name="cardHolder"
                placeholder="NOMBRE APELLIDO"
                value={formData.cardHolder}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Fecha de Vencimiento</Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Tarjeta</Label>
              <RadioGroup value={formData.type} onValueChange={handleTypeChange} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="visa" id="edit-visa" />
                  <Label htmlFor="edit-visa">Visa</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mastercard" id="edit-mastercard" />
                  <Label htmlFor="edit-mastercard">MasterCard</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="amex" id="edit-amex" />
                  <Label htmlFor="edit-amex">American Express</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-isDefault"
                checked={formData.isDefault}
                onCheckedChange={handleDefaultChange}
                disabled={selectedMethod?.isDefault}
              />
              <Label htmlFor="edit-isDefault">
                {selectedMethod?.isDefault
                  ? "Este es tu método de pago predeterminado"
                  : "Establecer como método de pago predeterminado"}
              </Label>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

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

      {/* Diálogo para eliminar método de pago */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Método de Pago</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este método de pago? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {selectedMethod && (
            <div className="py-2">
              <div className="flex items-center space-x-2 p-3 border rounded">
                <CreditCard className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">{selectedMethod.cardNumber}</p>
                  <p className="text-sm text-gray-500">{selectedMethod.cardHolder}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={handleDeleteSubmit} className="bg-black hover:bg-gray-800" disabled={isProcessing}>
              {isProcessing ? "Procesando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
