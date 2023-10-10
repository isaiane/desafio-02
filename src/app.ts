import fastify from 'fastify'
import { usersRoutes } from './routes/users'
import { authRoutes } from './routes/auth'
import { mealRoutes } from './routes/meals'

export const app = fastify()

app.register(authRoutes)
app.register(usersRoutes, { prefix: '/users' })
app.register(mealRoutes, { prefix: '/meals' })
