import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { checkUserExists } from '../middlewares/check-user-exists'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, response) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
    })

    const { name, email } = createUserBodySchema.parse(request.body)
    const sessionId = randomUUID()

    const user = (
      await knex('users')
        .insert({
          id: randomUUID(),
          name,
          email,
          session_id: sessionId,
        })
        .returning('*')
    )[0]

    return response
      .status(201)
      .setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
      .send({ user })
  })

  app.get(
    '/metrics',
    {
      preHandler: [checkSessionIdExists, checkUserExists],
    },
    async (request, response) => {
      const meals = await knex('meals')
        .where('user_id', request.user)
        .orderBy('done_at')

      const totalMeals = meals.length
      const totalMealsWithinDiet = meals.filter(
        (meal) => meal.within_diet,
      ).length
      const totalMealsOutsideDiet = totalMeals - totalMealsWithinDiet
      let bestSequenceWithinDiet = 0
      let currentSequence = 0

      meals.forEach((meal) => {
        if (meal.within_diet) {
          currentSequence++
        } else {
          if (currentSequence > bestSequenceWithinDiet) {
            bestSequenceWithinDiet = currentSequence
          }
          currentSequence = 0
        }
      })

      if (currentSequence > bestSequenceWithinDiet) {
        bestSequenceWithinDiet = currentSequence
      }

      return response.send({
        metrics: {
          totalMeals,
          totalMealsWithinDiet,
          totalMealsOutsideDiet,
          bestSequenceWithinDiet,
        },
      })
    },
  )
}
