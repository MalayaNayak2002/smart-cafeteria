'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

interface Order {
  id: string
  status: string
  totalPrice: number
  createdAt: string
  items: {
    id: string
    quantity: number
    menuItem: { name: string; price: number }
  }[]
}

const statusColors: Record<string, string> = {
  PLACED:    'bg-blue-100 text-blue-700',
  READY:     'bg-green-100 text-green-700',
  DELIVERED: 'bg-gray-100 text-gray-500',
}

const statusEmoji: Record<string, string> = {
  PLACED:    '🕐',
  READY:     '✅',
  DELIVERED: '🎉',
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders')
      setOrders(res.data)
    } catch (err) {
      console.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading orders...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50">

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/menu')} className="text-gray-500">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">My Orders</h1>
          </div>
          <button
            onClick={() => { localStorage.clear(); router.push('/') }}
            className="text-sm text-gray-400 hover:text-red-500"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🍽️</p>
            <p>No orders yet. Go order something!</p>
            <button
              onClick={() => router.push('/menu')}
              className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-400">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[order.status]}`}>
                  {statusEmoji[order.status]} {order.status}
                </span>
              </div>
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm py-1 border-b last:border-0">
                  <span className="text-gray-600">{item.menuItem.name} × {item.quantity}</span>
                  <span className="text-gray-800">₹{item.menuItem.price * item.quantity}</span>
                </div>
              ))}
              <div className="flex justify-between mt-3 font-bold">
                <span>Total</span>
                <span className="text-orange-600">₹{order.totalPrice}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}