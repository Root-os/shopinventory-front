import { apiService } from "./api"
import type { Item } from "@/types"

class ItemService {
  async getItems(token: string) {
    return apiService.get<Item[]>("/api/items", token)
  }

  async createItem(
    itemData: {
      name: string
      categoryId: number
      unit: string
      price: number
      quantity: number
      minStockLevel: number
    },
    token: string,
  ) {
    return apiService.post("/api/items", itemData, token)
  }

  async updateItem(
    id: number,
    itemData: {
      name: string
      categoryId: number
      unit: string
      price: number
      quantity: number
      minStockLevel: number
    },
    token: string,
  ) {
    return apiService.put(`/api/items/${id}`, itemData, token)
  }

  async deleteItem(id: number, token: string) {
    return apiService.delete(`/api/items/${id}`, token)
  }
}

export const itemService = new ItemService()
