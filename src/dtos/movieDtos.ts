import { FastifySchema } from "fastify";
import { error400, error401, error403, error404, error500 } from "../utils/errorTypes";

export const getMoviesSchema: FastifySchema = {
    description: 'Get all movies',
    tags: ['Movies'],
    response: {
        200: {
            description: 'Movies fetched successfully',
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    title: { type: 'string' },
                    cover_image: { type: 'string' },
                    description: { type: 'string' },
                    release_date: { type: 'string' },
                    rating: { type: 'number' },
                    genre: { type: 'string' },
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