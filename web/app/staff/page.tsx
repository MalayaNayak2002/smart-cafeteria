'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

interface Order {
  id: string
  status: string
  totalPrice: number
  createdAt: string
  user: { name: string; email: string }
  items: {
    id: string
    quantity: number
    menuItem: { name: string }
  }[]
}

export default function StaffPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) { router.push('/'); return }
    const parsed = JSON.parse(user)
    if (parsed.role !== 'STAFF') { router.push('/menu'); return }
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

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId)
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status })
      console.log('Status updated:', res.data)
      await fetchOrders()
    } catch (err: any) {
      console.error('Failed to update status:', err)
      const message = err.response?.data?.error || err.message || 'Unknown error'
      alert('Error: ' + message)
    } finally {
      setUpdating(null)
    }
  }

  const activeOrders = orders.filter(o => o.status !== 'DELIVERED')
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading orders...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">👷 Staff Dashboard</h1>
            <p className="text-sm text-gray-500">Manage incoming orders</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => { localStorage.clear(); router.push('/') }}
              className="text-sm text-gray-400 hover:text-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Active Orders */}
        <h2 className="font-bold text-gray-700 mb-3">
          Active Orders ({activeOrders.length})
        </h2>

        {activeOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400 mb-6">
            <p className="text-3xl mb-2">✅</p>
            <p>All caught up! No active orders.</p>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {activeOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">{order.user.name}</p>
                    <p className="text-xs text-gray-400">{order.user.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${order.status === 'PLACED'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                    }`}>
                    {order.status === 'PLACED' ? '🕐 Placed' : '✅ Ready'}
                  </span>
                </div>

                {/* Order items */}
                <div className="mb-3 space-y-1">
                  {order.items.map(item => (
                    <p key={item.id} className="text-sm text-gray-600">
                      • {item.menuItem.name} × {item.quantity}
                    </p>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-bold text-orange-600">₹{order.totalPrice}</span>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    {order.status === 'PLACED' && (
                      <button
                        onClick={() => updateStatus(order.id, 'READY')}
                        disabled={updating === order.id}
                        className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50"
                      >
                        {updating === order.id ? '...' : 'Mark Ready'}
                      </button>
                    )}
                    {order.status === 'READY' && (
                      <button
                        onClick={() => updateStatus(order.id, 'DELIVERED')}
                        disabled={updating === order.id}
                        className="bg-gray-600 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50"
                      >
                        {updating === order.id ? '...' : 'Mark Delivered'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delivered Orders */}
        {deliveredOrders.length > 0 && (
          <>
            <h2 className="font-bold text-gray-400 mb-3">
              Delivered ({deliveredOrders.length})
            </h2>
            <div className="space-y-2">
              {deliveredOrders.map(order => (
                <div key={order.id} className="bg-white rounded-xl p-3 opacity-60 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{order.user.name}</p>
                    <p className="text-xs text-gray-400">
                      {order.items.map(i => i.menuItem.name).join(', ')}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">🎉 Delivered • ₹{order.totalPrice}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}