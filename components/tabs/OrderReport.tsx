'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { Download, Filter } from 'lucide-react'

interface Props {
  token: string
}

type OrderItem = {
  name: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
}

type Order = {
  orderId: number
  date: string
  customer: { name: string; phone: string }
  items: OrderItem[]
  orderTotal: number
}

export default function OrdersReportPage({ token }: Props) {
  const [filterType, setFilterType] = useState<'day' | 'range'>('day')
  const [date, setDate] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const body = filterType === 'day' ? { date } : { startDate, endDate }

    try {
      const res = await fetch(`${API_BASE}/api/orders/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Failed to fetch orders')
      const data = await res.json()
      setOrders(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2"> Order Report</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-muted p-4 rounded-lg mb-6 space-y-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <Filter className="text-muted-foreground" />
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={filterType === 'day'}
              onChange={() => setFilterType('day')}
            />
            <span>By Day</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={filterType === 'range'}
              onChange={() => setFilterType('range')}
            />
            <span>By Date Range</span>
          </label>
        </div>

        {filterType === 'day' ? (
          <div>
            <label className="block text-sm font-medium mb-1">Select a Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded px-3 py-2 w-64"
              required
            />
          </div>
        ) : (
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded px-3 py-2"
                required
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="bg-primary text-white px-5 py-2 rounded hover:bg-primary/90 transition"
        >
          {loading ? 'Loading...' : 'Generate Report'}
        </button>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      {!loading && orders.length === 0 && !error && (
        <p className="text-muted-foreground">No orders found for the selected filter.</p>
      )}

      {orders.length > 0 && (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.orderId}
              className="bg-background border rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">Order #{order.orderId}</h2>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(order.date), 'yyyy-MM-dd')}
                </p>
              </div>

              <p className="mb-2">
                <strong>Customer:</strong> {order.customer.name} (
                {order.customer.phone})
              </p>

              <table className="w-full text-sm mb-3 border-collapse">
                <thead>
                  <tr className="bg-muted text-muted-foreground">
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-right">Qty</th>
                    <th className="p-2 text-right">Unit</th>
                    <th className="p-2 text-right">Unit Price</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2 text-right">{item.quantity}</td>
                      <td className="p-2 text-right">{item.unit}</td>
                      <td className="p-2 text-right">{item.unitPrice.toFixed(2)}</td>
                      <td className="p-2 text-right font-medium">
                        {item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="text-right font-semibold text-primary">
                Total: {order.orderTotal.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
