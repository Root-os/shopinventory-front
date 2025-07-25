import { apiService } from "./api"
import type { User } from "@/types"

class AuthService {
  async login(username: string, password: string) {
    const response = await apiService.post<{ token: string; user: User }>("/api/auth/login", {
      username,
      password,
    })
    return response
  }

  async register(userData: { fullName: string; username: string; password: string; role: string }) {
    return apiService.post("/api/auth/register", userData)
  }

  async getUsers(token: string) {
    return apiService.get<User[]>("/api/auth", token)
  }

  async updateUser(id: number, userData: Partial<User & { password?: string }>, token: string) {
    // Clean up the data - remove undefined/empty values
    const cleanUserData = Object.fromEntries(
      Object.entries(userData).filter(([_, value]) => value !== undefined && value !== ""),
    )

    return apiService.put(`/api/auth/${id}`, cleanUserData, token)
  }

  async deleteUser(id: number, token: string) {
    return apiService.delete(`/api/auth/${id}`, token)
  }
}

export const authService = new AuthService()
