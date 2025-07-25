"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchInput } from "@/components/ui/search-input"
import { Plus, Trash2, Edit, Save, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import type { Category } from "@/types"
import { categoryService } from "@/services/categoryService"
import { useSearch } from "@/hooks/useSearch"
import { useToast } from "@/hooks/use-toast"

interface CategoriesTabProps {
  categories: Category[]
  onRefresh: () => void
}

type SortField = "name" | "createdAt"
type SortDirection = "asc" | "desc"

export function CategoriesTab({ categories, onRefresh }: CategoriesTabProps) {
  const [categoryForm, setCategoryForm] = useState({ name: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState("")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const { searchQuery, setSearchQuery, filteredData } = useSearch(categories, ["name"])
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
      await categoryService.createCategory(categoryForm)
      toast({ title: "Success", description: "Category created successfully" })
      setCategoryForm({ name: "" })
      onRefresh()
    } catch (error) {
      toast({ title: "Error", description: "Failed to create category", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setEditingName(category.name)
  }

  const handleSaveEdit = async (id: number) => {
    try {
      await categoryService.updateCategory(id, { name: editingName })
      toast({ title: "Success", description: "Category updated successfully" })
      setEditingId(null)
      setEditingName("")
      onRefresh()
    } catch (error) {
      toast({ title: "Error", description: "Failed to update category", variant: "destructive" })
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName("")
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await categoryService.deleteCategory(id)
        toast({ title: "Success", description: "Category deleted successfully" })
        onRefresh()
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete category", variant: "destructive" })
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ name: e.target.value })}
                placeholder="Enter category name"
                required
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              <Plus className="w-4 h-4 mr-2" />
              {isSubmitting ? "Adding..." : "Add Category"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories List ({sortedData.length})</CardTitle>
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search categories..." />
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
                {sortedData.map((category) => {
                  const isEditing = editingId === category.id

                  return (
                    <tr key={category.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        {isEditing ? (
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="w-full"
                            autoFocus
                          />
                        ) : (
                          <div className="font-medium">{category.name}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="text-sm text-muted-foreground">
                          {new Date(category.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          {isEditing ? (
                            <>
                              <Button onClick={() => handleSaveEdit(category.id)} size="sm" variant="default">
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button onClick={handleCancelEdit} size="sm" variant="outline">
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button onClick={() => handleEdit(category)} variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button onClick={() => handleDelete(category.id)} variant="destructive" size="sm">
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
                {searchQuery ? "No categories found matching your search." : "No categories yet."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
