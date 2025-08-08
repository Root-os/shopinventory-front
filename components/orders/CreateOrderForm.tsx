"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, ArrowLeft } from "lucide-react"
import type { Item, Customer, OrderItem } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { useOrderFormLogic } from "./OrderFormBody"

interface CreateOrderFormProps {
  items: Item[]
  customers: Customer[]
  onSubmit: (orderData: any) => Promise<void>
  onCancel: () => void
}

export function CreateOrderForm({ items, customers, onSubmit, onCancel }: CreateOrderFormProps) {
  const { toast } = useToast()
  const {
    isNewCustomer,
    setIsNewCustomer,
    customerData,
    setCustomerData,
    orderItems,
    setOrderItems,
    paymentData,
    setPaymentData,
    isSubmitting,
    setIsSubmitting,
    handleCustomerTypeChange,
    handleExistingCustomerChange,
    addItem,
    removeItem,
    updateItem,
    calculateTotal,
    validateForm,
  } = useOrderFormLogic({ items, customers })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm(true)
    if (validationError) {
      toast({ title: "Error", description: validationError, variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const orderData: any = {
        isNewCustomer,
        items: orderItems.map((item) => ({
          itemId: Number(item.itemId),
          quantity: Number(item.quantity),
          price: Number(item.price),
          unit: String(item.unit).trim(),
        })),
        paid: Number(paymentData.paid),
        paymentType: paymentData.paymentType,
        status: paymentData.status,
      }

      if (isNewCustomer) {
        orderData.customerName = customerData.name.trim()
        orderData.customerPhone = customerData.phone.trim()
      } else {
        orderData.customerId = Number(customerData.customerId)
      }

      await onSubmit(orderData)
      toast({ title: "Success", description: "Order created successfully" })
    } catch (error) {
      console.error("❌ Order creation failed:", error)
      toast({ title: "Error", description: "Failed to create order", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const total = calculateTotal()
  const balance = Number(paymentData.paid) - total

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button onClick={onCancel} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Order
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex space-x-4">
              <Button
                type="button"
                variant={isNewCustomer ? "default" : "outline"}
                onClick={() => handleCustomerTypeChange(true)}
              >
                New Customer
              </Button>
              <Button
                type="button"
                variant={!isNewCustomer ? "default" : "outline"}
                onClick={() => handleCustomerTypeChange(false)}
              >
                Existing Customer
              </Button>
            </div>

            {isNewCustomer ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number *</Label>
                  <Input
                    id="customerPhone"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="customerId">Select Customer *</Label>
                <Select value={customerData.customerId} onValueChange={handleExistingCustomerChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Order Items</h3>
              <Button type="button" onClick={addItem} size="sm" disabled={items.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            {items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>No items available. Please add items to inventory first.</p>
              </div>
            )}

            {orderItems.map((orderItem, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg bg-muted/20">
                <div className="col-span-4">
                  <Label>Item *</Label>
                  <Select
                    value={orderItem.itemId.toString()}
                    onValueChange={(value) => updateItem(index, "itemId", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {items
                        .filter((item) => item.quantity > 0)
                        .map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    step="1"
                    min="1"
                    value={orderItem.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", Math.max(1, Number(e.target.value) || 1))
                    }
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label>Unit Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={orderItem.price}
                    onChange={(e) => updateItem(index, "price", Math.max(0.01, Number(e.target.value) || 0.01))}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label>Unit *</Label>
                  <Input
                    value={orderItem.unit}
                    onChange={(e) => updateItem(index, "unit", e.target.value)}
                    placeholder="kg, pcs, etc."
                    required
                  />
                </div>
                <div className="col-span-1">
                  <Label>Total</Label>
                  <div className="text-sm font-medium p-2 bg-muted rounded">
                    {(Number(orderItem.quantity) * Number(orderItem.price)).toFixed(2)} ETB
                  </div>
                </div>
                <div className="col-span-1">
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeItem(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentType">Payment Type *</Label>
              <Select
                value={paymentData.paymentType}
                onValueChange={(value) => setPaymentData({ ...paymentData, paymentType: value as "Cash" | "Credit" })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paid">Amount Paid *</Label>
              <Input
                id="paid"
                type="number"
                step="0.01"
                min="0"
                value={paymentData.paid}
                onChange={(e) => setPaymentData({ ...paymentData, paid: Number(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Order Status *</Label>
              <Select
                value={paymentData.status}
                onValueChange={(value) =>
                  setPaymentData({ ...paymentData, status: value as "Pending" | "Confirmed" | "Dispatched" })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Dispatched">Dispatched</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {orderItems.length > 0 && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">{total.toFixed(2)} ETB</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span className="font-medium">{Number(paymentData.paid).toFixed(2)} ETB</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Balance:</span>
                <span className={balance >= 0 ? "text-green-600" : "text-red-600"}>{balance.toFixed(2)} ETB</span>
              </div>
              {balance < 0 && (
                <p className="text-sm text-red-600">⚠️ Customer still owes {Math.abs(balance).toFixed(2)} ETB</p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || orderItems.length === 0}>
              {isSubmitting ? "Creating Order..." : "Create Order"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}