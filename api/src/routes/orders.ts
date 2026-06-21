import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import prisma from '../prisma'

export async function orderRoutes(app: FastifyInstance) {

  app.post(
    '/',
    { onRequest: [(app as any).authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = (request as any).user
        const { items } = request.body as {
          items: { menuItemId: string; quantity: number }[]
        }

        let totalPrice = 0
        const orderItems = []

        for (const item of items) {
          const menuItem = await prisma.menuItem.findUnique({
            where: { id: item.menuItemId }
          })
          if (!menuItem) {
            return reply.status(404).send({ error: 'Menu item not found' })
          }
          totalPrice += menuItem.price * item.quantity
          orderItems.push({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: menuItem.price
          })
        }

        const order = await prisma.order.create({
          data: {
            userId: user.id,
            totalPrice,
            items: { create: orderItems }
          },
          include: {
            items: { include: { menuItem: true } },
            user: true
          }
        })

        return order
      } catch (err: any) {
        console.error('Place order error:', err)
        return reply.status(500).send({ error: err.message })
      }
    }
  )

  app.get(
    '/',
    { onRequest: [(app as any).authenticate] },
    async (request: FastifyRequest) => {
      const user = (request as any).user

      if (user.role === 'STAFF') {
        return prisma.order.findMany({
          include: {
            items: { include: { menuItem: true } },
            user: true
          },
          orderBy: { createdAt: 'desc' }
        })
      }

      return prisma.order.findMany({
        where: { userId: user.id },
        include: { items: { include: { menuItem: true } } },
        orderBy: { createdAt: 'desc' }
      })
    }
  )

  app.patch(
    '/:id/status',
    { onRequest: [(app as any).authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = (request as any).user
        console.log('User trying to update status:', user)

        if (user.role !== 'STAFF') {
          return reply.status(403).send({ error: 'Staff only' })
        }

        const { id } = request.params as { id: string }
        const { status } = request.body as { status: string }

        console.log('Updating order:', id, 'to status:', status)

        const validStatuses = ['PLACED', 'READY', 'DELIVERED']
        if (!validStatuses.includes(status)) {
          return reply.status(400).send({ error: 'Invalid status' })
        }

        const order = await prisma.order.update({
          where: { id },
          data: { status: status as any },
          include: {
            items: { include: { menuItem: true } },
            user: true
          }
        })

        return order
      } catch (err: any) {
        console.error('Status update error:', err)
        return reply.status(500).send({ error: err.message })
      }
    }
  )
} 