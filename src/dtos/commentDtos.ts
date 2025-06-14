import { FastifySchema } from "fastify";
import { error400, error401, error403, error404, error500 } from "../utils/errorTypes";

export const getMovieCommentsSchema: FastifySchema = {
    description: 'Get comments for a movie',
    tags: ['Comments'],
    querystring: {
        type: 'object',
        properties: {
            movie_id: { type: 'number' }
        }
    },
    response: {
        200: {
            description: 'Comments fetched successfully',
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    movie_id: { type: 'number' },
                    book_id: { type: 'number', nullable: true },
                    user_id: { type: 'number' },
                    comment: { type: 'string' },
                    created_at: { type: 'string' }
                }
            }
        },
        400: error400,
        403: error403,
        404: error404,
        500: error500
    }
}

export const getBookCommentsSchema: FastifySchema = {
    description: 'Get comments for a book',
    tags: ['Comments'],
    querystring: {
        type: 'object',
        properties: {
            book_id: { type: 'number' }
        }
    },
    response: {
        200: {
            description: 'Comments fetched successfully',
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    book_id: { type: 'number' },
                    movie_id: { type: 'number', nullable: true },
                    user_id: { type: 'number' },
                    comment: { type: 'string' },
                    created_at: { type: 'string' }
                }
            }
        },
        400: error400,
        403: error403,
        404: error404,
        500: error500
    }
}

export const createCommentSchema: FastifySchema = {
    description: 'Create a comment',
    tags: ['Comments'],
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        properties: {
            movie_id: { type: 'number', nullable: true },
            book_id: { type: 'number', nullable: true },
            comment: { type: 'string' },
        }
    },
    response: {
        200: {
            description: 'Comment created successfully',
            type: 'object',
            properties: {
                id: { type: 'number' },
                movie_id: { type: 'number', nullable: true },
                book_id: { type: 'number', nullable: true },
                user_id: { type: 'number' },
                comment: { type: 'string' },
                created_at: { type: 'string' }
            }
        },
        400: error400,
        401: error401,
        403: error403,
        404: error404,
        500: error500
    }
}