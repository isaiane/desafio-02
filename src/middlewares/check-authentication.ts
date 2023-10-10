import { FastifyReply, FastifyRequest } from 'fastify'
import jwt from 'jsonwebtoken'
import { db } from '../database'

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string
    }
  }
}

export async function checkAuthetication(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization
  if (!authHeader) {
    return reply.status(401).send({ error: 'No token provided' })
  }

  const [bearer, token] = authHeader.split(' ')

  if (bearer !== 'Bearer') {
    return reply.status(401).send({ error: 'Invalid authorization headern' })
  }

  try {
    const decoded = jwt.verify(token, 'secret', {
      ignoreExpiration: false,
    }) as { id: string }
    const user = await db('users').where({ id: decoded.id }).first()

    if (!user) {
      return reply.status(401).send({ error: 'Invalid token' })
    }

    request.user = { id: user.id }
  } catch (error) {
    if ((error as jwt.JsonWebTokenError).name === 'TokenExpiredError') {
      const expiredError = error as jwt.TokenExpiredError
      return reply.status(401).send({ error: expiredError.message })
    }
    return reply.status(401).send({ error: 'Token expired' })
  }
}
