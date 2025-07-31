// /components/dashboard/CustomerDashboard.tsx
"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CustomerHeader } from "@/components/layout/customerHeader"
import CustomerRequestForm from "@/components/customer/RequestForm"
import CustomerRequestsList from "@/components/customer/MyRequest"
// import CustomerResponses from "@/components/customer/CustomerResponses"

export function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="min-h-screen bg-background">
      <CustomerHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="hidden">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="request">Request Items</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="responses">Responses</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <p className="text-xl font-semibold">Welcome to your customer dashboard!</p>
          </TabsContent>

          <TabsContent value="request">
            <CustomerRequestForm />
          </TabsContent>

          <TabsContent value="requests">
            <CustomerRequestsList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
