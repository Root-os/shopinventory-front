'use client'

import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'

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
  id: number
  customerId: number
  items: RequestItem[]
  description: string
  createdAt: string
  updatedAt: string
  Customer: Customer
}

export default function CustomerRequestsPage() {
  const [requests, setRequests] = useState<CustomerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/request`)
      if (!res.ok) {
        throw new Error('Failed to fetch')
      }

      const data = await res.json()
      setRequests(data)
    } catch (err) {
      setError((err as Error).message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this request?")
    if (!confirmed) return

    setDeletingId(id)
    try {
      const res = await fetch(`${API_BASE}/api/request/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Delete failed')

      // Optional: show success message
      const result = await res.json()
      console.log(result.message)

      // Remove from UI
      setRequests(prev => prev.filter(request => request.id !== id))
    } catch (err) {
      console.error('Failed to delete request:', err)
      alert('Failed to delete request.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customer Requests</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      {!loading && !error && requests.length === 0 && <p>No customer requests found.</p>}

      {!loading && !error && requests.length > 0 && (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="border rounded-lg p-4 shadow-sm relative">
              <button
                onClick={() => handleDelete(request.id)}
                disabled={deletingId === request.id}
                className="absolute top-2 right-2 text-red-600 text-sm border border-red-600 px-2 py-1 rounded hover:bg-red-50"
              >
                {deletingId === request.id ? 'Deleting...' : 'Delete'}
              </button>

              <div className="mb-1">
                <strong>Customer:</strong> {request.Customer.name} ({request.Customer.phone})
              </div>
              <div className="mb-1">
                <strong>Description:</strong> {request.description}
              </div>
              <div className="mb-1">
                <strong>Requested At:</strong>{' '}
                {format(new Date(request.createdAt), 'yyyy-MM-dd HH:mm')}
              </div>
              <div>
                <strong>Items:</strong>
                <ul className="list-disc list-inside">
                  {request.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name} - Quantity: {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
