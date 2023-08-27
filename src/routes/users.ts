import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'

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
}
