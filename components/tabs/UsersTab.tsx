"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/ui/search-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Plus, Trash2, Edit, Save, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import type { User } from "@/types"
import { authService } from "@/services/authService"
import { useAuth } from "@/contexts/AuthContext"
import { useSearch } from "@/hooks/useSearch"
import { usePagination } from "@/hooks/usePagination"
import { useToast } from "@/hooks/use-toast"

interface UsersTabProps {
  users: User[]
  onRefresh: () => void
}

type SortField = "fullName" | "username" | "role" | "createdAt"
type SortDirection = "asc" | "desc"

export function UsersTab({ users, onRefresh }: UsersTabProps) {
  const [userForm, setUserForm] = useState({
    fullName: "",
    username: "",
    password: "",
    role: "admin",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingUser, setEditingUser] = useState<Partial<User & { password?: string }>>({})
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const { token } = useAuth()
  const { searchQuery, setSearchQuery, filteredData } = useSearch(users, ["fullName", "username"])
  const { toast } = useToast()

  const filteredUsers = filteredData.filter((user) => roleFilter === "all" || user.role === roleFilter)

  // Sorting function
  const sortedUsers = [...filteredUsers].sort((a, b) => {
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
    sortedUsers,
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
      await authService.register(userForm)
      toast({ title: "Success", description: "User created successfully" })
      setUserForm({
        fullName: "",
        username: "",
        password: "",
        role: "admin",
      })
      onRefresh()
    } catch (error) {
      toast({ title: "Error", description: "Failed to create user", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingId(user.id)
    setEditingUser({
      fullName: user.fullName,
      username: user.username,
      role: user.role,
      password: "", // Always start with empty password
    })
  }

  const handleSaveEdit = async (id: number) => {
    try {
      console.log("🔍 Saving user edit:", { id, editingUser })

      // Validate required fields
      if (!editingUser.fullName?.trim()) {
        toast({ title: "Error", description: "Full name is required", variant: "destructive" })
        return
      }
      if (!editingUser.username?.trim()) {
        toast({ title: "Error", description: "Username is required", variant: "destructive" })
        return
      }
      if (!editingUser.role?.trim()) {
        toast({ title: "Error", description: "Role is required", variant: "destructive" })
        return
      }

      await authService.updateUser(id, editingUser, token)
      toast({ title: "Success", description: "User updated successfully" })
      setEditingId(null)
      setEditingUser({})
      onRefresh()
    } catch (error: any) {
      console.error("❌ User update error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingUser({})
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await authService.deleteUser(id, token)
        toast({ title: "Success", description: "User deleted successfully" })
        onRefresh()
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete user", variant: "destructive" })
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={userForm.fullName}
                onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                placeholder="Enter full name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={userForm.username}
                onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                placeholder="Enter username"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                placeholder="Enter password"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={userForm.role}
                onValueChange={(value) => setUserForm({ ...userForm, role: value })}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="storekeeper">Storekeeper</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              <Plus className="w-4 h-4 mr-2" />
              {isSubmitting ? "Adding..." : "Add User"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Users List ({sortedUsers.length})</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search users..."
              className="flex-1"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="storekeeper">Storekeeper</SelectItem>
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
                      onClick={() => handleSort("fullName")}
                      className="font-semibold p-0 h-auto"
                    >
                      Full Name
                      {getSortIcon("fullName")}
                    </Button>
                  </th>
                  <th className="text-left p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("username")}
                      className="font-semibold p-0 h-auto"
                    >
                      Username
                      {getSortIcon("username")}
                    </Button>
                  </th>
                  <th className="text-left p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("role")}
                      className="font-semibold p-0 h-auto"
                    >
                      Role
                      {getSortIcon("role")}
                    </Button>
                  </th>
                  <th className="text-left p-3">Password</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((user) => {
                  const isEditing = editingId === user.id

                  return (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        {isEditing ? (
                          <Input
                            value={editingUser.fullName || ""}
                            onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                            placeholder="Full Name"
                            required
                          />
                        ) : (
                          <div className="font-medium">{user.fullName}</div>
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <Input
                            value={editingUser.username || ""}
                            onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                            placeholder="Username"
                            required
                          />
                        ) : (
                          <div className="text-muted-foreground">@{user.username}</div>
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <Select
                            value={editingUser.role || ""}
                            onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="storekeeper">Storekeeper</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline">{user.role}</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <Input
                            type="password"
                            value={editingUser.password || ""}
                            onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                            placeholder="New Password (optional)"
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground">••••••••</div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          {isEditing ? (
                            <>
                              <Button onClick={() => handleSaveEdit(user.id)} size="sm" variant="default">
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button onClick={handleCancelEdit} size="sm" variant="outline">
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button onClick={() => handleEdit(user)} variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button onClick={() => handleDelete(user.id)} variant="destructive" size="sm">
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
                {searchQuery || roleFilter !== "all" ? "No users found matching your criteria." : "No users yet."}
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
