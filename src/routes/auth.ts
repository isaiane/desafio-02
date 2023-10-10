import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '../database'
import jwt from 'jsonwebtoken'

export const authRoutes = async (app: FastifyInstance): Promise<void> => {
  app.post('/login', async (request, reply) => {
    const loginBodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    })

    const { email, password } = loginBodySchema.parse(request.body)

    const user = await db('users').where({ email }).first()
    if (!user || user.password !== password) {
      return reply.status(401).send({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: user.id }, 'secret', { expiresIn: '5m' })

    await db('users')
      .where({ id: user.id })
      .update({
        token,
        tokenExpiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        lastLoginAt: new Date(),
      })

    return reply.status(200).send({ token })
  })
}
