import { database } from "@/lib/database"
import type {
  User,
  UserProfile,
  Ride,
  PublishRideData,
  PaymentMethod,
  Review,
  Notification,
  Statistics,
} from "@/lib/types"

// API service con autenticación básica y datos específicos por usuario
export const apiService = {
  // Autenticación
  login: async (legajo: string, password: string): Promise<User> => {
    // Buscar usuario por legajo
    const user = database.users.find((u) => u.legajo === legajo)

    // Verificar si el usuario existe y la contraseña es correcta
    if (!user || user.password !== password) {
      throw new Error("Credenciales inválidas")
    }

    // Guardar el usuario en localStorage para mantener la sesión
    localStorage.setItem("currentUser", JSON.stringify(user))

    // Devolver el usuario autenticado (sin la contraseña)
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword as User
  },

  logout: () => {
    // Eliminar el usuario del localStorage
    localStorage.removeItem("currentUser")
  },

  getCurrentUser: async (): Promise<User> => {
    // Obtener el usuario del localStorage
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) {
      throw new Error("No hay usuario autenticado")
    }

    // Devolver el usuario autenticado
    return JSON.parse(userJson)
  },

  // Perfil de usuario
  getUserProfile: async (): Promise<UserProfile> => {
    // Obtener el usuario autenticado
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) {
      throw new Error("No hay usuario autenticado")
    }

    const currentUser = JSON.parse(userJson)

    // Buscar el perfil completo del usuario en la base de datos
    const userProfile = database.users.find((u) => u.id === currentUser.id)
    if (!userProfile) {
      throw new Error("Perfil no encontrado")
    }

    // Devolver el perfil sin la contraseña
    const { password: _, ...profileWithoutPassword } = userProfile
    return profileWithoutPassword as UserProfile
  },

  // Estadísticas
  getUserStats: async () => {
    // Obtener el usuario autenticado
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) {
      throw new Error("No hay usuario autenticado")
    }

    const currentUser = JSON.parse(userJson)

    // Filtrar viajes donde el usuario es conductor o pasajero
    const userRides = database.rides.filter(
      (ride) => ride.driverId === currentUser.id || ride.passengers.some((p) => p.id === currentUser.id),
    )

    // Calcular estadísticas para el usuario actual
    return {
      totalRidesAsDriver: userRides.filter((ride) => ride.driverId === currentUser.id).length,
      totalRidesAsPassenger: userRides.filter((ride) => ride.passengers.some((p) => p.id === currentUser.id)).length,
      totalSavedCO2: userRides.length * 2.3, // Valor ficticio en kg
      totalDistance: userRides.length * 15.7, // Valor ficticio en km
    }
  },

  // Estadísticas detalladas
  getUserDetailedStats: async (): Promise<Statistics> => {
    // Obtener el usuario autenticado
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) {
      throw new Error("No hay usuario autenticado")
    }

    const currentUser = JSON.parse(userJson)

    // Filtrar viajes donde el usuario es conductor o pasajero
    const userRides = database.rides.filter(
      (ride) => ride.driverId === currentUser.id || ride.passengers.some((p) => p.id === currentUser.id),
    )

    // Viajes completados
    const completedRides = userRides.filter(
      (ride) =>
        ride.status === "completed" ||
        (!ride.isDriver && ride.passengers.some((p) => p.id === currentUser.id && p.status === "completed")),
    )

    // Viajes cancelados
    const cancelledRides = userRides.filter(
      (ride) =>
        ride.status === "cancelled" ||
        (!ride.isDriver && ride.passengers.some((p) => p.id === currentUser.id && p.status === "cancelled")),
    )

    // Calcular destinos y orígenes más frecuentes
    const destinations = userRides.map((ride) => ride.destination)
    const origins = userRides.map((ride) => ride.origin)

    const destinationCounts: Record<string, number> = {}
    const originCounts: Record<string, number> = {}

    destinations.forEach((dest) => {
      destinationCounts[dest] = (destinationCounts[dest] || 0) + 1
    })

    origins.forEach((orig) => {
      originCounts[orig] = (originCounts[orig] || 0) + 1
    })

    const mostFrequentDestination =
      Object.entries(destinationCounts)
        .sort((a, b) => b[1] - a[1])
        .map((entry) => entry[0])[0] || "N/A"

    const mostFrequentOrigin =
      Object.entries(originCounts)
        .sort((a, b) => b[1] - a[1])
        .map((entry) => entry[0])[0] || "N/A"

    // Calcular día de la semana más activo
    const weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
    const dayCount: Record<string, number> = {}

    userRides.forEach((ride) => {
      const date = new Date(ride.date)
      const day = weekdays[date.getDay()]
      dayCount[day] = (dayCount[day] || 0) + 1
    })

    const mostActiveDay =
      Object.entries(dayCount)
        .sort((a, b) => b[1] - a[1])
        .map((entry) => entry[0])[0] || "N/A"

    // Calcular viajes por mes
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]
    const ridesPerMonth = months.map((month) => ({ month, count: 0 }))

    userRides.forEach((ride) => {
      const date = new Date(ride.date)
      const monthIndex = date.getMonth()
      ridesPerMonth[monthIndex].count++
    })

    // Calcular viajes por día de la semana
    const ridesPerWeekday = weekdays.map((day) => ({ day, count: 0 }))

    userRides.forEach((ride) => {
      const date = new Date(ride.date)
      const dayIndex = date.getDay()
      ridesPerWeekday[dayIndex].count++
    })

    // Calcular tasa de finalización
    const completionRate = userRides.length > 0 ? (completedRides.length / userRides.length) * 100 : 0

    // Calcular dinero ganado (como conductor) y gastado (como pasajero)
    // Valores ficticios basados en la cantidad de viajes
    const totalMoneyEarned = userRides.filter((ride) => ride.driverId === currentUser.id).length * 250
    const totalMoneySpent =
      userRides.filter((ride) => ride.passengers.some((p) => p.id === currentUser.id)).length * 200

    return {
      totalRidesCompleted: completedRides.length,
      totalDistanceTraveled: userRides.length * 15.7, // Valor ficticio en km
      totalCO2Saved: userRides.length * 2.3, // Valor ficticio en kg
      totalMoneyEarned,
      totalMoneySpent,
      averageRating: currentUser.rating || 0,
      mostFrequentDestination,
      mostFrequentOrigin,
      mostActiveDay,
      ridesPerMonth,
      ridesPerWeekday,
      passengerCount: userRides.filter((ride) => ride.passengers.some((p) => p.id === currentUser.id)).length,
      driverCount: userRides.filter((ride) => ride.driverId === currentUser.id).length,
      cancelledRidesCount: cancelledRides.length,
      completionRate,
    }
  },

  // Viajes
  getCurrentRide: async (): Promise<Ride | null> => {
    // Obtener el usuario autenticado
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) {
      throw new Error("No hay usuario autenticado")
    }

    const currentUser = JSON.parse(userJson)
    const today = new Date().toISOString().split("T")[0]

    // Buscar un viaje para hoy donde el usuario es conductor o pasajero
    const currentRide = database.rides.find((ride) => {
      const isToday = ride.date === today
      const isActive = ride.status === "active"
      const isDriver = ride.driverId === currentUser.id
      const isPassenger = ride.passengers.some((p) => p.id === currentUser.id && p.status === "confirmed")
      return isToday && isActive && (isDriver || isPassenger)
    })

    if (currentRide) {
      return {
        ...currentRide,
        isDriver: currentRide.driverId === currentUser.id,
      }
    }

    return null
  },

  getRecentRides: async (): Promise<Ride[]> => {
    // Obtener el usuario autenticado
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) {
      throw new Error("No hay usuario autenticado")
    }

    const currentUser = JSON.parse(userJson)

    // Filtrar viajes donde el usuario es conductor o pasajero
    const userRides = database.rides
      .filter((ride) => ride.driverId === currentUser.id || ride.passengers.some((p) => p.id === currentUser.id))
      .map((ride) => ({
        ...ride,
        isDriver: ride.driverId === currentUser.id,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5) // Últimos 5 viajes

    return userRides
  },

  getAvailableRides: async (): Promise<Ride[]> => {
    // Obtener el usuario autenticado
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) {
      throw new Error("No hay usuario autenticado")
    }

    const currentUser = JSON.parse(userJson)
    const today = new Date().toISOString().split("T")[0]

    // Filtrar viajes futuros donde el usuario no es conductor ni pasajero
    const availableRides = database.rides
      .filter((ride) => {
        const isFuture = ride.date >= today
        const isActive = ride.status === "active"
        const isNotDriver = ride.driverId !== currentUser.id
        const isNotPassenger = !ride.passengers.some((p) => p.id === currentUser.id)
        const hasAvailableSeats = ride.passengers.length < ride.availableSeats
        return isFuture && isActive && isNotDriver && isNotPassenger && hasAvailableSeats
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return availableRides
  },

  publishRide: async (rideData: PublishRideData): Promise<Ride> => {
    // Obtener el usuario autenticado
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) {
      throw new Error("No hay usuario autenticado")
    }

    const currentUser = JSON.parse(userJson)

    // Verificar que el usuario tenga rol de conductor
    if (!currentUser.uniRideRole.includes("driver")) {
      throw new Error("No tienes permisos para publicar viajes. Necesitas el rol de conductor.")
    }

    // Calcular hora estimada de llegada (ficticio por ahora)
    const departureTime = rideData.departureTime.split(":")
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

    const estimatedArrivalTime = `${arrivalHour.toString().padStart(2, "0")}:${arrivalMinute.toString().padStart(2, "0")}`

    // Obtener coordenadas (ficticias)
    const originName = rideData.direction === "toUniversity" ? rideData.origin : "Universidad"
    const destinationName = rideData.direction === "toUniversity" ? "Universidad" : rideData.destination

    // Crear un nuevo viaje
    const newRide: Ride = {
      id: `ride-${Date.now()}`,
      driverId: currentUser.id,
      driverName: `${currentUser.firstName} ${currentUser.lastName}`,
      origin: rideData.direction === "toUniversity" ? rideData.origin : "Universidad",
      destination: rideData.direction === "toUniversity" ? "Universidad" : rideData.destination,
      date: rideData.date,
      departureTime: rideData.departureTime,
      estimatedArrivalTime,
      availableSeats: rideData.availableSeats,
      maxDetourMeters: rideData.maxDetourMeters,
      maxWaitingMinutes: rideData.maxWaitingMinutes,
      passengers: [],
      direction: rideData.direction,
      notes: rideData.notes,
      status: "active",
      originCoords: (database as any).locationCoords?.[originName] || { lat: 0, lng: 0 },
      destinationCoords: (database as any).locationCoords?.[destinationName] || { lat: 0, lng: 0 },
    }

    // Agregar el nuevo viaje a la base de datos
    database.rides.push(newRide)

    // Crear notificación para usuarios cercanos
    const nearbyUsers = database.users.filter(
      (user) => user.id !== currentUser.id && !user.institutionalRole.includes("admin"),
    )

    nearbyUsers.forEach((user) => {
      const notification: Notification = {
        id: `notif-${Date.now()}-${user.id}`,
        userId: user.id,
        title: "Nuevo viaje disponible",
        message: `${currentUser.firstName} ${currentUser.lastName} ha publicado un viaje desde ${newRide.origin} que podría interesarte.`,
        type: "info",
        read: false,
        date: new Date().toISOString(),
        relatedRideId: newRide.id,
      }

      if (!user.notifications) {
        user.notifications = []
      }

      user.notifications.push(notification)
    })

    return newRide
  },

  joinRide: async (rideId: string, paymentMethodId: string): Promise<void> => {
    // Obtener el usuario autenticado
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) {
      throw new Error("No hay usuario autenticado")
    }

    const currentUser = JSON.parse(userJson)

    // Verificar que el usuario tenga rol de pasajero
    if (!currentUser.uniRideRole.includes("passenger")) {
      throw new Error("No tienes permisos para unirte a viajes. Necesitas el rol de pasajero.")
    }

    // Buscar el viaje
    const ride = database.rides.find((r) => r.id === rideId)

    if (!ride) {
      throw new Error("Viaje no encontrado")
    }

    if (ride.passengers.length >= ride.availableSeats) {
      throw new Error("No hay asientos disponibles")
    }

    if (ride.passengers.some((p) => p.id === currentUser.id)) {
      throw new Error("Ya te has unido a este viaje")
    }

    // Agregar al usuario como pasajero
    ride.passengers.push({
      id: currentUser.id,
      name: `${currentUser.firstName} ${currentUser.lastName}`,
      status: "confirmed",
      paymentMethodId,
    })

    // Crear notificación para el conductor
    const driver = database.users.find((user) => user.id === ride.driverId)
    if (driver) {
      const notification: Notification = {
        id: `notif-${Date.now()}-${driver.id}`,
        userId: driver.id,
        title: "Nuevo pasajero",
        message: `${currentUser.firstName} ${currentUser.lastName} se ha unido a tu viaje a ${ride.destination}.`,
        type: "success",
        read: false,
        date: new Date().toISOString(),
        relatedRideId: ride.id,
      }

      if (!driver.notifications) {
        driver.notifications = []
      }

      driver.notifications.push(notification)
    }

    // Crear notificación para el pasajero
    const notification: Notification = {
      id: `notif-${Date.now()}-${currentUser.id}`,
      userId: currentUser.id,
      title: "Viaje confirmado",
      message: `Te has unido al viaje de ${ride.driverName} a ${ride.destination}.`,
      type: "success",
      read: false,
      date: new Date().toISOString(),
      relatedRideId: ride.id,
    }

    if (!currentUser.notifications) {
      currentUser.notifications = []
    }

    currentUser.notifications.push(notification)

    // Actualizar el usuario en localStorage
    localStorage.setItem("currentUser", JSON.stringify(currentUser))
  },

  cancelRide: async (rideId: string): Promise<void> => {
    // Obtener el usuario autenticado
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) {
      throw new Error("No hay usuario autenticado")
    }

    const currentUser = JSON.parse(userJson)

    // Buscar el viaje
    const ride = database.rides.find((r) => r.id === rideId)

    if (!ride) {
      throw new Error("Viaje no encontrado")
    }

    // Si el usuario es el conductor, cancelar todo el viaje
    if (ride.driverId === currentUser.id) {
      ride.status = "cancelled"
      // Actualizar el estado de todos los pasajeros
      ride.passengers.forEach((passenger) => {
        passenger.status = "cancelled"

        // Notificar a cada pasajero
        const passengerUser = database.users.find((user) => user.id === passenger.id)
        if (passengerUser) {
          const notification: Notification = {
            id: `notif-${Date.now()}-${passenger.id}`,
            userId: passenger.id,
            title: "Viaje cancelado",
            message: `${currentUser.firstName} ${currentUser.lastName} ha cancelado el viaje a ${ride.destination}.`,
            type: "warning",
            read: false,
            date: new Date().toISOString(),
            relatedRideId: ride.id,
          }

          if (!passengerUser.notifications) {
            passengerUser.notifications = []
          }

          passengerUser.notifications.push(notification)
        }
      })

      // Notificación para el conductor
      const notification: Notification = {
        id: `notif-${Date.now()}-${currentUser.id}`,
        userId: currentUser.id,
        title: "Viaje cancelado",
        message: `Has cancelado tu viaje a ${ride.destination}.`,
        type: "info",
        read: false,
        date: new Date().toISOString(),
        relatedRideId: ride.id,
      }

      if (!currentUser.notifications) {
        currentUser.notifications = []
      }

      currentUser.notifications.push(notification)
    } else {
      // Si el usuario es pasajero, actualizar su estado
      const passenger = ride.passengers.find((p) => p.id === currentUser.id)
      if (passenger) {
        passenger.status = "cancelled"

        // Notificar al conductor
        const driver = database.users.find((user) => user.id === ride.driverId)
        if (driver) {
          const notification: Notification = {
            id: `notif-${Date.now()}-${driver.id}`,
            userId: driver.id,
            title: "Pasajero cancelado",
            message: `${currentUser.firstName} ${currentUser.lastName} ha abandonado tu viaje a ${ride.destination}.`,
            type: "warning",
            read: false,
            date: new Date().toISOString(),
            relatedRideId: ride.id,
          }

          if (!driver.notifications) {
            driver.notifications = []
          }

          driver.notifications.push(notification)
        }

        // Notificación para el pasajero
        const notification: Notification = {
          id: `notif-${Date.now()}-${currentUser.id}`,
          userId: currentUser.id,
          title: "Viaje abandonado",
          message: `Has abandonado el viaje de ${ride.driverName} a ${ride.destination}.`,
          type: "info",
          read: false,
          date: new Date().toISOString(),
          relatedRideId: ride.id,
        }

        if (!currentUser.notifications) {
          currentUser.notifications = []
        }

        currentUser.notifications.push(notification)
      } else {
        throw new Error("No eres pasajero de este viaje")
      }
    }

    // Actualizar el usuario en localStorage
    localStorage.setItem("currentUser", JSON.stringify(currentUser))
  },

  finishRide: async (rideId: string): Promise<void> => {
    // Obtener el usuario autenticado
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) {
      throw new Error("No hay usuario autenticado")
    }

    const currentUser = JSON.parse(userJson)

    // Buscar el viaje
    const ride = database.rides.find((r) => r.id === rideId)

    if (!ride) {
      throw new Error("Viaje no encontrado")
    }

    // Verificar que el usuario sea el conductor
    if (ride.driverId !== currentUser.id) {
      throw new Error("Solo el conductor puede finalizar el viaje")
    }

    // Verificar que el usuario tenga rol de conductor
    if (!currentUser.uniRideRole.includes("driver")) {
      throw new Error("No tienes permisos para finalizar viajes. Necesitas el rol de conductor.")
    }

    // Marcar el viaje como completado
    ride.status = "completed"

    // Actualizar el estado de todos los pasajeros confirmados a completado
    ride.passengers.forEach((passenger) => {
      if (passenger.status === "confirmed") {
        passenger.status = "completed"
      }

      // Notificar a cada pasajero
      const passengerUser = database.users.find((user) => user.id === passenger.id)
      if (passengerUser) {
        const notification: Notification = {
          id: `notif-${Date.now()}-${passenger.id}`,
          userId: passenger.id,
          title: "Viaje finalizado",
          message: `El viaje con ${currentUser.firstName} ${currentUser.lastName} a ${ride.destination} ha finalizado. ¡Gracias por usar UniRide!`,
          type: "success",
          read: false,
          date: new Date().toISOString(),
          relatedRideId: ride.id,
        }

        if (!passengerUser.notifications) {
          passengerUser.notifications = []
        }

        passengerUser.notifications.push(notification)
      }
    })

    // Notificación para el conductor
    const notification: Notification = {
      id: `notif-${Date.now()}-${currentUser.id}`,
      userId: currentUser.id,
      title: "Viaje finalizado",
      message: `Has finalizado tu viaje a ${ride.destination}. ¡Gracias por ser parte de UniRide!`,
      type: "success",
      read: false,
      date: new Date().toISOString(),
      relatedRideId: ride.id,
    }

    if (!currentUser.notifications) {
      currentUser.notifications = []
    }

    currentUser.notifications.push(notification)

    // Actualizar el usuario en localStorage
    localStorage.setItem("currentUser", JSON.stringify(currentUser))
  },

  // Métodos de pago
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    // Obtener el usuario autenticado
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) {
      throw new Error("No hay usuario autenticado")
    }

    const currentUser = JSON.parse(userJson)

    // Buscar el usuario en la base de datos
    const user = database.users.find((u) => u.id === currentUser.id)
    if (!user || !user.paymentMethods) {
      return []
    }

    return user.paymentMethods
  },

  addPaymentMethod: async (paymentMethod: Omit<PaymentMethod, "id">): Promise<PaymentMethod> => {
    // Obtener el usuario autenticado
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) {
      throw new Error("No hay usuario autenticado")
    }

    const currentUser = JSON.parse(userJson)

    // Buscar el usuario en la base de datos
    const user = database.users.find((u) => u.id === currentUser.id)
    if (!user) {
      throw new Error("Usuario no encontrado")
    }

    // Inicializar el array de métodos de pago si no existe
    if (!user.paymentMethods) {
      user.paymentMethods = []
    }

    // Verificar si ya existe una tarjeta con el mismo número
    const existingCard = user.paymentMethods.find((pm) => pm.cardNumber === paymentMethod.cardNumber)
    if (existingCard) {
      throw new Error("Ya tienes una tarjeta registrada con este número")
    }

    // Crear un nuevo método de pago
    const newPaymentMethod: PaymentMethod = {
      id: `pm-${Date.now()}`,
      ...paymentMethod,
      isDefault: user.paymentMethods.length === 0 ? true : paymentMethod.isDefault,
    }

    // Si el nuevo método es predeterminado, actualizar los demás
    if (newPaymentMethod.isDefault) {
      user.paymentMethods.forEach((pm) => {
        pm.isDefault = false
      })
    }

    // Agregar el nuevo método de pago
    user.paymentMethods.push(newPaymentMethod)

    // Actualizar el usuario en localStorage
    localStorage.setItem("currentUser", JSON.stringify(user))

    return newPaymentMethod
  },

  updatePaymentMethod: async (id: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    // Obtener el usuario autenticado
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) {
      throw new Error("No hay usuario autenticado")
    }

    const currentUser = JSON.parse(userJson)

    // Buscar el usuario en la base de datos
    const user = database.users.find((u) => u.id === currentUser.id)
    if (!user || !user.paymentMethods) {
      throw new Error("Usuario o método de pago no encontrado")
    }

    // Buscar el método de pago
    const paymentMethod = user.paymentMethods.find((pm) => pm.id === id)
    if (!paymentMethod) {
      throw new Error("Método de pago no encontrado")
    }

    // Verificar si ya existe una tarjeta con el mismo número (excepto la actual)
    if (updates.cardNumber) {
      const existingCard = user.paymentMethods.find((pm) => pm.cardNumber === updates.cardNumber && pm.id !== id)
      if (existingCard) {
        throw new Error("Ya tienes una tarjeta registrada con este número")
      }
    }

    // Si se está actualizando isDefault a true, actualizar los demás
    if (updates.isDefault) {
      user.paymentMethods.forEach((pm) => {
        pm.isDefault = pm.id === id
      })
    }

    // Actualizar el método de pago
    Object.assign(paymentMethod, updates)

    // Actualizar el usuario en localStorage
    localStorage.setItem("currentUser", JSON.stringify(user))

    return paymentMethod
  },

  deletePaymentMethod: async (id: string): Promise<void> => {
    // Obtener el usuario autenticado
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) {
      throw new Error("No hay usuario autenticado")
    }

    const currentUser = JSON.parse(userJson)

    // Buscar el usuario en la base de datos
    const user = database.users.find((u) => u.id === currentUser.id)
    if (!user || !user.paymentMethods) {
      throw new Error("Usuario o método de pago no encontrado")
    }

    // Buscar el método de pago
    const paymentMethodIndex = user.paymentMethods.findIndex((pm) => pm.id === id)
    if (paymentMethodIndex === -1) {
      throw new Error("Método de pago no encontrado")
    }

    const isDefault = user.paymentMethods[paymentMethodIndex].isDefault

    // Eliminar el método de pago
    user.paymentMethods.splice(paymentMethodIndex, 1)

    // Si era el método predeterminado y hay otros métodos, establecer el primero como predeterminado
    if (isDefault && user.paymentMethods.length > 0) {
      user.paymentMethods[0].isDefault = true
    }

    // Actualizar el usuario en localStorage
    localStorage.setItem("currentUser", JSON.stringify(user))
  },

  // Conductores
  getDrivers: async (): Promise<User[]> => {
    // Obtener todos los usuarios que tienen rol de conductor
    const drivers = database.users
      .filter((user) => user.uniRideRole.includes("driver"))
      .map((user) => {
        // Eliminar la contraseña
        const { password: _, ...driverWithoutPassword } = user
        return driverWithoutPassword as User
      })

    return drivers
  },

  getDriverDetails: async (driverId: string): Promise<User> => {
    // Buscar el conductor
    const driver = database.users.find((user) => user.id === driverId)
    if (!driver) {
      throw new Error("Conductor no encontrado")
    }

    // Eliminar la contraseña
    const { password: _, ...driverWithoutPassword } = driver
    return driverWithoutPassword as User
  },

  addReview: async (driverId: string, rating: number, comment: string): Promise<Review> => {
    // Obtener el usuario autenticado
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) {
      throw new Error("No hay usuario autenticado")
    }

    const currentUser = JSON.parse(userJson)

    // Buscar el conductor
    const driver = database.users.find((user) => user.id === driverId)
    if (!driver) {
      throw new Error("Conductor no encontrado")
    }

    // Inicializar el array de reviews si no existe
    if (!driver.reviews) {
      driver.reviews = []
    }

    // Crear una nueva review
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      reviewerId: currentUser.id,
      reviewerName: `${currentUser.firstName} ${currentUser.lastName}`,
      rating,
      comment,
      date: new Date().toISOString().split("T")[0],
    }

    // Agregar la nueva review
    driver.reviews.push(newReview)

    // Actualizar la calificación promedio
    driver.rating = driver.reviews.reduce((sum, review) => sum + review.rating, 0) / driver.reviews.length

    // Crear notificación para el conductor
    const notification: Notification = {
      id: `notif-${Date.now()}-${driver.id}`,
      userId: driver.id,
      title: "Nueva opinión",
      message: `${currentUser.firstName} ${currentUser.lastName} ha dejado una opinión sobre ti.`,
      type: "info",
      read: false,
      date: new Date().toISOString(),
    }

    if (!driver.notifications) {
      driver.notifications = []
    }

    driver.notifications.push(notification)

    return newReview
  },

  // Mis viajes
  getMyRides: async (): Promise<Ride[]> => {
    // Obtener el usuario autenticado
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) {
      throw new Error("No hay usuario autenticado")
    }

    const currentUser = JSON.parse(userJson)

    // Filtrar viajes donde el usuario es conductor o pasajero
    const myRides = database.rides
      .filter((ride) => ride.driverId === currentUser.id || ride.passengers.some((p) => p.id === currentUser.id))
      .map((ride) => ({
        ...ride,
        isDriver: ride.driverId === currentUser.id,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return myRides
  },

  // Notificaciones
  getNotifications: async (): Promise<Notification[]> => {
    // Obtener el usuario autenticado
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) {
      throw new Error("No hay usuario autenticado")
    }

    const currentUser = JSON.parse(userJson)

    // Buscar el usuario en la base de datos
    const user = database.users.find((u) => u.id === currentUser.id)
    if (!user || !user.notifications) {
      return []
    }

    return user.notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },

  markNotificationAsRead: async (notificationId: string): Promise<void> => {
    // Obtener el usuario autenticado
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) {
      throw new Error("No hay usuario autenticado")
    }

    const currentUser = JSON.parse(userJson)

    // Buscar el usuario en la base de datos
    const user = database.users.find((u) => u.id === currentUser.id)
    if (!user || !user.notifications) {
      throw new Error("Usuario o notificaciones no encontradas")
    }

    // Buscar la notificación
    const notification = user.notifications.find((n) => n.id === notificationId)
    if (!notification) {
      throw new Error("Notificación no encontrada")
    }

    // Marcar como leída
    notification.read = true

    // Actualizar el usuario en localStorage
    localStorage.setItem("currentUser", JSON.stringify(user))
  },

  markAllNotificationsAsRead: async (): Promise<void> => {
    // Obtener el usuario autenticado
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) {
      throw new Error("No hay usuario autenticado")
    }

    const currentUser = JSON.parse(userJson)

    // Buscar el usuario en la base de datos
    const user = database.users.find((u) => u.id === currentUser.id)
    if (!user || !user.notifications) {
      return
    }

    // Marcar todas como leídas
    user.notifications.forEach((notification) => {
      notification.read = true
    })

    // Actualizar el usuario en localStorage
    localStorage.setItem("currentUser", JSON.stringify(user))
  },

  // Administración de usuarios (solo para administradores)
  getAllUsers: async (): Promise<User[]> => {
    // Obtener el usuario autenticado
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) {
      throw new Error("No hay usuario autenticado")
    }

    const currentUser = JSON.parse(userJson)

    // Verificar si el usuario es administrador
    if (!currentUser.institutionalRole.includes("admin")) {
      throw new Error("No tienes permisos para realizar esta acción")
    }

    // Devolver todos los usuarios sin contraseñas
    return database.users.map((user) => {
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword as User
    })
  },

  createUser: async (userData: Omit<User, "id" | "createdAt" | "createdBy">): Promise<User> => {
    // Obtener el usuario autenticado
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) {
      throw new Error("No hay usuario autenticado")
    }

    const currentUser = JSON.parse(userJson)

    // Verificar si el usuario es administrador
    if (!currentUser.institutionalRole.includes("admin")) {
      throw new Error("No tienes permisos para realizar esta acción")
    }

    // Verificar si ya existe un usuario con el mismo legajo o DNI
    const existingUser = database.users.find((u) => u.legajo === userData.legajo || u.dni === userData.dni)

    if (existingUser) {
      throw new Error("Ya existe un usuario con el mismo legajo o DNI")
    }

    // Crear un nuevo usuario
    const newUser: User = {
      id: `user-${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString().split("T")[0],
      createdBy: currentUser.id,
    }

    // Agregar el nuevo usuario a la base de datos
    database.users.push(newUser)

    // Devolver el usuario sin la contraseña
    const { password: _, ...userWithoutPassword } = newUser
    return userWithoutPassword as User
  },

  updateUser: async (userId: string, updates: Partial<User>): Promise<User> => {
    // Obtener el usuario autenticado
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) {
      throw new Error("No hay usuario autenticado")
    }

    const currentUser = JSON.parse(userJson)

    // Verificar si el usuario es administrador
    if (!currentUser.institutionalRole.includes("admin")) {
      throw new Error("No tienes permisos para realizar esta acción")
    }

    // Buscar el usuario a actualizar
    const userIndex = database.users.findIndex((u) => u.id === userId)
    if (userIndex === -1) {
      throw new Error("Usuario no encontrado")
    }

    // Si se está actualizando legajo o DNI, verificar que no exista otro usuario con esos datos
    if (updates.legajo || updates.dni) {
      const existingUser = database.users.find(
        (u) =>
          u.id !== userId &&
          ((updates.legajo && u.legajo === updates.legajo) || (updates.dni && u.dni === updates.dni)),
      )

      if (existingUser) {
        throw new Error("Ya existe un usuario con el mismo legajo o DNI")
      }
    }

    // Actualizar el usuario
    const updatedUser = {
      ...database.users[userIndex],
      ...updates,
    }

    database.users[userIndex] = updatedUser

    // Devolver el usuario sin la contraseña
    const { password: _, ...userWithoutPassword } = updatedUser
    return userWithoutPassword as User
  },

  deleteUser: async (userId: string): Promise<void> => {
    // Obtener el usuario autenticado
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) {
      throw new Error("No hay usuario autenticado")
    }

    const currentUser = JSON.parse(userJson)

    // Verificar si el usuario es administrador
    if (!currentUser.institutionalRole.includes("admin")) {
      throw new Error("No tienes permisos para realizar esta acción")
    }

    // No permitir eliminar al propio administrador
    if (userId === currentUser.id) {
      throw new Error("No puedes eliminar tu propio usuario")
    }

    // Buscar el usuario a eliminar
    const userIndex = database.users.findIndex((u) => u.id === userId)
    if (userIndex === -1) {
      throw new Error("Usuario no encontrado")
    }

    // Eliminar el usuario
    database.users.splice(userIndex, 1)

    // También eliminar referencias en viajes
    database.rides = database.rides.filter((ride) => ride.driverId !== userId)

    // Y eliminar al usuario como pasajero de otros viajes
    database.rides.forEach((ride) => {
      ride.passengers = ride.passengers.filter((p) => p.id !== userId)
    })
  },
}
