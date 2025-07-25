"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchInput } from "@/components/ui/search-input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Plus, Trash2, Edit, Save, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import type { Customer } from "@/types"
import { customerService } from "@/services/customerService"
import { useAuth } from "@/contexts/AuthContext"
import { useSearch } from "@/hooks/useSearch"
import { usePagination } from "@/hooks/usePagination"
import { useToast } from "@/hooks/use-toast"

interface CustomersTabProps {
  customers: Customer[]
  onRefresh: () => void
}

type SortField = "name" | "userName" | "phone" | "createdAt"
type SortDirection = "asc" | "desc"

export function CustomersTab({ customers, onRefresh }: CustomersTabProps) {
  const [customerForm, setCustomerForm] = useState({
    name: "",
    userName: "",
    phone: "",
    password: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingCustomer, setEditingCustomer] = useState<Partial<Customer & { password?: string }>>({})
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const { token } = useAuth()
  const { searchQuery, setSearchQuery, filteredData } = useSearch(customers, ["name", "userName", "phone"])
  const { toast } = useToast()

  // Sorting function
  const sortedData = [...filteredData].sort((a, b) => {
    let aValue: any = a[sortField]
    let bValue: any = b[sortField]

    if (sortField === "createdAt") {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
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

  const { currentPage, totalPages, paginatedData, goToPage, goToNextPage, goToPreviousPage } = usePagination(
    sortedData,
    10,
  )

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
      await customerService.createCustomer(customerForm, token)
      toast({ title: "Success", description: "Customer created successfully" })
      setCustomerForm({
        name: "",
        userName: "",
        phone: "",
        password: "",
      })
      onRefresh()
    } catch (error) {
      toast({ title: "Error", description: "Failed to create customer", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id)
    setEditingCustomer({
      name: customer.name,
      userName: customer.userName,
      phone: customer.phone,
      password: "",
    })
  }

  const handleSaveEdit = async (id: number) => {
    try {
      await customerService.updateCustomer(id, editingCustomer as any, token)
      toast({ title: "Success", description: "Customer updated successfully" })
      setEditingId(null)
      setEditingCustomer({})
      onRefresh()
    } catch (error) {
      toast({ title: "Error", description: "Failed to update customer", variant: "destructive" })
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingCustomer({})
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        await customerService.deleteCustomer(id, token)
        toast({ title: "Success", description: "Customer deleted successfully" })
        onRefresh()
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete customer", variant: "destructive" })
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={customerForm.name}
                onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                placeholder="Enter full name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userName">Username</Label>
              <Input
                id="userName"
                value={customerForm.userName}
                onChange={(e) => setCustomerForm({ ...customerForm, userName: e.target.value })}
                placeholder="Enter username"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                placeholder="Enter phone number"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={customerForm.password}
                onChange={(e) => setCustomerForm({ ...customerForm, password: e.target.value })}
                placeholder="Enter password"
                required
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              <Plus className="w-4 h-4 mr-2" />
              {isSubmitting ? "Adding..." : "Add Customer"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Customers List ({sortedData.length})</CardTitle>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search customers..."
            className="max-w-sm"
          />
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
                  <th className="text-left p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("userName")}
                      className="font-semibold p-0 h-auto"
                    >
                      Username
                      {getSortIcon("userName")}
                    </Button>
                  </th>
                  <th className="text-left p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("phone")}
                      className="font-semibold p-0 h-auto"
                    >
                      Phone
                      {getSortIcon("phone")}
                    </Button>
                  </th>
                  <th className="text-left p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("createdAt")}
                      className="font-semibold p-0 h-auto"
                    >
                      Created
                      {getSortIcon("createdAt")}
                    </Button>
                  </th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((customer) => {
                  const isEditing = editingId === customer.id

                  return (
                    <tr key={customer.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        {isEditing ? (
                          <Input
                            value={editingCustomer.name || ""}
                            onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                            placeholder="Full Name"
                          />
                        ) : (
                          <div className="font-medium">{customer.name}</div>
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <Input
                            value={editingCustomer.userName || ""}
                            onChange={(e) => setEditingCustomer({ ...editingCustomer, userName: e.target.value })}
                            placeholder="Username"
                          />
                        ) : (
                          <div className="text-muted-foreground">@{customer.userName}</div>
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <Input
                            value={editingCustomer.phone || ""}
                            onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                            placeholder="Phone"
                          />
                        ) : (
                          <div>{customer.phone}</div>
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <Input
                            type="password"
                            value={editingCustomer.password || ""}
                            onChange={(e) => setEditingCustomer({ ...editingCustomer, password: e.target.value })}
                            placeholder="New Password (optional)"
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          {isEditing ? (
                            <>
                              <Button onClick={() => handleSaveEdit(customer.id)} size="sm" variant="default">
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button onClick={handleCancelEdit} size="sm" variant="outline">
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button onClick={() => handleEdit(customer)} variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button onClick={() => handleDelete(customer.id)} variant="destructive" size="sm">
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
            {paginatedData.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "No customers found matching your criteria." : "No customers yet."}
              </div>
            )}
          </div>

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
        </CardContent>
      </Card>
    </div>
  )
}
