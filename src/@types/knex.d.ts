// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      password: string
      createdAt: string
      updatedAt: string
      lastLoginAt: string | null
      token: string | null
      tokenExpiresAt: Date | null
    }
    meals: {
      id: string
      name: string
      description: string
      date: string
      time: string
      isDiet: boolean
      userId: string
      createdAt: string
      updatedAt: string
    }
  }
}
