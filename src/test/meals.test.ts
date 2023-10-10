import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest'
import { app } from '../app'
import { execSync } from 'node:child_process'

beforeAll(async () => {
  await app.ready()
})

beforeEach(async () => {
  execSync('npm run knex migrate:rollback --all')
  execSync('npm run knex migrate:latest')
})

afterAll(async () => {
  await app.close()
})

describe('Meals Routes', () => {
  it.todo('Should get user stats via GET /meals')
})
