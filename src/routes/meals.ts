import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { checkUserExists } from '../middlewares/check-user-exists'
import { knex } from '../database'
import { randomUUID } from 'crypto'

interface IParams {
  id: string
}

export async function mealsRoutes(app: FastifyInstance) {
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

  app.put<{ Params: IParams }>(
    '/:id',
    {
      preHandler: [checkSessionIdExists, checkUserExists],
    },
    async (request, response) => {
      const meal = await knex('meals').where('id', request.params.id).first()
      if (!meal) {
        return response.status(404).send({
          error: 'Meal not found.',
        })
      }

      const updateMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        doneAt: z.string().datetime({ offset: true }),
        withinDiet: z.boolean(),
      })

      const { name, description, doneAt, withinDiet } =
        updateMealBodySchema.parse(request.body)

      const userId = String(request.user)
      const updatedMeal = (
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

      return response.status(200).send({ meal: updatedMeal })
    },
  )
}