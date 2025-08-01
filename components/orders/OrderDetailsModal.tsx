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

  const isAdmin = user?.role === "admin"
  const isStorekeeper = user?.role === "storekeeper"
  const isCustomer = user?.role === "customer"

  if (!order || !order.items || !Array.isArray(order.items)) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center text-muted-foreground">
            <p>No order data available.</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
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

  const getCustomerName = () => {
    return (
      order.Customer?.name ||
      order.customerName ||
      `Customer #${order.customerId}`
    )
  }

  const getCustomerPhone = () => {
    return (
      order.Customer?.phone ||
      order.customerPhone ||
      "-"
    )
  }

  const balance = (order.paid || 0) - (order.totalPrice || 0)

const handlePrint = () => {
  const createdBy = order.createdBy || user?.fullName || "Unknown User"

  if (isAdmin) {
    const printableOrder = preparePrintableOrder(order, items, createdBy)
    printReceipt(printableOrder)
  } else if (isStorekeeper) {
    const printable = {
      id: order.id,
      customerName: getCustomerName(),
      customerPhone: getCustomerPhone(),
      createdAt: order.createdAt,
      status: order.status,
      createdBy: createdBy,
      items: order.items.map((item) => {
        const itemDetails = getItemDetails(item.itemId)
        return {
          name: itemDetails?.name || item.itemName || `Item #${item.itemId}`,
          quantity: item.quantity,
          unit: item.unit,
        }
      }),
    }

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head><title>Print Receipt</title></head>
        <body style="font-family: sans-serif; padding: 20px;">
          <p><strong>Customer:</strong> ${printable.customerName}</p>
          <p><strong>Phone:</strong> ${printable.customerPhone}</p>
          <p><strong>Status:</strong> ${printable.status}</p>
          <p><strong>Ordered At:</strong> ${new Date(printable.createdAt).toLocaleDateString()}</p>
          <hr />
          <h3>Items</h3>
          <table border="1" cellpadding="6" cellspacing="0" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              ${printable.items.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unit}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <br />
          <div style="margin-top: 40px; display: flex; justify-content: space-between;">
            <div>
              ___________________________<br/>
              Customer Signature
            </div>
            <div>
              ___________________________<br/>
              Cashier Signature<br/>
              <small>${printable.createdBy}</small>
            </div>
          </div>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }
}


  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 200))
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 50))
  const handleResetZoom = () => setZoomLevel(100)

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
            <DialogTitle className="text-xl">Order Details</DialogTitle>
            <div className="flex gap-2 items-center">
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
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-3 text-lg border-b pb-2">Customer Information</h3>
                <div className="bg-muted p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer Name</p>
                    <p className="font-medium">{getCustomerName()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{getCustomerPhone()}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3 text-lg border-b pb-2">Order Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-border bg-muted/40">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="p-2 text-left">#</th>
                        <th className="p-2 text-left">Item</th>
                        <th className="p-2 text-right">Quantity</th>
                        <th className="p-2 text-right">Unit</th>
                        {isAdmin && (
                          <>
                            <th className="p-2 text-right">Unit Price</th>
                            <th className="p-2 text-right">Total</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((orderItem, index) => {
                        const itemDetails = getItemDetails(orderItem.itemId)
                        const itemTotal = (orderItem.quantity || 0) * (orderItem.price || 0)
                        return (
                          <tr key={index} className="border-t">
                            <td className="p-2">{index + 1}</td>
                            <td className="p-2">{itemDetails?.name || orderItem.itemName || `Item #${orderItem.itemId}`}</td>
                            <td className="p-2 text-right">{orderItem.quantity}</td>
                            <td className="p-2 text-right">{orderItem.unit}</td>
                            {isAdmin && (
                              <>
                                <td className="p-2 text-right">{orderItem.price?.toFixed(2)}</td>
                                <td className="p-2 text-right font-medium">{itemTotal.toFixed(2)}</td>
                              </>
                            )}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary - only for admin */}
              {isAdmin && (
                <div>
                  <h3 className="font-semibold mb-3 text-lg border-b pb-2">Order Summary</h3>
                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <div className="flex justify-between text-lg">
                      <span>Subtotal:</span>
                      <span className="font-medium">{(order.totalPrice || 0).toFixed(2)} ETB</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span>Amount Paid:</span>
                      <span className="font-medium">{(order.paid || 0).toFixed(2)} ETB</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-xl font-bold">
                        <span>Balance:</span>
                        <span className={balance >= 0 ? "text-green-600" : "text-red-600"}>
                          {balance.toFixed(2)} ETB
                        </span>
                      </div>
                      {balance < 0 && (
                        <p className="text-sm text-red-600 mt-2">
                          ⚠️ Customer still owes {Math.abs(balance).toFixed(2)} ETB
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Info & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-lg border-b pb-2">Payment Information</h3>
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    {isAdmin && (
                      <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span className="font-medium">{order.paymentType || "N/A"}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge className={`${getStatusColor(order.status)} border`}>
                        {order.status || "Unknown"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-lg border-b pb-2">Order Information</h3>
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Ordered At:</span>
                    <span className="font-medium">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                    </span>
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
