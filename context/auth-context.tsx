"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiService } from "@/services"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  login: (legajo: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay un usuario autenticado al cargar la página
    const checkAuth = async () => {
      try {
        const userData = await apiService.getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error("No authenticated user:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (legajo: string, password: string) => {
    setIsLoading(true)
    try {
      const userData = await apiService.login(legajo, password)
      setUser(userData)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    apiService.logout()
    setUser(null)
    window.location.href = "/"
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
