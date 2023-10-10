import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '../database'
import { checkAuthetication } from '../middlewares/check-authentication'

export const mealRoutes = async (app: FastifyInstance): Promise<void> => {
  app.post('/', { preHandler: checkAuthetication }, async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string(),
      time: z.string(),
      isDiet: z.boolean(),
    })

    const { name, description, date, time, isDiet } =
      createMealBodySchema.parse(request.body)

    const [meal] = await db('meals')
      .insert({
        id: randomUUID(),
        name,
        description,
        date,
        time,
        isDiet,
        userId: request.user?.id,
      })
      .returning('*')

    return reply.status(201).send({ meal })
  })

  app.get('/', { preHandler: checkAuthetication }, async (request, reply) => {
    const meals = await db('meals').where({ userId: request.user?.id })

    return reply.send({ total: meals.length, meals })
  })

  app.put(
    '/:id',
    { preHandler: checkAuthetication },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      const updateMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.string(),
        time: z.string(),
        isDiet: z.boolean(),
      })

      const { name, description, date, time, isDiet } =
        updateMealBodySchema.parse(request.body)

      const now = new Date()
        .toISOString()
        .replace('T', ' ')
        .replace(/\.\d{3}Z$/, '')

      const [meal] = await db('meals')
        .where({ id, userId: request.user?.id })
        .update({
          name,
          description,
          date,
          time,
          isDiet,
          updatedAt: now,
        })
        .returning('*')

      return reply.status(201).send({ meal })
    },
  )

  app.delete(
    '/:id',
    { preHandler: checkAuthetication },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      await db('meals')
        .where({ id, userId: request.user?.id })
        .delete()

      return reply.status(204).send()
    },
  )

  app.get(
    '/:id',
    { preHandler: checkAuthetication },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      const meal = await db('meals')
        .where({ id, userId: request.user?.id })
        .first()

      if (meal === undefined)
        return reply.status(404).send({ error: 'Meal not found' })

      return reply.send({ meal })
    },
  )
}
