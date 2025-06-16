import { FastifySchema } from "fastify";

export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    username: string;
    email: string;
    password: string;
}

export const loginSchema: FastifySchema = {
    description: 'Authenticate a user and return a JWT token',
    tags: ['Authentication'],
    body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
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
        200: {
            description: 'Login successful',
            type: 'object',
            properties: {
                token: {
                    type: 'string',
                    description: 'JWT token for authentication'
                },
                user: {
                    type: 'object',
                    description: 'User information',
                    properties: {
                        id: {
                            type: 'number',
                            description: 'Unique user identifier'
                        },
                        email: {
                            type: 'string',
                            description: 'User email'
                        },
                        username: {
                            type: 'string',
                            description: 'User username'
                        },
                        is_admin: {
                            type: 'boolean',
                            description: 'Whether the user is an admin'
                        },
                        description: {
                            type: 'string',
                            description: 'User description'
                        }
                    }
                }
            }
        },
        400: {
            description: 'Bad request',
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message'
                }
            }
        },
        401: {
            description: 'Authentication failed',
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message'
                }
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
};

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

export const verifyTokenSchema: FastifySchema = {
    description: 'Verify a JWT token',
    tags: ['Authentication'],
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            description: 'Token verified successfully',
            type: 'object',
            properties: {
                id: { type: 'number' },
                email: { type: 'string' },
                username: { type: 'string' },
                is_admin: { type: 'boolean' }
            }
        },
        401: {
            description: 'Token verification failed',
            type: 'object',
            properties: {
                message: { type: 'string' }
            }
        }
    }
}