"use client"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import { apiService } from "@/services"
import type { Notification } from "@/lib/types"
import { Home, User, LogOut, Car, Search, List, Users, BarChart2, CreditCard, Plus, Bell, X } from "lucide-react"

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { setOpen, toggleSidebar } = useSidebar()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        try {
          const notifs = await apiService.getNotifications()
          setNotifications(notifs)
          setUnreadCount(notifs.filter((n) => !n.read).length)
        } catch (error) {
          console.error("Error fetching notifications:", error)
        }
      }
    }

    fetchNotifications()
    // Actualizar notificaciones cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000)

    return () => clearInterval(interval)
  }, [user])

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.read) {
        await apiService.markNotificationAsRead(notification.id)
        setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
        setUnreadCount((prev) => prev - 1)
      }

      // Redirigir si hay un viaje relacionado
      if (notification.relatedRideId) {
        window.location.href = "/my-rides"
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Función para cerrar el sidebar al hacer clic en una opción
  const handleMenuClick = () => {
    setOpen(false)
  }

  // Función para cerrar el sidebar
  const handleCloseSidebar = () => {
    setOpen(false)
  }

  // Si no hay usuario autenticado, no mostramos el sidebar
  if (
    !user &&
    pathname !== "/dashboard" &&
    !pathname.includes("/publish-ride") &&
    !pathname.includes("/available-rides") &&
    !pathname.includes("/profile") &&
    !pathname.includes("/payment-methods") &&
    !pathname.includes("/drivers") &&
    !pathname.includes("/my-rides") &&
    !pathname.includes("/statistics") &&
    !pathname.includes("/admin/dashboard")
  ) {
    return null
  }

  // Si es un administrador y está en el dashboard de admin, mostrar sidebar simplificado
  if (user?.role === "admin" && pathname.includes("/admin/dashboard")) {
    return (
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
              <Car className="h-6 w-6 text-amber-500" />
              <span className="font-bold text-lg">UniRide Admin</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseSidebar}
              className="h-8 w-8 hover:bg-gray-100"
              title="Cerrar sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.includes("/admin/dashboard")} onClick={handleMenuClick}>
                <Link href="/admin/dashboard">
                  <Home className="h-4 w-4" />
                  <span>Panel de Administración</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={logout}>
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    )
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6 text-amber-500" />
            <span className="font-bold text-lg">UniRide</span>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-8 w-8 z-50">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-amber-500 text-white text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 z-[100]" sideOffset={5} side="right">
                <div className="flex justify-between items-center p-2 border-b">
                  <h4 className="font-medium">Notificaciones</h4>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                      Marcar todas como leídas
                    </Button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No tienes notificaciones</div>
                  ) : (
                    notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={`p-3 cursor-pointer ${!notification.read ? "bg-amber-50" : ""}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="w-full">
                          <div className="flex justify-between items-start">
                            <p className="font-medium">{notification.title}</p>
                            <span className="text-xs text-gray-500">
                              {new Date(notification.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseSidebar}
              className="h-8 w-8 hover:bg-gray-100"
              title="Cerrar sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/dashboard"} onClick={handleMenuClick}>
              <Link href="/dashboard">
                <Home className="h-4 w-4" />
                <span>Inicio</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/publish-ride"} onClick={handleMenuClick}>
              <Link href="/publish-ride">
                <Plus className="h-4 w-4" />
                <span>Publicar Viaje</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/available-rides"} onClick={handleMenuClick}>
              <Link href="/available-rides">
                <Search className="h-4 w-4" />
                <span>Buscar Viajes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/my-rides"} onClick={handleMenuClick}>
              <Link href="/my-rides">
                <List className="h-4 w-4" />
                <span>Mis Viajes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.includes("/drivers")} onClick={handleMenuClick}>
              <Link href="/drivers">
                <Users className="h-4 w-4" />
                <span>Conductores</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/statistics"} onClick={handleMenuClick}>
              <Link href="/statistics">
                <BarChart2 className="h-4 w-4" />
                <span>Estadísticas</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/payment-methods"} onClick={handleMenuClick}>
              <Link href="/payment-methods">
                <CreditCard className="h-4 w-4" />
                <span>Métodos de Pago</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/profile"} onClick={handleMenuClick}>
              <Link href="/profile">
                <User className="h-4 w-4" />
                <span>Mi Perfil</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout}>
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
