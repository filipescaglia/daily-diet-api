import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'
import { execSync } from 'child_process'
import request from 'supertest'

describe('Meals routes', () => {
  beforeAll(async () => await app.ready())

  afterAll(async () => await app.close())

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Fulano',
      email: 'fulano@gmail.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    const doneAt = new Date().toISOString()

    const createMealResponse = await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Refeição 1',
        description: 'Descrição da refeição 1',
        doneAt,
        withinDiet: true,
      })
      .expect(201)

    expect(createMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Refeição 1',
        description: 'Descrição da refeição 1',
        done_at: doneAt,
        within_diet: 1,
      }),
    )
  })
})
