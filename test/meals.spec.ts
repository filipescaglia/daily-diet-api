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

  it('should be able to update an existing meal', async () => {
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

    const updateMealResponse = await request(app.server)
      .put(`/meals/${createMealResponse.body.meal.id}`)
      .set('Cookie', cookies)
      .send({
        name: 'Refeição 2',
        description: 'Descrição da refeição 2',
        doneAt,
        withinDiet: false,
      })
      .expect(200)

    expect(updateMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Refeição 2',
        description: 'Descrição da refeição 2',
        done_at: doneAt,
        within_diet: 0,
      }),
    )
  })

  it('should be able to delete a meal', async () => {
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

    await request(app.server)
      .delete(`/meals/${createMealResponse.body.meal.id}`)
      .set('Cookie', cookies)
      .send()
      .expect(204)
  })

  it('should be able to list all meals from user', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Fulano',
      email: 'fulano@gmail.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    const doneAt = new Date().toISOString()

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Refeição 1',
      description: 'Descrição da refeição 1',
      doneAt,
      withinDiet: true,
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .send()
      .expect(200)

    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'Refeição 1',
        description: 'Descrição da refeição 1',
        done_at: doneAt,
        within_diet: 1,
      }),
    ])
  })
})
