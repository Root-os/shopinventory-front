// components/tabs/OrdersTab.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { usePagination } from "@/hooks/usePagination"
import { Plus } from "lucide-react"
import { OrderForm } from "@/components/orders/OrderForm"
import { OrderList } from "@/components/orders/OrderList"
import { OrderDetailsModal } from "@/components/orders/OrderDetailsModal"
import type { Order, Item, Customer } from "@/types"
import { orderService } from "@/services/orderService"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { preparePrintableOrder, openReceiptPreview } from "@/utils/printUtils"

interface OrdersTabProps {
  orders: Order[]
  items: Item[]
  customers: Customer[]
  onRefresh: () => void
  token: string
}

interface CreateOrderResponse {
  id: number
  customerName?: string | null
  customerPhone?: string | null
  customerId?: number
  items: any[]
  paid: number
  paymentType: string
  status: string
  totalPrice: number
  createdAt: string
  updatedAt: string
  createdBy?: string
   Customer?: {
    name: string
    phone: string
  }
}

export function OrdersTab({ orders, items, customers, onRefresh, token }: OrdersTabProps) {
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const { currentPage, totalPages, paginatedData, goToPage, goToNextPage, goToPreviousPage } = usePagination(
    orders,
    10
  )

  const handleCreateOrder = async (orderData: any) => {
    try {
      console.log("🔍 OrdersTab: Creating order with token:", token ? "✅ Present" : "❌ Missing")

      if (!token) {
        throw new Error("Authentication token is missing")
      }

      const response = await orderService.createOrder(orderData, token)
     const createdOrder: CreateOrderResponse = response.order

      toast({ title: "Success", description: "Order created successfully" })

      // Refresh data first
      await onRefresh()
      // Find the created order from the refreshed data or create a fallback
    const newOrder: Order = orders.find((order) => order.id === createdOrder.id) || {
      id: createdOrder.id || Date.now(),
      customerId: orderData.isNewCustomer ? undefined : createdOrder.customerId,
      customerName: orderData.isNewCustomer
        ? orderData.customerName
        : createdOrder.customerName || createdOrder.Customer?.name || null,
        customerPhone: orderData.isNewCustomer
        ? orderData.customerPhone
        : createdOrder.customerPhone || createdOrder.Customer?.phone || null,
        items: orderData.items.map((item: any) => ({
        itemId: Number(item.itemId) || 0,
        quantity: Number(item.quantity) || 0,
        price: Number(item.price) || 0,
        unit: String(item.unit || ""),
        itemName: items.find((i) => i.id === Number(item.itemId))?.name || "",
        })),
        paid: Number(orderData.paid) || 0,
        paymentType: orderData.paymentType as "Cash" | "Credit" || "Cash",
        status: orderData.status as "Pending" | "Confirmed" | "Dispatched" || "Pending",
        totalPrice: Number(
          orderData.items.reduce((sum: number, item: any) => sum + item.quantity * item.price, 0)
        ) || 0,
        createdAt: createdOrder.createdAt || new Date().toISOString(),
        updatedAt: createdOrder.updatedAt || new Date().toISOString(),
        createdBy: user?.fullName || createdOrder.createdBy || "Unknown User",
        Customer: createdOrder.Customer || undefined, // 👈 Include this if your Order type allows it
      }
      // Auto-print receipt after successful creation
      if (user) {
        try {
         const printableOrder = preparePrintableOrder(newOrder, items, user.fullName)
          openReceiptPreview(printableOrder)
        } catch (printError) {
          console.error("❌ Auto-print failed:", printError)
          toast({
            title: "Print Warning",
            description: "Order created but receipt printing failed. You can print from the order view.",
            variant: "destructive",
          })
        }
      }
      // Redirect to view the created order
      setShowOrderForm(false)
      setViewingOrder(newOrder)
      setIsViewModalOpen(true)
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
    if (!token || !user?.role) {
      throw new Error("Authentication token or user role is missing")
    }

    if (user.role === "admin") {
      await orderService.updateOrderStatus(orderId, status, token)
    } else {
      await orderService.updateStatusAsStorekeeper(orderId, status, token)
    }

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

  const handleViewOrder = (order: Order) => {
    setViewingOrder({
      ...order,
      items: order.items && Array.isArray(order.items)
        ? order.items.map((item) => ({
          ...item,
          itemId: Number(item.itemId) || 0,
          quantity: Number(item.quantity) || 0,
          price: Number(item.price) || 0,
          unit: String(item.unit || ""),
          itemName: items.find((i) => i.id === Number(item.itemId))?.name || item.itemName || "",
        }))
        : [],
    })
    setIsViewModalOpen(true)
  }

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false)
    setViewingOrder(null)
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
        {user?.role === "admin" && (
          <Button onClick={() => setShowOrderForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        )}
      </div>

      <OrderList
        orders={paginatedData}
        items={items}
        onViewOrder={handleViewOrder}
        onEditOrder={user?.role === "admin" ? setEditingOrder : undefined}
        onUpdateStatus={handleUpdateStatus}
        onDeleteOrder={user?.role === "admin" ? handleDeleteOrder : undefined}
        canEdit={user?.role === "admin"}
        canDelete={user?.role === "admin"}
        canUpdateStatus={user?.role === "admin"}        
      />
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={goToPreviousPage}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => goToPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={goToNextPage}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <OrderDetailsModal order={viewingOrder} items={items} isOpen={isViewModalOpen} onClose={handleCloseViewModal} />
    </div>
  )
}