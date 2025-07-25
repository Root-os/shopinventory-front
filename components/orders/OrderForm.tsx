"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Minus, Trash2, ArrowLeft, Edit, Save } from "lucide-react"
import type { Item, Customer, OrderItem, Order } from "@/types"
import { useToast } from "@/hooks/use-toast"

interface OrderFormProps {
  items: Item[]
  customers: Customer[]
  onSubmit: (orderData: any) => Promise<void>
  onCancel: () => void
  isEditing?: boolean
  initialOrder?: Order
}

export function OrderForm({ items, customers, onSubmit, onCancel, isEditing = false, initialOrder }: OrderFormProps) {
  const [isNewCustomer, setIsNewCustomer] = useState(true)
  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
    customerId: "",
  })
  // Track original customer data to detect changes
  const [originalCustomerData, setOriginalCustomerData] = useState({
    name: "",
    phone: "",
  })
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [paymentData, setPaymentData] = useState({
    paymentType: "Cash",
    paid: 0,
    status: "Pending" as "Pending" | "Confirmed" | "Dispatched",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Initialize form with existing order data when editing
  useEffect(() => {
    if (isEditing && initialOrder) {
      // Set customer data
      if (initialOrder.customerId) {
        setIsNewCustomer(false)
        setCustomerData({
          name: initialOrder.customerName || "",
          phone: initialOrder.customerPhone || "",
          customerId: initialOrder.customerId.toString(),
        })
        setOriginalCustomerData({
          name: initialOrder.customerName || "",
          phone: initialOrder.customerPhone || "",
        })
      } else {
        setIsNewCustomer(true)
        setCustomerData({
          name: initialOrder.customerName || "",
          phone: initialOrder.customerPhone || "",
          customerId: "",
        })
        setOriginalCustomerData({
          name: initialOrder.customerName || "",
          phone: initialOrder.customerPhone || "",
        })
      }

      // Set order items
      setOrderItems(initialOrder.items)

      // Set payment data
      setPaymentData({
        paymentType: initialOrder.paymentType,
        paid: initialOrder.paid,
        status: initialOrder.status,
      })
    }
  }, [isEditing, initialOrder])

  // Handle customer type change - preserve data when switching
  const handleCustomerTypeChange = (newIsNewCustomer: boolean) => {
    if (newIsNewCustomer) {
      // Switching to new customer - clear existing customer selection but keep name/phone if available
      const selectedCustomer = customers.find((c) => c.id.toString() === customerData.customerId)
      setCustomerData({
        name: selectedCustomer?.name || customerData.name,
        phone: selectedCustomer?.phone || customerData.phone,
        customerId: "",
      })
    } else {
      // Switching to existing customer - clear name/phone but try to find matching customer
      const matchingCustomer = customers.find((c) => c.name === customerData.name || c.phone === customerData.phone)
      setCustomerData({
        name: "",
        phone: "",
        customerId: matchingCustomer?.id.toString() || "",
      })
    }
    setIsNewCustomer(newIsNewCustomer)
  }

  // Handle existing customer selection - retain name and phone in customerData
  const handleExistingCustomerChange = (customerId: string) => {
    const selectedCustomer = customers.find((c) => c.id.toString() === customerId)
    if (selectedCustomer) {
      setCustomerData({
        name: selectedCustomer.name,
        phone: selectedCustomer.phone,
        customerId: customerId,
      })
      // Set original data to track changes
      setOriginalCustomerData({
        name: selectedCustomer.name,
        phone: selectedCustomer.phone,
      })
    } else {
      setCustomerData({
        name: "",
        phone: "",
        customerId: customerId,
      })
      setOriginalCustomerData({
        name: "",
        phone: "",
      })
    }
  }

  const addItem = () => {
    // Initialize with proper default values - no itemId: 0
    setOrderItems([
      ...orderItems,
      {
        itemId: items.length > 0 ? items[0].id : 1,
        quantity: 1,
        price: items.length > 0 ? Number.parseFloat(items[0].price) : 0,
        unit: items.length > 0 ? items[0].unit : "",
      },
    ])
  }

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...orderItems]
    updated[index] = { ...updated[index], [field]: value }

    if (field === "itemId") {
      const item = items.find((i) => i.id === Number(value))
      if (item) {
        updated[index].price = Number.parseFloat(item.price)
        updated[index].unit = item.unit
        updated[index].itemName = item.name
      }
    }

    setOrderItems(updated)
  }

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + Number(item.quantity) * Number(item.price), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("🔍 Form submission started")
    console.log("🔍 Order items:", orderItems)
    console.log("🔍 Customer data:", customerData)
    console.log("🔍 Original customer data:", originalCustomerData)
    console.log("🔍 Payment data:", paymentData)
    console.log("🔍 Is new customer:", isNewCustomer)

    if (orderItems.length === 0) {
      toast({ title: "Error", description: "Please add at least one item", variant: "destructive" })
      return
    }

    // Validate customer data based on type
    if (isNewCustomer) {
      if (!customerData.name.trim() || !customerData.phone.trim()) {
        toast({ title: "Error", description: "Please fill in customer name and phone", variant: "destructive" })
        return
      }
    } else {
      if (!customerData.customerId) {
        toast({ title: "Error", description: "Please select a customer", variant: "destructive" })
        return
      }
    }

    // Validate that all items have valid data
    const invalidItems = orderItems.filter((item) => {
      const itemId = Number(item.itemId)
      const quantity = Number(item.quantity)
      const price = Number(item.price)
      const unit = String(item.unit).trim()

      console.log(`🔍 Validating item: itemId=${itemId}, quantity=${quantity}, price=${price}, unit="${unit}"`)

      return !itemId || itemId === 0 || !quantity || quantity <= 0 || !price || price <= 0 || !unit
    })

    if (invalidItems.length > 0) {
      console.log("❌ Invalid items found:", invalidItems)
      toast({
        title: "Error",
        description: "Please ensure all items have valid ID, quantity, price, and unit",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create the exact structure that works with backend validation
      const orderData: any = {
        isNewCustomer: Boolean(isNewCustomer),
        items: orderItems.map((item) => ({
          itemId: Number(item.itemId),
          quantity: Number(item.quantity),
          price: Number(item.price),
          unit: String(item.unit).trim(),
        })),
        paid: Number(paymentData.paid),
        paymentType: String(paymentData.paymentType),
        status: paymentData.status,
      }

      if (isNewCustomer) {
        // For new customers, always send name and phone
        orderData.customerName = String(customerData.name).trim()
        orderData.customerPhone = String(customerData.phone).trim()
      } else {
        // For existing customers, send only customerId
        orderData.customerId = Number(customerData.customerId)

        // Only include customerName and customerPhone if they were explicitly changed
        const nameChanged = customerData.name.trim() !== originalCustomerData.name.trim()
        const phoneChanged = customerData.phone.trim() !== originalCustomerData.phone.trim()

        if (nameChanged) {
          orderData.customerName = String(customerData.name).trim()
        }
        if (phoneChanged) {
          orderData.customerPhone = String(customerData.phone).trim()
        }
      }

      console.log("🚀 Final order data to submit:", JSON.stringify(orderData, null, 2))

      await onSubmit(orderData)
    } catch (error) {
      console.error("❌ Order submission failed:", error)
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
            {isEditing ? (
              <>
                <Edit className="w-5 h-5" />
                Edit Order #{initialOrder?.id}
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Create New Order
              </>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <div className="space-y-4">
            <div className="flex space-x-4">
              <Button
                type="button"
                variant={isNewCustomer ? "default" : "outline"}
                onClick={() => handleCustomerTypeChange(true)}
                disabled={isEditing} // Disable customer type change when editing
              >
                New Customer
              </Button>
              <Button
                type="button"
                variant={!isNewCustomer ? "default" : "outline"}
                onClick={() => handleCustomerTypeChange(false)}
                disabled={isEditing} // Disable customer type change when editing
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerId">Select Customer *</Label>
                  <Select value={customerData.customerId} onValueChange={handleExistingCustomerChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.name} - {customer.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Show selected customer details with ability to edit */}
                {customerData.customerId && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="existingCustomerName">Customer Name</Label>
                      <Input
                        id="existingCustomerName"
                        value={customerData.name}
                        onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                        placeholder="Customer name"
                      />
                      {customerData.name !== originalCustomerData.name && (
                        <p className="text-xs text-orange-600">⚠️ Name will be updated</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="existingCustomerPhone">Phone Number</Label>
                      <Input
                        id="existingCustomerPhone"
                        value={customerData.phone}
                        onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                        placeholder="Phone number"
                      />
                      {customerData.phone !== originalCustomerData.phone && (
                        <p className="text-xs text-orange-600">⚠️ Phone will be updated</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Items */}
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

            {orderItems.length === 0 && items.length > 0 && (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>No items added yet. Click "Add Item" to start building your order.</p>
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
                        .filter((item) => item.quantity > 0) // Only show items in stock
                        .map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name} - {item.price} ETB ({item.quantity} {item.unit} available)
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label>Quantity *</Label>
                  <div className="flex items-center space-x-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateItem(index, "quantity", Math.max(1, Number(orderItem.quantity) - 1))}
                      disabled={Number(orderItem.quantity) <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      value={orderItem.quantity}
                      onChange={(e) => updateItem(index, "quantity", Math.max(1, Number(e.target.value) || 1))}
                      className="text-center"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateItem(index, "quantity", Number(orderItem.quantity) + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
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

          {/* Payment Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentType">Payment Type *</Label>
              <Select
                value={paymentData.paymentType}
                onValueChange={(value) => setPaymentData({ ...paymentData, paymentType: value })}
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

          {/* Order Summary */}
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

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || orderItems.length === 0}>
              {isSubmitting ? (
                isEditing ? (
                  "Updating Order..."
                ) : (
                  "Creating Order..."
                )
              ) : isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Order
                </>
              ) : (
                "Create Order"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
