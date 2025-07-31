"use client"

import { useCustomerAuth } from "@/contexts/CustomerContext"
import { CustomerLoginForm } from "@/components/auth/CustomerLogin"
import { CustomerDashboard } from "@/components/dashboard/customerDashboard"

export default function CustomerPage() {
  const { isAuthenticated, isLoading } = useCustomerAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <CustomerLoginForm />
  }

  return <CustomerDashboard />
}
