import { FastifySchema } from "fastify";
import { error400, error401, error403, error404, error500 } from "../utils/errorTypes";

export const postSeenSchema: FastifySchema = {
    description: 'Post a seen',
    tags: ['Seen'],
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        properties: {
            movie_id: { type: 'number', nullable: true },
            book_id: { type: 'number', nullable: true }
        }
    },
    response: {
        200: {
            description: 'Seen posted successfully',
            type: 'object',
            properties: {
                id: { type: 'number' },
                user_id: { type: 'number' },
                movie_id: { type: 'number', nullable: true },
                book_id: { type: 'number', nullable: true }
            }
        },
        400: error400,
        401: error401,
        403: error403,
        404: error404,
        500: error500
    }
}

export const deleteSeenSchema: FastifySchema = {
    description: 'Delete a seen',
    tags: ['Seen'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            id: { type: 'number' }
        }
    },
    response: {
        204: {
            description: 'Seen deleted successfully'
        },
        400: error400,
        401: error401,
        403: error403,
        404: error404,
        500: error500
    }
}