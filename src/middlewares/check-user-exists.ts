import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'

export async function checkUserExists(
  request: FastifyRequest,
  response: FastifyReply,
) {
  const { sessionId } = request.cookies

  const user = await knex('users').where('session_id', sessionId).first()
  if (!user) {
    return response.status(404).send({
      error: 'User not found.',
    })
  }
  request.user = user.id
}
