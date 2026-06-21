import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { authRoutes } from './routes/auth'
import { menuRoutes } from './routes/menu'
import { orderRoutes } from './routes/orders'
import { upsellRoutes } from './routes/upsell'

const app = Fastify({ logger: true })

// Register plugins
app.register(cors, {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
})
app.register(jwt, { secret: process.env.JWT_SECRET || 'secret123' })

// Auth helper - checks if user is logged in
app.decorate('authenticate', async function(request: any, reply: any) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.status(401).send({ error: 'Please login first' })
  }
})

// Register all routes
app.register(authRoutes, { prefix: '/auth' })
app.register(menuRoutes, { prefix: '/menu' })
app.register(orderRoutes, { prefix: '/orders' })
app.register(upsellRoutes, { prefix: '/upsell' })

// Start server
const start = async () => {
  try {
    await app.listen({ port: 3001, host: '0.0.0.0' })
    console.log('🚀 Server running on http://localhost:3001')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()