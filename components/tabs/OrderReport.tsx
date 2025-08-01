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

  const API_BASE = process.env.NEXT_PUBLIC_API_URL 

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
    <div className="p-6 max-w-6xl mx-auto print:p-0 print:mt-0">
      <div className="mb-6 print:hidden">
        <h1 className="text-3xl font-bold text-foreground mb-2">Order Report</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-muted p-4 rounded-lg mb-6 space-y-4 shadow-sm print:hidden">
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

      {error && <p className="text-red-600 print:hidden">{error}</p>}

      {!loading && orders.length === 0 && !error && (
        <p className="text-muted-foreground print:hidden">No orders found for the selected filter.</p>
      )}

      {orders.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm print:text-xs">
            <thead>
              <tr className="bg-muted text-muted-foreground">
                
              <th className="border p-2 text-left">Customer</th>
              <th className="border p-2 text-left">Phone</th>
              <th className="border p-2 text-left">Items</th>
              <th className="border p-2 text-right">Total (ETB)</th>
              <th className="border p-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderId}>
                  <td className="border p-2">{order.customer.name}</td>
                  <td className="border p-2">{order.customer.phone}</td>
                  <td className="border p-2">
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          <th className="p-1 text-left">Item</th>
                          <th className="p-1 text-right">Qty</th>
                          <th className="p-1 text-right">Unit</th>
                          <th className="p-1 text-right">Price</th>
                          <th className="p-1 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-1">{item.name}</td>
                            <td className="p-1 text-right">{item.quantity}</td>
                            <td className="p-1 text-right">{item.unit}</td>
                            <td className="p-1 text-right">{item.unitPrice.toFixed(2)}</td>
                            <td className="p-1 text-right">{item.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                  <td className="border p-2 text-right font-semibold">{order.orderTotal.toFixed(2)}</td>
                  <td className="border p-2">{format(new Date(order.date), 'yyyy-MM-dd')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
