export interface User {
  id: string
  firstName: string
  lastName: string
  legajo: string
  dni: string
  email: string
  phone: string
  institutionalRole: ("student" | "professor" | "staff" | "admin")[]
  uniRideRole: ("passenger" | "driver")[]
  password: string
  paymentMethods?: PaymentMethod[]
  rating?: number
  reviews?: Review[]
  notifications?: Notification[]
  createdAt: string
  createdBy?: string
}

export interface PaymentMethod {
  id: string
  cardNumber: string
  cardHolder: string
  expiryDate: string
  type: "visa" | "mastercard" | "amex"
  isDefault?: boolean
}

export interface Review {
  id: string
  reviewerId: string
  reviewerName: string
  rating: number
  comment: string
  date: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  date: string
  relatedRideId?: string
}

export interface UserProfile extends User {
  // Campos adicionales que podrían agregarse en el futuro
}

export interface Ride {
  id: string
  driverId: string
  driverName: string
  origin?: string
  destination?: string
  date: string
  departureTime: string
  estimatedArrivalTime?: string
  availableSeats: number
  maxDetourMeters?: number
  maxWaitingMinutes?: number
  passengers: {
    id: string
    name: string
    status?: "confirmed" | "cancelled" | "completed"
    paymentMethodId?: string
  }[]
  direction: "toUniversity" | "fromUniversity"
  notes?: string
  isDriver?: boolean
  status?: "active" | "completed" | "cancelled"
  originCoords?: {
    lat: number
    lng: number
  }
  destinationCoords?: {
    lat: number
    lng: number
  }
  route: {
    name: string
    coords: {
      lat: number
      lng: number
    }
    order: number
    isPickupPoint?: boolean
    estimatedTime?: string
  }[]
}

export interface PublishRideData {
  origin: string
  destination: string
  date: string
  departureTime: string
  availableSeats: number
  direction: "toUniversity" | "fromUniversity"
  maxDetourMeters?: number
  maxWaitingMinutes?: number
  notes?: string
}

export interface Statistics {
  totalRidesCompleted: number
  totalDistanceTraveled: number
  totalCO2Saved: number
  totalMoneyEarned: number
  totalMoneySpent: number
  averageRating: number
  mostFrequentDestination: string
  mostFrequentOrigin: string
  mostActiveDay: string
  ridesPerMonth: {
    month: string
    count: number
  }[]
  ridesPerWeekday: {
    day: string
    count: number
  }[]
  passengerCount: number
  driverCount: number
  cancelledRidesCount: number
  completionRate: number
}
