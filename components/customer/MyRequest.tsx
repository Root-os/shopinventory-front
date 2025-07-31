"use client"

import { useEffect, useState } from "react"
import { useCustomerAuth } from "@/contexts/CustomerContext"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Item {
  itemId: number
  name: string
  quantity: number
}

interface Customer {
  id: number
  name: string
  phone: string
}

interface Request {
  id: number
  customerId: number
  description: string
  items: Item[]
  createdAt: string
  Customer: Customer
}

export default function CustomerRequestsList() {
  const { customer } = useCustomerAuth()
  const { toast } = useToast()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [editRequest, setEditRequest] = useState<Request | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    const fetchRequests = async () => {
      if (!customer?.id) return

      try {
        setLoading(true)
        const res = await fetch(`${API_BASE}/api/request/customer/${customer.id}`)
        if (!res.ok) throw new Error("Failed to fetch customer requests")

        const data = await res.json()
        setRequests(data)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Could not load requests",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [customer, toast])

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return

    try {
      const res = await fetch(`${API_BASE}/api/request/${id}`, {
        method: "DELETE"
      })

      if (!res.ok) throw new Error("Failed to delete")

      toast({ title: "Deleted", description: "Request deleted successfully." })
      setRequests((prev) => prev.filter((r) => r.id !== id))
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleUpdate = async () => {
    if (!editRequest) return
    setIsSubmitting(true)

    try {
      const res = await fetch(`${API_BASE}/api/request/${editRequest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: editRequest.description,
          items: editRequest.items.map((i) => ({
            itemId: i.itemId,
            quantity: i.quantity
          }))
        })
      })

      if (!res.ok) throw new Error("Update failed")

      toast({ title: "Success", description: "Request updated successfully." })
      setEditRequest(null)

      const updatedRes = await fetch(`${API_BASE}/api/request/customer/${customer?.id}`)
      const updatedData = await updatedRes.json()
      setRequests(updatedData)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <p className="text-center text-muted-foreground">Loading your requests...</p>
  }

  if (requests.length === 0) {
    return <p className="text-center text-muted-foreground">No requests submitted yet.</p>
  }

  return (
    <>
      <ScrollArea className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Items</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-32">Date</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>
                  <ul className="space-y-1 max-h-40 overflow-auto pr-2">
                    {req.items.map((item) => (
                      <li key={item.itemId} className="text-sm">
                        <span className="font-semibold">{item.name}</span> — {item.quantity} pcs
                      </li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>{req.description}</TableCell>
                <TableCell>{format(new Date(req.createdAt), "yyyy-MM-dd")}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setEditRequest(req)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(req.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* EDIT MODAL */}
      {editRequest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg space-y-4">
            <h2 className="text-lg font-bold">Edit Request #{editRequest.id}</h2>

            <label className="block text-sm font-medium">Description</label>
            <Input
              value={editRequest.description}
              onChange={(e) =>
                setEditRequest({ ...editRequest, description: e.target.value })
              }
            />

            <div className="space-y-2">
              <p className="font-medium">Items & Quantities</p>
              {editRequest.items.map((item, index) => (
                <div key={item.itemId} className="flex items-center space-x-2">
                  <span className="w-40">{item.name}</span>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => {
                      const updatedItems = [...editRequest.items]
                      updatedItems[index].quantity = parseInt(e.target.value) || 1
                      setEditRequest({ ...editRequest, items: updatedItems })
                    }}
                    className="w-24"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditRequest(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
