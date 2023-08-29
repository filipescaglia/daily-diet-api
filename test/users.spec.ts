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

  it('should be able to see his own metrics', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Fulano',
      email: 'fulano@gmail.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    for (let i = 1; i <= 10; i++) {
      await request(app.server)
        .post('/meals')
        .set('Cookie', cookies)
        .send({
          name: `Refeição ${i}`,
          description: `Descrição da refeição ${i}`,
          doneAt: new Date().toISOString(),
          withinDiet: i < 6,
        })
    }

    const metricsResponse = await request(app.server)
      .get('/users/metrics')
      .set('Cookie', cookies)
      .expect(200)

    expect(metricsResponse.body.metrics).toEqual({
      totalMeals: 10,
      totalMealsWithinDiet: 5,
      totalMealsOutsideDiet: 5,
      bestSequenceWithinDiet: 5,
    })
  })
})
