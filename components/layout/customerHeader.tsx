"use client"

import { useCustomerAuth } from "@/contexts/CustomerContext"
import { useTheme } from "@/contexts/ThemeContext"
import { LogOut, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CustomerHeaderProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function CustomerHeader({ activeTab, onTabChange }: CustomerHeaderProps) {
  const { customer, logout } = useCustomerAuth()
  const { theme, toggleTheme } = useTheme()

  if (!customer) return null

  const navLinks = [
    { label: "Dashboard", value: "dashboard" },
    { label: "Request Items", value: "request" },
    { label: "My Requests", value: "requests" },
    { label: "Responses", value: "responses" },
  ]

  return (
    <header className="bg-background border-b shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col lg:flex-row justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Welcome, {customer.name}</h1>
          <p className="text-sm text-muted-foreground">{customer.userName}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {navLinks.map((link) => (
            <Button
              key={link.value}
              variant={activeTab === link.value ? "default" : "outline"}
              size="sm"
              onClick={() => onTabChange(link.value)}
            >
              {link.label}
            </Button>
          ))}

          <Button onClick={toggleTheme} variant="outline" size="icon">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          <Button onClick={logout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
