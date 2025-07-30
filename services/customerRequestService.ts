// services/requestService.ts
import { apiService } from "./api"

interface RequestItem {
  itemId: number
  quantity: number
}

interface CustomerRequest {
  id: number
  customerId: number
  items: RequestItem[]
  description: string
  createdAt: string
  updatedAt: string
}

class RequestService {
  async getRequests(token: string): Promise<CustomerRequest[]> {
    return apiService.get("/api/request", token)
  }

  async createRequest(data: { customerId: number; items: RequestItem[]; description: string }, token: string) {
    return apiService.post("/api/request", data, token)
  }

  async updateRequest(id: number, data: Partial<CustomerRequest>, token: string) {
    return apiService.put(`/api/request/${id}`, data, token)
  }

  async deleteRequest(id: number, token: string) {
    return apiService.delete(`/api/request/${id}`, token)
  }
}

export const requestService = new RequestService()
