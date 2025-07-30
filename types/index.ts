export interface User {
  id: number
  username: string
  fullName: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export interface Item {
  id: number
  name: string
  categoryId: number
  unit: string
  price: string
  quantity: number
  minStockLevel: number
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: number
  name: string
  userName: string
  phone: string
  password: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  itemId: number
  quantity: number
  price: number
  unit: string
  itemName?: string
}

export interface Order {
  id: number
  customerName: string | null
  customerPhone: string | null
  customerId?: number
  items: OrderItem[]
  paid: number
  paymentType: "Cash" | "Credit"
  status: "Pending" | "Confirmed" | "Dispatched"
  totalPrice: number
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export interface AuthContextType {
  isAuthenticated: boolean
  token: string
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

export interface ThemeContextType {
  theme: "light" | "dark"
  toggleTheme: () => void
}

export interface RequestItem {
  itemId: number
  quantity: number
}

export interface CustomerRequest {
  id: number
  customerId: number
  items: RequestItem[]
  description: string
  createdAt: string
  updatedAt: string
}
