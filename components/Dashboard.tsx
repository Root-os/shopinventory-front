"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/layout/Header"
import { DashboardOverview } from "@/components/dashboard/DashboardOverview"
import { CategoriesTab } from "@/components/tabs/CategoriesTab"
import { ItemsTab } from "@/components/tabs/ItemsTab"
import { UsersTab } from "@/components/tabs/UsersTab"
import { CustomersTab } from "@/components/tabs/CustomersTab"
import { OrdersTab } from "@/components/tabs/OrdersTab"
import { categoryService } from "@/services/categoryService"
import { itemService } from "@/services/itemService"
import { customerService } from "@/services/customerService"
import { orderService } from "@/services/orderService"
import { authService } from "@/services/authService"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import type { Category, Item, User, Customer, Order } from "@/types"
import CustomerRequestsPage from "./tabs/CustomerRequest"
import OrdersReportPage from "./tabs/OrderReport"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      setLoading(true)
      console.log("🔍 Dashboard: Fetching data with token:", token ? "✅ Present" : "❌ Missing")

      if (!token) {
        throw new Error("Authentication token is missing")
      }

      const [categoriesData, itemsData, usersData, customersData, ordersData] = await Promise.all([
        categoryService.getCategories(),
        itemService.getItems(token),
        authService.getUsers(token),
        customerService.getCustomers(token),
        orderService.getOrders(token),
      ])

      setCategories(categoriesData)
      setItems(itemsData)
      setUsers(usersData)
      setCustomers(customersData)
      setOrders(ordersData)
    } catch (error: any) {
      console.error("❌ Dashboard: Data fetch failed:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchData()
    }
  }, [token])

  const handleGlobalSearch = (query: string) => {
    if (!query.trim()) return

    const searchLower = query.toLowerCase()

    // Search in categories
    const categoryMatch = categories.find((cat) => cat.name.toLowerCase().includes(searchLower))
    if (categoryMatch) {
      setActiveTab("categories")
      return
    }

    const customerReqMatch = categories.find((cat) => cat.name.toLowerCase().includes(searchLower))
    if (customerReqMatch) {
      setActiveTab("ordersreq")
      return
    }

    const orderReportMatch = categories.find((cat) => cat.name.toLowerCase().includes(searchLower))
    if (orderReportMatch) {
      setActiveTab("ordersreport")
      return
    }

    // Search in items
    const itemMatch = items.find((item) => item.name.toLowerCase().includes(searchLower))
    if (itemMatch) {
      setActiveTab("items")
      return
    }

    // Search in users
    const userMatch = users.find(
      (user) => user.fullName.toLowerCase().includes(searchLower) || user.username.toLowerCase().includes(searchLower),
    )
    if (userMatch) {
      setActiveTab("users")
      return
    }

    // Search in customers
    const customerMatch = customers.find(
      (customer) =>
        customer.name.toLowerCase().includes(searchLower) ||
        customer.userName.toLowerCase().includes(searchLower) ||
        customer.phone.includes(searchLower),
    )
    if (customerMatch) {
      setActiveTab("customers")
      return
    }

    // Search in orders - Add null checks for customerName and customerPhone
    const orderMatch = orders.find(
      (order) =>
        (order.customerName && order.customerName.toLowerCase().includes(searchLower)) ||
        (order.customerPhone && order.customerPhone.includes(searchLower)) ||
        order.id.toString().includes(searchLower),
    )
    if (orderMatch) {
      setActiveTab("orders")
      return
    }

    toast({ title: "No Results", description: `No results found for "${query}"` })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header activeTab={activeTab} onTabChange={setActiveTab} onGlobalSearch={handleGlobalSearch} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} onGlobalSearch={handleGlobalSearch} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="hidden">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="ordersreq">Request</TabsTrigger>
            <TabsTrigger value="ordersreport">Report</TabsTrigger>

          </TabsList>

          <TabsContent value="dashboard">
            <DashboardOverview
              categories={categories}
              items={items}
              users={users}
              customers={customers}
              orders={orders}
            />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesTab categories={categories} onRefresh={fetchData} />
          </TabsContent>

          <TabsContent value="items">
            <ItemsTab items={items} categories={categories} onRefresh={fetchData} />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab users={users} onRefresh={fetchData} />
          </TabsContent>

          <TabsContent value="customers">
            <CustomersTab customers={customers} onRefresh={fetchData} />
          </TabsContent>

          <TabsContent value="orders">
            {/* Pass token prop to OrdersTab */}
            <OrdersTab orders={orders} items={items} customers={customers} onRefresh={fetchData} token={token} />
          </TabsContent>
          <TabsContent value="ordersreq">
            {/* Pass token prop to OrdersTab */}
            <CustomerRequestsPage />
          </TabsContent>
          <TabsContent value="ordersreport">
            <OrdersReportPage token={token}/>
          </TabsContent>
          
        </Tabs>
      </main>
    </div>
  )
}
