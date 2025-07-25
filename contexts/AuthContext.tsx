"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { AuthContextType, User } from "@/types"
import { authService } from "@/services/authService"
import { useToast } from "@/hooks/use-toast"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login(username, password)

      setToken(response.token)
      setUser(response.user)
      setIsAuthenticated(true)
      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))

      toast({ title: "Success", description: "Logged in successfully" })
      return true
    } catch (error) {
      toast({ title: "Error", description: "Login failed", variant: "destructive" })
      return false
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setToken("")
    setUser(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  useEffect(() => {
    const savedToken = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setToken(savedToken)
        setUser(parsedUser)
        setIsAuthenticated(true)
      } catch (error) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }

    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    )
  }

  return <AuthContext.Provider value={{ isAuthenticated, token, user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
