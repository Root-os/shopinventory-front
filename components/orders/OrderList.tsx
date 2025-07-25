"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchInput } from "@/components/ui/search-input"
import { Eye, Trash2, Edit, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import type { Order, Item } from "@/types"
import { useSearch } from "@/hooks/useSearch"

interface OrderListProps {
  orders: Order[]
  items: Item[]
  onViewOrder: (order: Order) => void
  onEditOrder: (order: Order) => void
  onUpdateStatus: (orderId: number, status: "Pending" | "Confirmed" | "Dispatched") => void
  onDeleteOrder: (orderId: number) => void
}

type SortField = "customerName" | "totalPrice" | "paid" | "status" | "createdAt"
type SortDirection = "asc" | "desc"

export function OrderList({ orders, items, onViewOrder, onEditOrder, onUpdateStatus, onDeleteOrder }: OrderListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const { searchQuery, setSearchQuery, filteredData } = useSearch(orders, ["customerName", "customerPhone"])

  const filteredOrders = filteredData.filter((order) => statusFilter === "all" || order.status === statusFilter)

  // Sorting function
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue: any = a[sortField]
    let bValue: any = b[sortField]

    // Handle different data types
    if (sortField === "createdAt") {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    } else if (sortField === "totalPrice" || sortField === "paid") {
      aValue = Number(aValue)
      bValue = Number(bValue)
    } else if (sortField === "customerName") {
      aValue = (aValue || "").toLowerCase()
      bValue = (bValue || "").toLowerCase()
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

  const handleEditClick = (order: Order) => {
    try {
      onEditOrder(order)
    } catch (error) {
      console.error("Error editing order:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders Management ({sortedOrders.length})</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by customer name or phone..."
            className="flex-1"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Dispatched">Dispatched</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
                    onClick={() => handleSort("customerName")}
                    className="font-semibold p-0 h-auto"
                  >
                    Customer
                    {getSortIcon("customerName")}
                  </Button>
                </th>
                <th className="text-left p-3">Phone</th>
                <th className="text-left p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("status")}
                    className="font-semibold p-0 h-auto"
                  >
                    Status
                    {getSortIcon("status")}
                  </Button>
                </th>
                <th className="text-left p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("totalPrice")}
                    className="font-semibold p-0 h-auto"
                  >
                    Total
                    {getSortIcon("totalPrice")}
                  </Button>
                </th>
                <th className="text-left p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("paid")}
                    className="font-semibold p-0 h-auto"
                  >
                    Paid
                    {getSortIcon("paid")}
                  </Button>
                </th>
                <th className="text-left p-3">Balance</th>
                <th className="text-left p-3">Payment</th>
                <th className="text-left p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("createdAt")}
                    className="font-semibold p-0 h-auto"
                  >
                    Date
                    {getSortIcon("createdAt")}
                  </Button>
                </th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((order) => {
                const balance = order.paid - order.totalPrice
                return (
                  <tr key={order.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="font-medium">{order.customerName || "Unknown Customer"}</div>
                      {order.createdBy && (
                        <div className="text-xs text-muted-foreground">Created by: {order.createdBy}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{order.customerPhone || "No Phone"}</div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-2">
                        <Badge className={`${getStatusColor(order.status)} border`}>{order.status}</Badge>
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            onUpdateStatus(order.id, value as "Pending" | "Confirmed" | "Dispatched")
                          }
                        >
                          <SelectTrigger className="w-full h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Confirmed">Confirmed</SelectItem>
                            <SelectItem value="Dispatched">Dispatched</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{order.totalPrice.toFixed(2)} ETB</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{order.paid.toFixed(2)} ETB</div>
                    </td>
                    <td className="p-3">
                      <div className={`font-medium ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {balance.toFixed(2)} ETB
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{order.paymentType}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-1">
                        <Button onClick={() => onViewOrder(order)} variant="outline" size="sm" title="View Details">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => handleEditClick(order)} variant="outline" size="sm" title="Edit Order">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => onDeleteOrder(order.id)}
                          variant="destructive"
                          size="sm"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {sortedOrders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || statusFilter !== "all" ? "No orders found matching your criteria." : "No orders yet."}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
