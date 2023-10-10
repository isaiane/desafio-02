import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  DB_HOST: z.string(),
  PORT: z.number().default(3333),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Invalid environment variables:', _env.error.format())

  throw new Error(_env.error.message)
}

export const env = _env.data
