"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { OrderForm } from "@/components/orders/OrderForm"
import { OrderList } from "@/components/orders/OrderList"
import { OrderDetails } from "@/components/orders/OrderDetails"
import type { Order, Item, Customer } from "@/types"
import { orderService } from "@/services/orderService"
import { useToast } from "@/hooks/use-toast"

interface OrdersTabProps {
  orders: Order[]
  items: Item[]
  customers: Customer[]
  onRefresh: () => void
  token: string
}

export function OrdersTab({ orders, items, customers, onRefresh, token }: OrdersTabProps) {
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const { toast } = useToast()

  const handleCreateOrder = async (orderData: any) => {
    try {
      console.log("🔍 OrdersTab: Creating order with token:", token ? "✅ Present" : "❌ Missing")

      if (!token) {
        throw new Error("Authentication token is missing")
      }

      await orderService.createOrder(orderData, token)
      toast({ title: "Success", description: "Order created successfully" })
      setShowOrderForm(false)
      onRefresh()
    } catch (error: any) {
      console.error("❌ OrdersTab: Order creation failed:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create order",
        variant: "destructive",
      })
    }
  }

  const handleEditOrder = async (orderData: any) => {
    try {
      if (!token || !editingOrder) {
        throw new Error("Authentication token or order data is missing")
      }

      await orderService.updateOrder(editingOrder.id, orderData, token)
      toast({ title: "Success", description: "Order updated successfully" })
      setEditingOrder(null)
      onRefresh()
    } catch (error: any) {
      console.error("❌ OrdersTab: Order update failed:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update order",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStatus = async (orderId: number, status: "Pending" | "Confirmed" | "Dispatched") => {
    try {
      if (!token) {
        throw new Error("Authentication token is missing")
      }

      await orderService.updateOrderStatus(orderId, status, token)
      toast({ title: "Success", description: "Order status updated" })
      onRefresh()
    } catch (error: any) {
      console.error("❌ OrdersTab: Status update failed:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteOrder = async (orderId: number) => {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        if (!token) {
          throw new Error("Authentication token is missing")
        }

        await orderService.deleteOrder(orderId, token)
        toast({ title: "Success", description: "Order deleted successfully" })
        onRefresh()
      } catch (error: any) {
        console.error("❌ OrdersTab: Order deletion failed:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to delete order",
          variant: "destructive",
        })
      }
    }
  }

  if (showOrderForm) {
    return (
      <OrderForm
        items={items}
        customers={customers}
        onSubmit={handleCreateOrder}
        onCancel={() => setShowOrderForm(false)}
        isEditing={false}
      />
    )
  }

  if (editingOrder) {
    return (
      <OrderForm
        items={items}
        customers={customers}
        onSubmit={handleEditOrder}
        onCancel={() => setEditingOrder(null)}
        isEditing={true}
        initialOrder={editingOrder}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Orders Management</h2>
        <Button onClick={() => setShowOrderForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>
      </div>

      <OrderList
        orders={orders}
        onViewOrder={setSelectedOrder}
        onEditOrder={setEditingOrder}
        onUpdateStatus={handleUpdateStatus}
        onDeleteOrder={handleDeleteOrder}
      />

      {selectedOrder && <OrderDetails order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  )
}
