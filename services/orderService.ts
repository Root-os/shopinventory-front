import { apiService } from "./api"
import type { Order, OrderItem } from "@/types"

interface CreateOrderResponse {
  order: CreateOrderResponse
  id: number
  customerName?: string
  customerPhone?: string
  customerId?: number
  items: OrderItem[]
  paid: number
  paymentType: "Cash" | "Credit"
  status: "Pending" | "Confirmed" | "Dispatched"
  totalPrice: number
  createdAt: string
  updatedAt: string
}

class OrderService {
  async getOrders(token: string): Promise<Order[]> {
    if (!token) {
      throw new Error("Authentication token is required")
    }

    const response = await apiService.get<any[]>("/api/orders", token)
    // Transform API response to match frontend expectations
    return response.map((order: any) => ({
      ...order,
      totalPrice: Number.parseFloat(order.totalPrice || order.total || 0), // Handle both field names
      customerName: order.customerName || null,
      customerPhone: order.customerPhone || null,
    })) as Order[]
  }

  async createOrder(
    orderData: {
      isNewCustomer: boolean
      customerName?: string
      customerPhone?: string
      customerId?: number
      items: OrderItem[]
      paid: number
      paymentType: "Cash" | "Credit" // Restrict to valid ENUM values
      status: "Pending" | "Confirmed" | "Dispatched"
    },
    token: string,
  ): Promise<CreateOrderResponse> {
    if (!token) {
      throw new Error("Authentication token is required")
    }

    // Debug: Log the original data
    console.log("🔍 Original order data:", orderData)

    // Validate items before processing
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error("Order must contain at least one item")
    }

    // Validate each item
    for (const item of orderData.items) {
      if (!item.itemId || item.itemId === 0) {
        throw new Error("Each item must have a valid itemId")
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new Error("Each item must have a valid quantity")
      }
      if (!item.price || item.price <= 0) {
        throw new Error("Each item must have a valid price")
      }
      if (!item.unit || item.unit.trim() === "") {
        throw new Error("Each item must have a unit")
      }
    }

    // Ensure all numeric fields are properly converted and match backend expectations
    const processedOrderData = {
      isNewCustomer: Boolean(orderData.isNewCustomer),
      ...(orderData.isNewCustomer
        ? {
            customerName: String(orderData.customerName || "").trim(),
            customerPhone: String(orderData.customerPhone || "").trim(),
          }
        : {
            customerId: Number(orderData.customerId),
          }),
      items: orderData.items.map((item) => {
        const processedItem = {
          itemId: Number(item.itemId),
          quantity: Number(item.quantity),
          price: Number(item.price),
          unit: String(item.unit).trim(),
        }
        console.log("🔍 Processed item:", processedItem)
        return processedItem
      }),
      paid: Number(orderData.paid),
      paymentType: String(orderData.paymentType),
      status: String(orderData.status) as "Pending" | "Confirmed" | "Dispatched",
    }

    console.log("🚀 Sending processed order data:", JSON.stringify(processedOrderData, null, 2))

    try {
      const result = await apiService.post<CreateOrderResponse>("/api/orders", processedOrderData, token)
      console.log("✅ Order created successfully:", result)
      return result
    } catch (error) {
      console.error("❌ Order creation failed:", error)
      throw error
    }
  }

  async updateOrder(
    id: number,
    orderData: {
      isNewCustomer: boolean
      customerName?: string
      customerPhone?: string
      customerId?: number
      items: OrderItem[]
      paid: number
      paymentType: "Cash" | "Credit" // Restrict to valid ENUM values
      status: "Pending" | "Confirmed" | "Dispatched"
    },
    token: string,
  ): Promise<any> {
    if (!token) {
      throw new Error("Authentication token is required")
    }

    // Ensure all numeric fields are properly converted
    const processedOrderData = {
      isNewCustomer: Boolean(orderData.isNewCustomer),
      ...(orderData.isNewCustomer
        ? {
            customerName: String(orderData.customerName || "").trim(),
            customerPhone: String(orderData.customerPhone || "").trim(),
          }
        : {
            customerId: Number(orderData.customerId),
          }),
      items: orderData.items.map((item) => ({
        itemId: Number(item.itemId),
        quantity: Number(item.quantity),
        price: Number(item.price),
        unit: String(item.unit).trim(),
      })),
      paid: Number(orderData.paid),
      paymentType: String(orderData.paymentType),
      status: String(orderData.status) as "Pending" | "Confirmed" | "Dispatched",
    }

    return apiService.put(`/api/orders/${id}`, processedOrderData, token)
  }

  async updateOrderStatus(id: number, status: "Pending" | "Confirmed" | "Dispatched", token: string): Promise<any> {
    if (!token) {
      throw new Error("Authentication token is required")
    }
    return apiService.put(`/api/orders/${id}`, { status }, token)
  }

  async deleteOrder(id: number, token: string): Promise<any> {
    if (!token) {
      throw new Error("Authentication token is required")
    }
    return apiService.delete(`/api/orders/${id}`, token)
  }

  async updateStatusAsStorekeeper(id: number, status: "Pending" | "Confirmed" | "Dispatched", token: string): Promise<any> {
  if (!token) {
    throw new Error("Authentication token is required")
  }
  return apiService.patch(`/api/orders/${id}/status`, { status }, token)
}


}

export const orderService = new OrderService()
