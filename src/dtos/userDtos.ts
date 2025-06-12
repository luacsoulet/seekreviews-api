import { FastifySchema } from "fastify";

export const getUsersSchema: FastifySchema = {
    description: 'Get all users',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            description: 'Users fetched successfully',
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    username: { type: 'string' },
                    email: { type: 'string' },
                    is_admin: { type: 'boolean' },
                    description: { type: 'string' }
                }
            }
        },
        401: {
            description: 'Unauthorized',
            type: 'object',
            properties: {
                message: { type: 'string' }
            }
        },
        403: {
            description: 'Forbidden',
            type: 'object',
            properties: {
                message: { type: 'string' }
            }
        },
        500: {
            description: 'Internal server error',
            type: 'object',
            properties: {
                message: { type: 'string' }
            }
        }
    }
}