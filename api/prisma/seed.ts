import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create test users
  const employeePass = await bcrypt.hash('password123', 10)
  const staffPass = await bcrypt.hash('password123', 10)

  await prisma.user.upsert({
    where: { email: 'employee@cafe.com' },
    update: {},
    create: { email: 'employee@cafe.com', password: employeePass, name: 'John Employee', role: 'EMPLOYEE' }
  })

  await prisma.user.upsert({
    where: { email: 'staff@cafe.com' },
    update: {},
    create: { email: 'staff@cafe.com', password: staffPass, name: 'Jane Staff', role: 'STAFF' }
  })

  // Create 10 menu items
  const menuItems = [
    { name: 'Veg Burger', description: 'Crispy veggie patty with fresh veggies', price: 80, category: 'Main', tags: ['burger', 'veg'] },
    { name: 'Chicken Burger', description: 'Juicy chicken patty with sauce', price: 120, category: 'Main', tags: ['burger', 'chicken'] },
    { name: 'Margherita Pizza', description: 'Classic tomato and cheese pizza', price: 150, category: 'Main', tags: ['pizza', 'veg'] },
    { name: 'Cappuccino', description: 'Rich espresso with steamed milk foam', price: 60, category: 'Beverage', tags: ['coffee', 'hot'] },
    { name: 'Masala Tea', description: 'Spiced Indian chai', price: 20, category: 'Beverage', tags: ['tea', 'hot'] },
    { name: 'Club Sandwich', description: 'Triple-decker sandwich with veggies', price: 90, category: 'Snack', tags: ['sandwich', 'veg'] },
    { name: 'Pasta Arrabbiata', description: 'Spicy tomato pasta', price: 130, category: 'Main', tags: ['pasta', 'veg'] },
    { name: 'Caesar Salad', description: 'Fresh romaine with caesar dressing', price: 110, category: 'Salad', tags: ['salad', 'healthy'] },
    { name: 'Veg Biryani', description: 'Fragrant basmati rice with vegetables', price: 100, category: 'Main', tags: ['rice', 'veg'] },
    { name: 'Chocolate Muffin', description: 'Freshly baked chocolate muffin', price: 45, category: 'Snack', tags: ['muffin', 'sweet'] },
    
  ]

  for (const item of menuItems) {
    await prisma.menuItem.create({ data: item })
  }

  await prisma.menuItem.upsert({
  where: { id: 'dosa-item-001' },
  update: {},
  create: {
    id: 'dosa-item-001',
    name: 'Dosa',
    description: 'Crispy South Indian rice crepe',
    price: 60,
    category: 'Main',
    tags: ['dosa', 'veg'],
    isAvailable: true
  }
})
console.log('✅ Dosa added!')

  console.log('✅ Database seeded successfully!')
  console.log('👤 Employee login: employee@cafe.com / password123')
  console.log('👤 Staff login:    staff@cafe.com / password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())