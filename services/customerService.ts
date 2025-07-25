import { apiService } from "./api"
import type { Customer } from "@/types"

class CustomerService {
  async getCustomers(token: string) {
    return apiService.get<Customer[]>("/api/customers", token)
  }

  async createCustomer(
    customerData: { name: string; userName: string; phone: string; password: string },
    token: string,
  ) {
    return apiService.post("/api/customers", customerData, token)
  }

  async updateCustomer(id: number, customerData: Partial<Customer & { password?: string }>, token: string) {
    // Clean up the data - remove undefined/empty values
    const cleanCustomerData = Object.fromEntries(
      Object.entries(customerData).filter(([_, value]) => value !== undefined && value !== ""),
    )

    return apiService.put(`/api/customers/${id}`, cleanCustomerData, token)
  }

  async deleteCustomer(id: number, token: string) {
    return apiService.delete(`/api/customers/${id}`, token)
  }
}

export const customerService = new CustomerService()
