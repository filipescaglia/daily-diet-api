import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'child_process'

describe('Users routes', () => {
  beforeAll(async () => await app.ready())

  afterAll(async () => await app.close())

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new user', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'Fulano',
        email: 'fulano@gmail.com',
      })
      .expect(201)

    expect(createUserResponse.body.user).toEqual(
      expect.objectContaining({
        name: 'Fulano',
        email: 'fulano@gmail.com',
      }),
    )
  })
})
