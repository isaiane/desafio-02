import { describe, it, beforeAll, afterAll, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { execSync } from 'node:child_process'
import { app } from '../app'
import { faker } from '@faker-js/faker'

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

describe('User Routes', () => {
  it('Should create a new user via POST /users', async () => {
    const name = faker.person.fullName()
    const email = faker.internet.email()
    const password = faker.internet.password()

    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name,
        email,
        password,
      })
      .expect(201)
    expect(createUserResponse.body).toEqual({
      user: expect.objectContaining({
        name,
        email,
        password,
        token: expect.any(String),
      }),
    })
  })

  it('Should list all users via GET /users', async () => {
    await request(app.server).get('/users').expect(200)
  })

  it('Should user be abel login via POST /login', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    })

    const loginUserResponse = await request(app.server)
      .post('/login')
      .send({
        email: createUserResponse.body.user.email,
        password: createUserResponse.body.user.password,
      })
      .expect(200)
    expect(loginUserResponse.body).toHaveProperty('token')
  })

  it.todo('Should get user stats via GET /users/stats')
})
