"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

type Customer = {
  id: number
  name: string
  userName: string
  phone: string
}

type CustomerAuthContextType = {
  isAuthenticated: boolean
  token: string
  customer: Customer | null
  login: (userName: string, password: string) => Promise<boolean>
  logout: () => void
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined)

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState("")
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const API_BASE = process.env.NEXT_PUBLIC_API_URL 

  const login = async (userName: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/customers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, password }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Login failed")

      setToken(data.token)
      setCustomer(data.customer)
      setIsAuthenticated(true)

      localStorage.setItem("customer_token", data.token)
      localStorage.setItem("customer", JSON.stringify(data.customer))

      toast({ title: "Success", description: "Logged in successfully" })
      return true
    } catch (error) {
      toast({ title: "Login failed", description: "Check your credentials", variant: "destructive" })
      return false
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setToken("")
    setCustomer(null)
    localStorage.removeItem("customer_token")
    localStorage.removeItem("customer")
  }

  useEffect(() => {
    const savedToken = localStorage.getItem("customer_token")
    const savedCustomer = localStorage.getItem("customer")
    if (savedToken && savedCustomer) {
      try {
        setToken(savedToken)
        setCustomer(JSON.parse(savedCustomer))
        setIsAuthenticated(true)
      } catch {
        localStorage.removeItem("customer_token")
        localStorage.removeItem("customer")
      }
    }
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <CustomerAuthContext.Provider value={{ isAuthenticated, token, customer, login, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext)
  if (!context) throw new Error("useCustomerAuth must be used inside CustomerAuthProvider")
  return context
}
