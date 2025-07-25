"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LogOut, Moon, Sun, Menu, X, Search } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"

interface HeaderProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
  onGlobalSearch?: (query: string) => void
}

export function Header({ activeTab, onTabChange, onGlobalSearch }: HeaderProps) {
  const { logout, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "categories", label: "Categories" },
    { id: "items", label: "Items" },
    { id: "users", label: "Users" },
    { id: "customers", label: "Customers" },
    { id: "orders", label: "Orders" },
  ]

  const handleTabClick = (tabId: string) => {
    onTabChange?.(tabId)
    setMobileMenuOpen(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onGlobalSearch?.(searchQuery)
  }

  return (
    <header className="bg-background border-b shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Sales Management</h1>
            {user && (
              <p className="hidden sm:block text-sm text-muted-foreground ml-4">
                Welcome, {user.fullName} ({user.role})
              </p>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                size="sm"
                onClick={() => handleTabClick(item.id)}
                className="text-sm"
              >
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center space-x-2">
            {/* Global Search */}
            {showSearch ? (
              <form onSubmit={handleSearch} className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Search everything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                  autoFocus
                />
                <Button type="submit" size="sm" variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowSearch(false)
                    setSearchQuery("")
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <Button onClick={() => setShowSearch(true)} variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            )}

            <Button onClick={toggleTheme} variant="outline" size="sm">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button onClick={logout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center space-x-2 sm:hidden">
            <Button onClick={() => setShowSearch(!showSearch)} variant="outline" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            <Button onClick={toggleTheme} variant="outline" size="sm">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Menu</h2>
                    <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {user && (
                    <div className="mb-6 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.role}</p>
                    </div>
                  )}

                  <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                      <Button
                        key={item.id}
                        variant={activeTab === item.id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleTabClick(item.id)}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </nav>

                  <div className="mt-auto pt-4 border-t">
                    <Button onClick={logout} variant="outline" className="w-full bg-transparent">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Tablet Menu */}
          <div className="hidden sm:flex lg:hidden items-center space-x-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="h-4 w-4 mr-2" />
                  Menu
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Navigation</h2>
                  <nav className="grid grid-cols-2 gap-2">
                    {navItems.map((item) => (
                      <Button
                        key={item.id}
                        variant={activeTab === item.id ? "default" : "outline"}
                        onClick={() => handleTabClick(item.id)}
                        className="justify-start"
                      >
                        {item.label}
                      </Button>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showSearch && (
          <div className="pb-4 sm:hidden">
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Search everything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm" variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </header>
  )
}
