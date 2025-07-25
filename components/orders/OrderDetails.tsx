"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { Order } from "@/types"

interface OrderDetailsProps {
  order: Order
  onClose: () => void
}

export function OrderDetails({ order, onClose }: OrderDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "dispatched":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const balance = order.paid - order.totalPrice

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Order Details - #{order.id}</CardTitle>
          <Button onClick={onClose} variant="outline" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Information */}
        <div>
          <h3 className="font-semibold mb-2">Customer Information</h3>
          <div className="bg-muted p-3 rounded">
            <p>
              <strong>Name:</strong> {order.customerName || "Unknown Customer"}
            </p>
            <p>
              <strong>Phone:</strong> {order.customerPhone || "No Phone"}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h3 className="font-semibold mb-2">Order Items</h3>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-medium">{item.itemName || `Item #${item.itemId}`}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} {item.unit} × {item.price.toFixed(2)} ETB
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{(item.quantity * item.price).toFixed(2)} ETB</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <h3 className="font-semibold mb-2">Order Summary</h3>
          <div className="bg-muted p-4 rounded space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{order.totalPrice.toFixed(2)} ETB</span>
            </div>
            <div className="flex justify-between">
              <span>Amount Paid:</span>
              <span>{order.paid.toFixed(2)} ETB</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Balance:</span>
              <span className={balance >= 0 ? "text-green-600" : "text-red-600"}>{balance.toFixed(2)} ETB</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span>{order.paymentType}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
            </div>
          </div>
        </div>

        {/* Order Information */}
        <div>
          <h3 className="font-semibold mb-2">Order Information</h3>
          <div className="bg-muted p-3 rounded">
            <p>
              <strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Updated:</strong> {new Date(order.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
