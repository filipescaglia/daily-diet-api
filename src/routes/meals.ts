import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { checkUserExists } from '../middlewares/check-user-exists'
import { knex } from '../database'
import { randomUUID } from 'crypto'

export async function mealsRoutes(app: FastifyInstance) {
  app.decorateRequest('userId', '')

  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists, checkUserExists],
    },
    async (request, response) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        doneAt: z.string().datetime({ offset: true }),
        withinDiet: z.boolean(),
      })

      const { name, description, doneAt, withinDiet } =
        createMealBodySchema.parse(request.body)

      const userId = String(request.user)
      const meal = (
        await knex('meals')
          .insert({
            id: randomUUID(),
            name,
            description,
            done_at: doneAt,
            within_diet: withinDiet,
            user_id: userId,
          })
          .returning('*')
      )[0]

      return response.status(201).send({ meal })
    },
  )
}
