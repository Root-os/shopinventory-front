"use client"

import { useCustomerAuth } from "@/contexts/CustomerContext"
import { CustomerLoginForm } from "@/components/auth/CustomerLogin"
import { CustomerDashboard } from "@/components/dashboard/customerDashboard"

export default function CustomerPage() {
  const { isAuthenticated } = useCustomerAuth()

  // Remove loading state handling since isLoading is not available

  if (!isAuthenticated) {
    return <CustomerLoginForm />
  }

  return <CustomerDashboard />
}
