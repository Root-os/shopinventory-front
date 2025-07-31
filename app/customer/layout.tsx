import { CustomerAuthProvider } from "@/contexts/CustomerContext"

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerAuthProvider>
      {children}
    </CustomerAuthProvider>
  )
}
