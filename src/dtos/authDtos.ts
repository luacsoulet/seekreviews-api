import { FastifySchema } from "fastify";

export interface RegisterDto {
    username: string;
    email: string;
    password: string;
}

export const registerSchema: FastifySchema = {
    description: 'Register a new user and return the user information',
    tags: ['Authentication'],
    body: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
            username: {
                type: 'string',
                description: 'User username'
            },
            email: {
                type: 'string',
                format: 'email',
                description: 'User email'
            },
            password: {
                type: 'string',
                minLength: 6,
                description: 'User password (minimum 6 characters)'
            }
        },
        additionalProperties: false
    },
    response: {
        201: {
            description: 'User registered successfully',
            type: 'object',
            properties: {
                id: { type: 'number' },
                username: { type: 'string' },
                email: { type: 'string' }
            }
        },
        400: {
            description: 'Bad request',
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