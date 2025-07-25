import { apiService } from "./api"
import type { Category } from "@/types"

class CategoryService {
  async getCategories() {
    return apiService.get<Category[]>("/api/item-categories")
  }

  async createCategory(categoryData: { name: string }) {
    return apiService.post("/api/item-categories", categoryData)
  }

  async updateCategory(id: number, categoryData: { name: string }) {
    return apiService.put(`/api/item-categories/${id}`, categoryData)
  }

  async deleteCategory(id: number) {
    return apiService.delete(`/api/item-categories/${id}`)
  }
}

export const categoryService = new CategoryService()
