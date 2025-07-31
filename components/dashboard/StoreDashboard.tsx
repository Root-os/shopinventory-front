// components/dashboard/StorekeeperDashboard.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ShoppingCart, AlertTriangle, Calendar } from "lucide-react"
import type { Category, Item, User, Customer, Order } from "@/types"

interface StorekeeperDashboardProps {
  categories: Category[]
  items: Item[]
  users: User[]
  customers: Customer[]
  orders: Order[]
}

export function StorekeeperDashboard({ items, orders }: StorekeeperDashboardProps) {
  const lowStockItems = items.filter((item) => item.quantity <= item.minStockLevel)
  const confirmedOrders = orders.filter((order) => order.status === "Confirmed").length
  const pendingOrders = orders.filter((order) => order.status === "Pending").length
  const dispatchedOrders = orders.filter((order) => order.status === "Dispatched").length

  return (
    <div className="space-y-6">
      {/* Order Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* Low Stock Items */}
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
                  <AlertTriangle className="w-12 h-12 mx-auto text-green-500 mb-2" />
                  <p className="text-green-600 font-medium">All items are well stocked!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Recent Orders
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
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
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
  )
}
