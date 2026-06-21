import { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import prisma from '../prisma'

export async function authRoutes(app: FastifyInstance) {

  // Register new user
  app.post('/register', async (request, reply) => {
    const { email, password, name, role } = request.body as any

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return reply.status(400).send({ error: 'Email already exists' })

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: role || 'EMPLOYEE' }
    })

    const token = app.jwt.sign({ id: user.id, email: user.email, role: user.role })
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
  })

  // Login
  app.post('/login', async (request, reply) => {
    const { email, password } = request.body as any

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return reply.status(400).send({ error: 'Invalid email or password' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return reply.status(400).send({ error: 'Invalid email or password' })

    const token = app.jwt.sign({ id: user.id, email: user.email, role: user.role })
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
  })
}