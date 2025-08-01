"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import RespondModal from "@/components/reusabe/responseModal"
interface RequestItem {
  itemId: number
  name: string
  quantity: number
}

interface Customer {
  id: number
  name: string
  phone: string
}
interface CustomerRequest {
  status: any
  id: number
  customerId: number
  items: RequestItem[]
  description: string
  createdAt: string
  updatedAt: string
  Customer: Customer
}

interface RequestResponse {
  id: number
  requestId: number
  status: string
  reason?: string
  createdAt: string
  updatedAt: string
}

export default function CustomerRequestsPage() {
  const [requests, setRequests] = useState<CustomerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [responses, setResponses] = useState<RequestResponse[]>([])
  const [selectedRequest, setSelectedRequest] = useState<CustomerRequest | null>(null)
  const [showModal, setShowModal] = useState(false)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/request`)
      if (!res.ok) throw new Error("Failed to fetch")

      const data = await res.json()
      setRequests(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const fetchResponses = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/request/response`)
    if (!res.ok) throw new Error("Failed to fetch responses")
    const data = await res.json()
    setResponses(data)
  } catch (err) {
    console.error("Error fetching responses:", err)
  }}

useEffect(() => {
  fetchRequests()
  fetchResponses()
}, [])

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this request?")
    if (!confirmed) return

    setDeletingId(id)
    try {
      const res = await fetch(`${API_BASE}/api/request/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Delete failed")
      setRequests((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      alert("Failed to delete request.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customer Requests</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {!loading && !error && requests.length === 0 && (
        <p>No customer requests found.</p>
      )}

      {!loading && !error && requests.length > 0 && (
        <ScrollArea className="rounded-md border max-h-[75vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-64">Customer</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Response Reason</TableHead>
                <TableHead className="w-24 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    {req.Customer.name} <br />
                    <span className="text-muted-foreground text-xs">{req.Customer.phone}</span>
                  </TableCell>
                  <TableCell>{req.description}</TableCell>
                  <TableCell>
                    {format(new Date(req.createdAt), "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell>
                    <ul className="space-y-1 max-h-32 overflow-auto pr-2">
                      {req.items.map((item) => (
                        <li key={item.itemId}>
                          <span className="font-medium">{item.name}</span> — {item.quantity} pcs
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${
                        {
                          pending: "bg-gray-100 text-gray-800",
                          confirmed: "bg-blue-100 text-blue-800",
                          approved: "bg-green-100 text-green-800",
                          rejected: "bg-red-100 text-red-800",
                        }[req.status]
                      }`}
                    >
                      {req.status}
                    </span>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground italic max-w-[200px] break-words">
                    {
                      responses.find(r => r.requestId === req.id)?.reason ?? (
                        <span className="text-gray-400">—</span>
                      )
                    }
                  </TableCell>

                 <TableCell className="text-center space-y-2">
                     <button
                      onClick={() => handleDelete(req.id)}
                      disabled={deletingId === req.id}
                      className="text-red-600 text-sm hover:underline"
                    >
                      {deletingId === req.id ? "Deleting..." : "Delete"}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(req)
                        setShowModal(true)
                      }}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Respond
                    </button>
                 </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}

      <RespondModal
      open={showModal}
      onClose={() => setShowModal(false)}
      request={selectedRequest}
      onRespond={() => {
        fetchResponses()
        fetchRequests()
      }}
    />

    </div>
  )
}
