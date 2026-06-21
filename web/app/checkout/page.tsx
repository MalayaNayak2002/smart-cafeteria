'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

interface CartItem {
  menuItem: { id: string; name: string; price: number }
  quantity: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [upsellSuggestions, setUpsellSuggestions] = useState<string[]>([])
  const [upsellSource, setUpsellSource] = useState('')
  const [upsellLoading, setUpsellLoading] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (!savedCart) {
      router.push('/menu')
      return
    }
    const parsedCart = JSON.parse(savedCart)
    setCart(parsedCart)
    fetchUpsell(parsedCart)
  }, [])

  const fetchUpsell = async (cartItems: CartItem[]) => {
    setUpsellLoading(true)
    try {
      const itemNames = cartItems.map(c => c.menuItem.name)
      const res = await api.post('/upsell', { cartItems: itemNames })
      setUpsellSuggestions(res.data.suggestions)
      setUpsellSource(res.data.source)
    } catch (err) {
      console.error('Upsell failed')
    } finally {
      setUpsellLoading(false)
    }
  }

  const placeOrder = async () => {
    setPlacing(true)
    setError('')
    try {
      const items = cart.map(c => ({
        menuItemId: c.menuItem.id,
        quantity: c.quantity
      }))

      await api.post('/orders', { items })
      localStorage.removeItem('cart')
      router.push('/orders')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  const total = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0)

  return (
    <div className="min-h-screen bg-orange-50">

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.push('/menu')} className="text-gray-500 hover:text-gray-700">
            ← Back
          </button>
          <h1 className="text-xl font-bold text-gray-800">Checkout</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Cart Items */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-bold text-gray-700 mb-3">Your Order</h2>
          {cart.map(item => (
            <div key={item.menuItem.id} className="flex justify-between py-2 border-b last:border-0">
              <span className="text-gray-700">
                {item.menuItem.name} × {item.quantity}
              </span>
              <span className="font-semibold text-gray-800">
                ₹{item.menuItem.price * item.quantity}
              </span>
            </div>
          ))}
          <div className="flex justify-between mt-3 pt-2 font-bold text-lg">
            <span>Total</span>
            <span className="text-orange-600">₹{total}</span>
          </div>
        </div>

        {/* AI Upsell Panel */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">✨</span>
            <h2 className="font-bold text-gray-700">You might also like</h2>
            {upsellSource && (
              <span className="ml-auto text-xs bg-yellow-200 text-yellow-700 px-2 py-1 rounded-full">
                {upsellSource === 'ai' ? '🤖 AI' : '📋 Suggested'}
              </span>
            )}
          </div>

          {upsellLoading ? (
            <p className="text-sm text-gray-400">Getting suggestions...</p>
          ) : (
            <div className="flex gap-3">
              {upsellSuggestions.map((suggestion, i) => (
                <div
                  key={i}
                  className="flex-1 bg-white border border-yellow-200 rounded-lg px-3 py-2 text-center text-sm font-medium text-gray-700"
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Place Order Button */}
        <button
          onClick={placeOrder}
          disabled={placing}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-md transition disabled:opacity-50 text-lg"
        >
          {placing ? 'Placing Order...' : `Place Order • ₹${total}`}
        </button>
      </div>
    </div>
  )
}