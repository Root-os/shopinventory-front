"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, ArrowLeft, Edit, Save } from "lucide-react"
import type { Item, Customer, OrderItem, Order } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react";

interface OrderFormProps {
  items: Item[]
  customers: Customer[]
  onSubmit: (orderData: any) => Promise<void>
  onCancel: () => void
  isEditing?: boolean
  initialOrder?: Order
}

interface ItemCategory {
  id: number
  name: string
}

interface ExtendedItem extends Item {
  ItemCategory: {
    id: number
    name: string
  }
}

export function OrderForm({ items, customers, onSubmit, onCancel, isEditing = false, initialOrder }: OrderFormProps) {
  const [isNewCustomer, setIsNewCustomer] = useState(true)
  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
    customerId: "",
  })
  const [originalCustomerData, setOriginalCustomerData] = useState({
    name: "",
    phone: "",
  })
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [paymentData, setPaymentData] = useState({
    paymentType: "Cash" as "Cash" | "Credit",
    paid: 0,
    status: "Pending" as "Pending" | "Confirmed" | "Dispatched",
    carPlate:"",
  })
  const [categories, setCategories] = useState<ItemCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [categoryItems, setCategoryItems] = useState<ExtendedItem[]>([])
  const [selectedItems, setSelectedItems] = useState<ExtendedItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;
  const categorySelectRef = useRef<HTMLButtonElement>(null)
  

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/item-categories`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        })
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        })
      }
    }
    fetchCategories()
  }, [toast])

  // Fetch items when category is selected
  useEffect(() => {
    if (selectedCategory) {
      const fetchCategoryItems = async () => {
        try {
          const response = await fetch(`${API_BASE}/api/items/category/${selectedCategory}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          })
          const data = await response.json()
          setCategoryItems(data)
        } catch (error) {
          console.error("Failed to fetch category items:", error)
          toast({
            title: "Error",
            description: "Failed to load category items",
            variant: "destructive",
          })
        }
      }
      fetchCategoryItems()
    }
  }, [selectedCategory, toast])

  // Initialize form with existing order data
  useEffect(() => {
    if (isEditing && initialOrder) {
      const selectedCustomer = initialOrder.customerId
        ? customers.find((c) => c.id === initialOrder.customerId)
        : null
      const isNewCustomerForEdit = !initialOrder.customerId
      setIsNewCustomer(isNewCustomerForEdit)
      const name = selectedCustomer?.name || initialOrder.customerName || ""
      const phone = selectedCustomer?.phone || initialOrder.customerPhone || ""
      setCustomerData({
        name,
        phone,
        customerId: initialOrder.customerId?.toString() || "",
      })
      setOriginalCustomerData({
        name,
        phone,
      })
      setPaymentData({
        paymentType: initialOrder.paymentType || "Cash",
        paid: Number(initialOrder.paid) || 0,
        status: initialOrder.status || "Pending",
        carPlate: initialOrder.carPlate || "null"
      })
      // Initialize selectedItems from initialOrder
      if (initialOrder.items && Array.isArray(initialOrder.items)) {
        const initialSelectedItems = initialOrder.items.map((item) => {
          const foundItem = items.find((i) => i.id === Number(item.itemId))
          return {
            id: Number(item.itemId),
            name: foundItem?.name || item.itemName || "Unknown Item",
            categoryId: foundItem?.categoryId || 0,
            unit: item.unit || "",
            price: item.price.toString(),
            quantity: Number(item.quantity),
            minStockLevel: foundItem?.minStockLevel || 0,
            createdAt: foundItem?.createdAt || "",
            updatedAt: foundItem?.updatedAt || "",
            ItemCategory: {
              id: foundItem?.categoryId || 0,
              name: categories.find((c) => c.id === foundItem?.categoryId)?.name || "",
            },
          }
        })
        setSelectedItems(initialSelectedItems)
        setOrderItems(
          initialOrder.items.map((item) => ({
            itemId: Number(item.itemId) || 0,
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
            unit: String(item.unit || ""),
            itemName: items.find((i) => i.id === Number(item.itemId))?.name || item.itemName || "Unknown Item",
          }))
        )
      }
    }
  }, [isEditing, initialOrder, items, customers, categories])

  const handleCustomerTypeChange = (newIsNewCustomer: boolean) => {
    if (newIsNewCustomer) {
      const selectedCustomer = customers.find((c) => c.id.toString() === customerData.customerId)
      setCustomerData({
        name: selectedCustomer?.name || customerData.name,
        phone: selectedCustomer?.phone || customerData.phone,
        customerId: "",
      })
    } else {
      const matchingCustomer = customers.find((c) => c.name === customerData.name || c.phone === customerData.phone)
      setCustomerData({
        name: "",
        phone: "",
        customerId: matchingCustomer?.id.toString() || "",
      })
    }
    setIsNewCustomer(newIsNewCustomer)
  }

  const handleExistingCustomerChange = (customerId: string) => {
    const selectedCustomer = customers.find((c) => c.id.toString() === customerId)
    if (selectedCustomer) {
      setCustomerData({
        name: selectedCustomer.name,
        phone: selectedCustomer.phone,
        customerId,
      })
      setOriginalCustomerData({
        name: selectedCustomer.name,
        phone: selectedCustomer.phone,
      })
    } else {
      setCustomerData({
        name: "",
        phone: "",
        customerId,
      })
      setOriginalCustomerData({
        name: "",
        phone: "",
      })
    }
  }

  const handleItemSelection = (item: ExtendedItem) => {
    setSelectedItems((prev) => {
      if (prev.some((i) => i.id === item.id)) {
        return prev.filter((i) => i.id !== item.id)
      } else {
        const newItem = { ...item, quantity: 1 }
        const newOrderItem: OrderItem = {
          itemId: item.id,
          quantity: 1,
          price: Number.parseFloat(item.price),
          unit: item.unit,
          itemName: item.name,
        }
        setOrderItems((prevItems) => [...prevItems, newOrderItem])
        return [...prev, newItem]
      }
    })
  }
  
  const handleAddItemClick = () => {
    setSelectedCategory("") // reset to open selector
    setTimeout(() => {
      categorySelectRef.current?.focus()
    }, 100)
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

  const updateItemQuantity = (itemId: number, quantity: number) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    )
    setOrderItems((prev) =>
      prev.map((orderItem) =>
        orderItem.itemId === itemId
          ? { ...orderItem, quantity: Math.max(1, quantity) }
          : orderItem
      )
    )
  }

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + Number(item.quantity) * Number.parseFloat(item.price), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedItems.length === 0) {
      toast({ title: "Error", description: "Please add at least one item", variant: "destructive" })
      return
    }

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

    const invalidItems = selectedItems.filter((item) => {
      const itemId = Number(item.id)
      const quantity = Number(item.quantity)
      const price = Number.parseFloat(item.price)
      const unit = String(item.unit).trim()

      return !itemId || itemId === 0 || !quantity || quantity <= 0 || !price || price <= 0 || !unit
    })

    if (invalidItems.length > 0) {
      toast({
        title: "Error",
        description: "Please ensure all items have valid ID, quantity, price, and unit",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const orderData: any = {
        isNewCustomer: Boolean(isNewCustomer),
        items: selectedItems.map((item) => ({
          itemId: Number(item.id),
          quantity: Number(item.quantity),
          price: Number.parseFloat(item.price),
          unit: String(item.unit).trim(),
        })),
        paid: Number(paymentData.paid),
        paymentType: String(paymentData.paymentType),
        status: String(paymentData.status),
      }

      if (isNewCustomer) {
        orderData.customerName = String(customerData.name).trim()
        orderData.customerPhone = String(customerData.phone).trim()
        orderData.customerId = undefined
      } else {
        orderData.customerId = Number(customerData.customerId)
        if (customerData.name.trim() !== originalCustomerData.name.trim()) {
          orderData.customerName = String(customerData.name).trim() || undefined
        }
        if (customerData.phone.trim() !== originalCustomerData.phone.trim()) {
          orderData.customerPhone = String(customerData.phone).trim() || undefined
        }
      }

      await onSubmit(orderData)
      toast({
        title: "Success",
        description: isEditing ? "Order updated successfully" : "Order created successfully",
      })
    } catch (error) {
      console.error("❌ Order submission failed:", error)
      toast({
        title: "Error",
        description: isEditing ? "Failed to update order" : "Failed to create order",
        variant: "destructive",
      })
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
                Edit Order #{initialOrder?.id || "N/A"}
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
              {!isEditing && ( 
          <div className="flex space-x-4">
              <Button
                type="button"
                variant={isNewCustomer ? "default" : "outline"}
                onClick={() => handleCustomerTypeChange(true)}
                disabled={isEditing}
              >
                New Customer
              </Button>
              <Button
                type="button"
                variant={!isNewCustomer ? "default" : "outline"}
                onClick={() => handleCustomerTypeChange(false)}
                disabled={isEditing}
              >
                Existing Customer
              </Button>
            </div>)}

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
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
          {/* Category and Item Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Items</h3>
            <Select onValueChange={setSelectedCategory} value={selectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCategory && (
              <div className="space-y-2">
                <h4 className="text-md font-medium">Available Items</h4>
                <div className="flex flex-wrap gap-4"> {/* flex row + wrapping + spacing */}
                  {categoryItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={selectedItems.some((i) => i.id === item.id)}
                        onCheckedChange={() => handleItemSelection(item)}
                      />
                      <label htmlFor={`item-${item.id}`}>
                        {item.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedItems.length > 0 && (
              <div>
                <h4 className="text-md font-medium mb-2">Selected Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>  
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={item.price}
                                onChange={(e) => {
                                  const newPrice = Math.max(0.01, Number(e.target.value) || 0.01);
                                  setSelectedItems((prev) =>
                                    prev.map((si) =>
                                      si.id === item.id ? { ...si, price: newPrice.toString() } : si
                                    )
                                  );
                                  setOrderItems((prev) =>
                                    prev.map((oi) =>
                                      oi.itemId === item.id ? { ...oi, price: newPrice } : oi
                                    )
                                  );
                                }}
                                required
                              />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity || 1}
                            onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-16 p-1 border rounded"
                          />
                        </TableCell>
                        <TableCell>
                        {(Number(item.quantity) * Number(item.price)).toFixed(2)} ETB
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedItems((prev) => prev.filter((si) => si.id !== item.id));
                            setOrderItems((prev) => prev.filter((oi) => oi.itemId !== item.id));
                          }}
                          aria-label={`Remove ${item.name}`}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={18} />
                        </button>
                      </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
           
          {/* Payment Information */}
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

            {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="carPlate">Car Plate</Label>
              <Input
                id="carPlate"
                type="text"
                value={paymentData.carPlate || ""}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    carPlate: e.target.value,
                  })
                }
                placeholder="Enter car plate number"
              />
            </div>
          )}

          </div>

          {/* Order Summary */}
          {selectedItems.length > 0 && (
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
            <Button type="submit" disabled={isSubmitting || selectedItems.length === 0}>
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