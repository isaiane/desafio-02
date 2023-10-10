import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { db } from '../database'
import { randomUUID } from 'crypto'
import { checkAuthetication } from '../middlewares/check-authentication'

export const usersRoutes = async (app: FastifyInstance): Promise<void> => {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string().min(3),
      email: z.string().email(),
      password: z.string().min(8),
    })

    const { name, email, password } = createUserBodySchema.parse(request.body)

    const [user] = await db('users')
      .insert({
        id: randomUUID(),
        name,
        email,
        password,
      })
      .returning('*')

    const token = jwt.sign({ id: user.id }, 'secret', { expiresIn: '5m' })

    await db('users')
      .where({ id: user.id })
      .update({
        token,
        tokenExpiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
      })

    return reply.status(201).send({ user: { ...user, token } })
  })

  app.get('/', async (request, reply) => {
    const users = await db('users').select('*')

    return reply.status(200).send({ users })
  })

  app.get(
    '/stats',
    { preHandler: checkAuthetication },
    async (request, reply) => {
      const [totalMeals] = await db('meals')
        .where({ userId: request.user?.id })
        .count('*', { as: 'totalMeals' })

      const [totalDietMeals] = await db('meals')
        .where({ userId: request.user?.id, isDiet: true })
        .count('*', { as: 'totalDietMeals' })

      const [totalNonDietMeals] = await db('meals')
        .where({ userId: request.user?.id, isDiet: false })
        .count('*', { as: 'totalNonDietMeals' })

      const meals = await db('meals')
        .where({ userId: request.user?.id })
        .orderBy('date', 'asc')

      let currentStreak = 0
      let bestDietStreak = 0
      let inStreak = false

      for (const meal of meals) {
        const diet = Boolean(meal.isDiet)
        if (diet === true) {
          if (!inStreak) {
            inStreak = true
            currentStreak = 1
          } else {
            currentStreak++
          }

          bestDietStreak = Math.max(bestDietStreak, currentStreak)
        } else {
          inStreak = false
        }
      }

      const stats = {
        ...totalMeals,
        ...totalDietMeals,
        ...totalNonDietMeals,
        bestDietStreak,
      }

      return reply.status(200).send({ stats })
    },
  )
}
