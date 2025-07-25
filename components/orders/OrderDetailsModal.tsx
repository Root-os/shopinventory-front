"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Printer, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import type { Order, Item } from "@/types"
import { printReceipt, preparePrintableOrder } from "@/utils/printUtils"
import { useAuth } from "@/contexts/AuthContext"

interface OrderDetailsModalProps {
  order: Order | null
  items: Item[]
  isOpen: boolean
  onClose: () => void
}

export function OrderDetailsModal({ order, items, isOpen, onClose }: OrderDetailsModalProps) {
  const { user } = useAuth()
  const [zoomLevel, setZoomLevel] = useState(100)

  if (!order) return null

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200"
      case "dispatched":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getItemDetails = (itemId: number) => {
    return items.find((item) => item.id === itemId)
  }

  const balance = order.paid - order.totalPrice

  const handlePrint = () => {
    const printableOrder = preparePrintableOrder(order, items, order.createdBy || user?.fullName || "Unknown User")
    printReceipt(printableOrder)
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 10, 200))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 10, 50))
  }

  const handleResetZoom = () => {
    setZoomLevel(100)
  }

  // Calculate modal width based on zoom level
  const getModalWidth = () => {
    if (zoomLevel <= 100) return "max-w-4xl"
    if (zoomLevel <= 130) return "max-w-5xl"
    if (zoomLevel <= 160) return "max-w-6xl"
    return "max-w-7xl"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${getModalWidth()} max-h-[95vh] overflow-hidden flex flex-col`}>
        <DialogHeader className="flex-shrink-0">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl">Order Details - #{order.id}</DialogTitle>
            <div className="flex gap-2 items-center">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button onClick={handleZoomOut} variant="ghost" size="sm" disabled={zoomLevel <= 50}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium min-w-[50px] text-center">{zoomLevel}%</span>
                <Button onClick={handleZoomIn} variant="ghost" size="sm" disabled={zoomLevel >= 200}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button onClick={handleResetZoom} variant="ghost" size="sm" title="Reset Zoom">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              <Button onClick={handlePrint} variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Print Receipt
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div
            className="p-4 transition-transform duration-200"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: "top left",
              width: `${10000 / zoomLevel}%`,
            }}
          >
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="font-semibold mb-3 text-lg border-b pb-2">Customer Information</h3>
                <div className="bg-muted p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer Name</p>
                    <p className="font-medium">{order.customerName || "Walk-in Customer"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{order.customerPhone || "No Phone"}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3 text-lg border-b pb-2">Order Items</h3>
                <div className="space-y-3">
                  {order.items.map((orderItem, index) => {
                    const itemDetails = getItemDetails(orderItem.itemId)
                    const itemTotal = orderItem.quantity * orderItem.price

                    return (
                      <div key={index} className="flex justify-between items-center p-4 border rounded-lg bg-muted/30">
                        <div className="flex-1">
                          <p className="font-medium text-lg">{itemDetails?.name || `Item #${orderItem.itemId}`}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                            <span>
                              Quantity: {orderItem.quantity} {orderItem.unit}
                            </span>
                            <span>Unit Price: {orderItem.price.toFixed(2)} ETB</span>
                            {itemDetails && <span>Category: {itemDetails.categoryId}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{itemTotal.toFixed(2)} ETB</p>
                          <p className="text-sm text-muted-foreground">
                            {orderItem.quantity} × {orderItem.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="font-semibold mb-3 text-lg border-b pb-2">Order Summary</h3>
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <div className="flex justify-between text-lg">
                    <span>Subtotal:</span>
                    <span className="font-medium">{order.totalPrice.toFixed(2)} ETB</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span>Amount Paid:</span>
                    <span className="font-medium">{order.paid.toFixed(2)} ETB</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Balance:</span>
                      <span className={balance >= 0 ? "text-green-600" : "text-red-600"}>{balance.toFixed(2)} ETB</span>
                    </div>
                    {balance < 0 && (
                      <p className="text-sm text-red-600 mt-2">
                        ⚠️ Customer still owes {Math.abs(balance).toFixed(2)} ETB
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment & Status Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-lg border-b pb-2">Payment Information</h3>
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="font-medium">{order.paymentType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge className={`${getStatusColor(order.status)} border`}>{order.status}</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-lg border-b pb-2">Order Information</h3>
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span className="font-medium">{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Updated:</span>
                      <span className="font-medium">{new Date(order.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature Section */}
              <div>
                <h3 className="font-semibold mb-3 text-lg border-b pb-2">Signatures</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="border-b-2 border-gray-400 h-16 mb-2"></div>
                    <p className="text-sm text-muted-foreground">Customer Signature</p>
                  </div>
                  <div className="text-center">
                    <div className="border-b-2 border-gray-400 h-16 mb-2"></div>
                    <p className="text-sm text-muted-foreground">Cashier Signature</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {order.createdBy || user?.fullName || "Unknown User"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
