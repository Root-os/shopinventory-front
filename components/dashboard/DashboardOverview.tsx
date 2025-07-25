"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Package, ShoppingCart, UserCheck, AlertTriangle, DollarSign, Calendar, BarChart3 } from "lucide-react"
import type { Category, Item, User, Customer, Order } from "@/types"

interface DashboardOverviewProps {
  categories: Category[]
  items: Item[]
  users: User[]
  customers: Customer[]
  orders: Order[]
}

export function DashboardOverview({ categories, items, users, customers, orders }: DashboardOverviewProps) {
  const lowStockItems = items.filter((item) => item.quantity <= item.minStockLevel)
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0)
  const pendingOrders = orders.filter((order) => order.status === "Pending").length
  const confirmedOrders = orders.filter((order) => order.status === "Confirmed").length
  const dispatchedOrders = orders.filter((order) => order.status === "Dispatched").length
  const totalInventoryValue = items.reduce((sum, item) => sum + Number.parseFloat(item.price) * item.quantity, 0)

  // Generate monthly revenue data based on actual orders
  const generateMonthlyRevenue = () => {
    if (orders.length === 0) return []

    // Group orders by month
    const monthlyData: { [key: string]: { revenue: number; orders: number; month: string } } = {}

    orders.forEach((order) => {
      const date = new Date(order.createdAt)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      const monthName = date.toLocaleDateString("en-US", { month: "short" })

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          revenue: 0,
          orders: 0,
        }
      }

      monthlyData[monthKey].revenue += order.totalPrice
      monthlyData[monthKey].orders += 1
    })

    // Convert to array and sort by date
    return Object.entries(monthlyData)
      .map(([key, data]) => ({
        ...data,
        sortKey: key,
      }))
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-6) // Show last 6 months with data
  }

  const monthlyRevenue = generateMonthlyRevenue()
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1)

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalRevenue.toFixed(2)} ETB</div>
            <p className="text-xs text-muted-foreground mt-1">From {orders.length} orders</p>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-green-100">
              <div className="h-full w-3/4 bg-green-500"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {confirmedOrders} confirmed, {pendingOrders} pending, {dispatchedOrders} dispatched
            </p>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-100">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${orders.length > 0 ? (confirmedOrders / orders.length) * 100 : 0}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalInventoryValue.toFixed(2)} ETB</div>
            <p className="text-xs text-muted-foreground mt-1">{items.length} items in stock</p>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-100">
              <div className="h-full w-2/3 bg-purple-500"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <UserCheck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{customers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{categories.length} categories available</p>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-100">
              <div className="h-full w-4/5 bg-orange-500"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart and Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Monthly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyRevenue.length > 0 ? (
                monthlyRevenue.map((data, index) => (
                  <div key={`${data.month}-${index}`} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{data.month}</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{data.revenue.toFixed(0)} ETB</div>
                        <div className="text-xs text-muted-foreground">{data.orders} orders</div>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${(data.revenue / maxRevenue) * 100}%`,
                          minWidth: "8px",
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No revenue data yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Create some orders to see monthly performance</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Order Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Confirmed Orders</span>
                <Badge className="bg-green-100 text-green-800">{confirmedOrders}</Badge>
              </div>
              <Progress value={orders.length > 0 ? (confirmedOrders / orders.length) * 100 : 0} className="h-2" />

              <div className="flex items-center justify-between">
                <span className="text-sm">Pending Orders</span>
                <Badge className="bg-yellow-100 text-yellow-800">{pendingOrders}</Badge>
              </div>
              <Progress value={orders.length > 0 ? (pendingOrders / orders.length) * 100 : 0} className="h-2" />

              <div className="flex items-center justify-between">
                <span className="text-sm">Dispatched Orders</span>
                <Badge className="bg-blue-100 text-blue-800">{dispatchedOrders}</Badge>
              </div>
              <Progress value={orders.length > 0 ? (dispatchedOrders / orders.length) * 100 : 0} className="h-2" />

              {orders.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No orders yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              Low Stock Alert ({lowStockItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.length > 0 ? (
                lowStockItems.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                  >
                    <div>
                      <span className="font-medium text-red-900 dark:text-red-100">{item.name}</span>
                      <p className="text-xs text-red-700 dark:text-red-300">
                        Min: {item.minStockLevel} {item.unit}
                      </p>
                    </div>
                    <Badge variant="destructive" className="animate-pulse">
                      {item.quantity} {item.unit}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-green-500 mb-2" />
                  <p className="text-green-600 font-medium">All items are well stocked!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Recent Orders ({orders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{order.customerName || "Unknown Customer"}</span>
                      <Badge variant="outline" className="text-xs">
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.customerPhone || "No Phone"}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-green-600">{order.totalPrice.toFixed(2)} ETB</span>
                    <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No orders yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
