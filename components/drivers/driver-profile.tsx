"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Star, Phone, Mail, Calendar, MessageSquare } from "lucide-react"
import { apiService } from "@/services"
import type { User as UserType, Review } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function DriverProfile({ driverId }: { driverId: string }) {
  const [driver, setDriver] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDriverDetails = async () => {
      try {
        const data = await apiService.getDriverDetails(driverId)
        setDriver(data)
      } catch (error) {
        console.error("Error fetching driver details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDriverDetails()
  }, [driverId])

  const handleAddReview = () => {
    setRating(5)
    setComment("")
    setError("")
    setIsReviewDialogOpen(true)
  }

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      setError("Por favor, ingresa un comentario")
      return
    }

    setIsSubmitting(true)
    try {
      const newReview = await apiService.addReview(driverId, rating, comment)

      // Actualizar el driver con la nueva review
      if (driver) {
        const updatedReviews = driver.reviews ? [...driver.reviews, newReview] : [newReview]
        const totalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0)
        const newRating = totalRating / updatedReviews.length

        setDriver({
          ...driver,
          reviews: updatedReviews,
          rating: newRating,
        })
      }

      setIsReviewDialogOpen(false)
    } catch (error) {
      console.error("Error submitting review:", error)
      setError("Error al enviar la opinión")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-40 bg-gray-200 rounded"></div>
        <div className="h-60 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!driver) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se pudo cargar la información del conductor.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center">
              <User className="h-10 w-10 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                {driver.firstName} {driver.lastName}
              </CardTitle>
              <div className="flex items-center mt-1">
                {driver.rating && (
                  <>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(driver.rating) ? "text-amber-500 fill-amber-500" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-medium">{driver.rating.toFixed(1)}</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500 capitalize mt-1">{driver.role}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{driver.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{driver.email}</span>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddReview} className="bg-amber-500 hover:bg-amber-600">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Dejar Opinión
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opiniones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {driver.reviews && driver.reviews.length > 0 ? (
              driver.reviews.map((review) => <ReviewCard key={review.id} review={review} />)
            ) : (
              <p className="text-center text-gray-500 py-4">Este conductor aún no tiene opiniones.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dejar una Opinión</DialogTitle>
            <DialogDescription>
              Comparte tu experiencia con {driver.firstName} {driver.lastName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Calificación</Label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                    <Star className={`h-8 w-8 ${star <= rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comentario</Label>
              <Textarea
                id="comment"
                placeholder="Escribe tu opinión aquí..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitReview} className="bg-amber-500 hover:bg-amber-600" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar Opinión"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <p className="font-medium">{review.reviewerName}</p>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < review.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date(review.date).toLocaleDateString()}
        </div>
      </div>
      <p className="text-sm text-gray-700">{review.comment}</p>
    </div>
  )
}
