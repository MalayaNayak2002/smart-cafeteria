import { FastifyInstance } from 'fastify'
import prisma from '../prisma'

export async function menuRoutes(app: FastifyInstance) {

  // Get all menu items
  app.get('/', async () => {
    return prisma.menuItem.findMany({ where: { isAvailable: true } })
  })

  // Add menu item (staff only)
  app.post('/', { onRequest: [(app as any).authenticate] }, async (request, reply) => {
    const user = (request as any).user
    if (user.role !== 'STAFF') return reply.status(403).send({ error: 'Staff only' })

    const { name, description, price, category, tags } = request.body as any
    return prisma.menuItem.create({
      data: { name, description, price, category, tags: tags || [] }
    })
  })
}