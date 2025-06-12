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

export const getUserByIdSchema: FastifySchema = {
    description: 'Get a user by id',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    params: {
        id: { type: 'number' }
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
        400: {
            description: 'Bad request',
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
        404: {
            description: 'Not found',
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