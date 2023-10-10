import knex, { Knex } from 'knex'
import { env } from './env'

export const config: Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: env.DB_HOST,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}

export const db = knex(config)
