'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  tags: string[]
}

interface CartItem {
  menuItem: MenuItem
  quantity: number
}

export default function MenuPage() {
  const router = useRouter()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if logged in
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (!userData || !token) {
      router.push('/')
      return
    }
    setUser(JSON.parse(userData))
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    try {
      const res = await api.get('/menu')
      setMenuItems(res.data)
    } catch (err) {
      console.error('Failed to fetch menu')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (menuItem: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === menuItem.id)
      if (existing) {
        return prev.map(c =>
          c.menuItem.id === menuItem.id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        )
      }
      return [...prev, { menuItem, quantity: 1 }]
    })
  }

  const removeFromCart = (menuItemId: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === menuItemId)
      if (existing && existing.quantity > 1) {
        return prev.map(c =>
          c.menuItem.id === menuItemId
            ? { ...c, quantity: c.quantity - 1 }
            : c
        )
      }
      return prev.filter(c => c.menuItem.id !== menuItemId)
    })
  }

  const getQuantity = (menuItemId: string) => {
    return cart.find(c => c.menuItem.id === menuItemId)?.quantity || 0
  }

  const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0)
  const totalPrice = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0)

  // Group by category
  const categories = [...new Set(menuItems.map(m => m.category))]

  const handleLogout = () => {
    localStorage.clear()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading menu...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50">

      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-orange-600">🍽️ Smart Cafeteria</h1>
            <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-500"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Menu Items by Category */}
        {categories.map(category => (
          <div key={category} className="mb-8">
            <h2 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems
                .filter(m => m.category === category)
                .map(item => (
                  <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      <p className="text-orange-600 font-bold mt-2">₹{item.price}</p>
                    </div>

                    {/* Add/Remove buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      {getQuantity(item.id) > 0 ? (
                        <>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center hover:bg-orange-200"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-semibold">
                            {getQuantity(item.id)}
                          </span>
                        </>
                      ) : null}
                      <button
                        onClick={() => addToCart(item)}
                        className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center hover:bg-orange-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4">
          <button
            onClick={() => {
              localStorage.setItem('cart', JSON.stringify(cart))
              router.push('/checkout')
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl shadow-lg font-semibold flex items-center gap-4 w-full max-w-md justify-between"
          >
            <span className="bg-orange-400 px-2 py-1 rounded-lg text-sm">
              {totalItems} items
            </span>
            <span>View Cart</span>
            <span>₹{totalPrice}</span>
          </button>
        </div>
      )}
    </div>
  )
}