import { FastifySchema } from "fastify";
import { error400, error401, error403, error404, error500 } from "../utils/errorTypes";

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
        401: error401,
        403: error403,
        500: error500
    }
}

export const getUserByIdSchema: FastifySchema = {
    description: 'Get a user by id',
    tags: ['Users'],
    params: {
        type: 'object',
        properties: {
            id: { type: 'number' }
        }
    },
    response: {
        200: {
            description: 'User fetched successfully',
            type: 'object',
            properties: {
                id: { type: 'number' },
                username: { type: 'string' },
                email: { type: 'string' },
                is_admin: { type: 'boolean' },
                description: { type: 'string' }
            }
        },
        400: error400,
        403: error403,
        404: error404,
        500: error500
    }
}