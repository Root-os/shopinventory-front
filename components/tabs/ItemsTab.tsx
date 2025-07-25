"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchInput } from "@/components/ui/search-input"
import { Plus, Trash2, Edit, Save, X, AlertTriangle, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import type { Item, Category } from "@/types"
import { itemService } from "@/services/itemService"
import { useAuth } from "@/contexts/AuthContext"
import { useSearch } from "@/hooks/useSearch"
import { useToast } from "@/hooks/use-toast"

interface ItemsTabProps {
  items: Item[]
  categories: Category[]
  onRefresh: () => void
}

type SortField = "name" | "price" | "quantity" | "minStockLevel" | "createdAt"
type SortDirection = "asc" | "desc"

export function ItemsTab({ items, categories, onRefresh }: ItemsTabProps) {
  const [itemForm, setItemForm] = useState({
    name: "",
    categoryId: "",
    unit: "",
    price: "",
    quantity: "",
    minStockLevel: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingItem, setEditingItem] = useState<Partial<Item>>({})
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const { token } = useAuth()
  const { searchQuery, setSearchQuery, filteredData } = useSearch(items, ["name", "unit"])
  const { toast } = useToast()

  // Sorting function
  const sortedData = [...filteredData].sort((a, b) => {
    let aValue: any = a[sortField]
    let bValue: any = b[sortField]

    if (sortField === "createdAt") {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    } else if (sortField === "price") {
      aValue = Number.parseFloat(aValue)
      bValue = Number.parseFloat(bValue)
    } else if (sortField === "quantity" || sortField === "minStockLevel") {
      aValue = Number(aValue)
      bValue = Number(bValue)
    } else {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />
    }
    return sortDirection === "asc" ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await itemService.createItem(
        {
          name: itemForm.name,
          categoryId: Number.parseInt(itemForm.categoryId),
          unit: itemForm.unit,
          price: Number.parseFloat(itemForm.price),
          quantity: Number.parseInt(itemForm.quantity),
          minStockLevel: Number.parseInt(itemForm.minStockLevel),
        },
        token,
      )
      toast({ title: "Success", description: "Item created successfully" })
      setItemForm({
        name: "",
        categoryId: "",
        unit: "",
        price: "",
        quantity: "",
        minStockLevel: "",
      })
      onRefresh()
    } catch (error) {
      toast({ title: "Error", description: "Failed to create item", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (item: Item) => {
    setEditingId(item.id)
    setEditingItem({
      name: item.name,
      categoryId: item.categoryId,
      unit: item.unit,
      price: item.price,
      quantity: item.quantity,
      minStockLevel: item.minStockLevel,
    })
  }

  const handleSaveEdit = async (id: number) => {
    try {
      await itemService.updateItem(
        id,
        {
          name: editingItem.name!,
          categoryId: editingItem.categoryId!,
          unit: editingItem.unit!,
          price: typeof editingItem.price === "string" ? Number.parseFloat(editingItem.price) : editingItem.price!,
          quantity: editingItem.quantity!,
          minStockLevel: editingItem.minStockLevel!,
        },
        token,
      )
      toast({ title: "Success", description: "Item updated successfully" })
      setEditingId(null)
      setEditingItem({})
      onRefresh()
    } catch (error) {
      toast({ title: "Error", description: "Failed to update item", variant: "destructive" })
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingItem({})
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await itemService.deleteItem(id, token)
        toast({ title: "Success", description: "Item deleted successfully" })
        onRefresh()
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete item", variant: "destructive" })
      }
    }
  }

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId)
    return category?.name || "Unknown"
  }

  const isLowStock = (item: Item) => item.quantity <= item.minStockLevel

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                placeholder="Enter item name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select
                value={itemForm.categoryId}
                onValueChange={(value) => setItemForm({ ...itemForm, categoryId: value })}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={itemForm.unit}
                onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                placeholder="kg, pcs, box, etc."
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={itemForm.price}
                onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                placeholder="0.00"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={itemForm.quantity}
                onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
                placeholder="0"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStockLevel">Min Stock Level</Label>
              <Input
                id="minStockLevel"
                type="number"
                value={itemForm.minStockLevel}
                onChange={(e) => setItemForm({ ...itemForm, minStockLevel: e.target.value })}
                placeholder="0"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <Button type="submit" disabled={isSubmitting}>
                <Plus className="w-4 h-4 mr-2" />
                {isSubmitting ? "Adding..." : "Add Item"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items List ({sortedData.length})</CardTitle>
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search items..." />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("name")}
                      className="font-semibold p-0 h-auto"
                    >
                      Name
                      {getSortIcon("name")}
                    </Button>
                  </th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-left p-3">Unit</th>
                  <th className="text-left p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("price")}
                      className="font-semibold p-0 h-auto"
                    >
                      Price
                      {getSortIcon("price")}
                    </Button>
                  </th>
                  <th className="text-left p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("quantity")}
                      className="font-semibold p-0 h-auto"
                    >
                      Quantity
                      {getSortIcon("quantity")}
                    </Button>
                  </th>
                  <th className="text-left p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("minStockLevel")}
                      className="font-semibold p-0 h-auto"
                    >
                      Min Stock
                      {getSortIcon("minStockLevel")}
                    </Button>
                  </th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item) => {
                  const isEditing = editingId === item.id

                  return (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        {isEditing ? (
                          <Input
                            value={editingItem.name || ""}
                            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                          />
                        ) : (
                          <div className="font-medium">{item.name}</div>
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <Select
                            value={editingItem.categoryId?.toString() || ""}
                            onValueChange={(value) =>
                              setEditingItem({ ...editingItem, categoryId: Number.parseInt(value) })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          getCategoryName(item.categoryId)
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <Input
                            value={editingItem.unit || ""}
                            onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                          />
                        ) : (
                          item.unit
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editingItem.price || ""}
                            onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                          />
                        ) : (
                          `$${Number.parseFloat(item.price).toFixed(2)}`
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editingItem.quantity || ""}
                            onChange={(e) =>
                              setEditingItem({ ...editingItem, quantity: Number.parseInt(e.target.value) })
                            }
                          />
                        ) : (
                          <div className={isLowStock(item) ? "text-red-600 font-medium" : ""}>
                            {item.quantity}
                            {isLowStock(item) && <AlertTriangle className="w-4 h-4 inline ml-1" />}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editingItem.minStockLevel || ""}
                            onChange={(e) =>
                              setEditingItem({ ...editingItem, minStockLevel: Number.parseInt(e.target.value) })
                            }
                          />
                        ) : (
                          item.minStockLevel
                        )}
                      </td>
                      <td className="p-3">
                        {!isEditing && (
                          <div
                            className={`text-sm px-2 py-1 rounded ${
                              isLowStock(item) ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                            }`}
                          >
                            {isLowStock(item) ? "Low Stock" : "In Stock"}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          {isEditing ? (
                            <>
                              <Button onClick={() => handleSaveEdit(item.id)} size="sm" variant="default">
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button onClick={handleCancelEdit} size="sm" variant="outline">
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button onClick={() => handleEdit(item)} variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button onClick={() => handleDelete(item.id)} variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {sortedData.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "No items found matching your search." : "No items yet."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
