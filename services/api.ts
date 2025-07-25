const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6000"

class ApiService {
  private getHeaders(token?: string) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return headers
  }

  async request<T>(endpoint: string, options: RequestInit = {}, token?: string): Promise<T> {
    const url = `${API_BASE}${endpoint}`
    const config: RequestInit = {
      headers: this.getHeaders(token),
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json()
    } catch (error: any) {
      // Check if it's a network error
      if (error.name === "TypeError" && error.message.includes("NetworkError")) {
        throw new Error(`Cannot connect to API server at ${API_BASE}`)
      }

      // Check if it's a fetch error
      if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
        throw new Error(`Cannot connect to API server at ${API_BASE}`)
      }

      throw error
    }
  }

  async post<T>(endpoint: string, data: any, token?: string): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token,
    )
  }

  async get<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" }, token)
  }

  async put<T>(endpoint: string, data: any, token?: string): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      token,
    )
  }

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" }, token)
  }
}

export const apiService = new ApiService()
