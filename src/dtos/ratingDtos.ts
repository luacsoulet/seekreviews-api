import { FastifySchema } from "fastify";
import { error400, error401, error403, error404, error500 } from "../utils/errorTypes";

export const getMovieRatingsSchema: FastifySchema = {
    description: 'Get ratings for a movie',
    tags: ['Ratings'],
    querystring: {
        type: 'object',
        properties: {
            movie_id: { type: 'number' }
        }
    },
    response: {
        200: {
            description: 'Ratings retrieved successfully',
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    movie_id: { type: 'number' },
                    book_id: { type: 'number', nullable: true },
                    user_id: { type: 'number' },
                    rating: { type: 'number' },
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

export const getBookRatingsSchema: FastifySchema = {
    description: 'Get ratings for a book',
    tags: ['Ratings'],
    querystring: {
        type: 'object',
        properties: {
            book_id: { type: 'number' }
        }
    },
    response: {
        200: {
            description: 'Ratings retrieved successfully',
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    movie_id: { type: 'number', nullable: true },
                    book_id: { type: 'number' },
                    user_id: { type: 'number' },
                    rating: { type: 'number' },
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

export const getUserRatingsSchema: FastifySchema = {
    description: 'Get ratings for a user',
    tags: ['Ratings'],
    querystring: {
        type: 'object',
        properties: {
            user_id: { type: 'number' }
        }
    },
    response: {
        200: {
            description: 'Ratings retrieved successfully',
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    title: { type: 'string' },
                    movie_id: { type: 'number', nullable: true },
                    book_id: { type: 'number', nullable: true },
                    user_id: { type: 'number' },
                    rating: { type: 'number' },
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

export const createRatingSchema: FastifySchema = {
    description: 'Create a rating',
    tags: ['Ratings'],
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        properties: {
            movie_id: { type: 'number', nullable: true },
            book_id: { type: 'number', nullable: true },
            rating: { type: 'number' },
        }
    },
    response: {
        200: {
            description: 'Rating created successfully',
            type: 'object',
            properties: {
                id: { type: 'number' },
                movie_id: { type: 'number', nullable: true },
                book_id: { type: 'number', nullable: true },
                user_id: { type: 'number' },
                rating: { type: 'number' },
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

export const modifyRatingSchema: FastifySchema = {
    description: 'Modify a rating',
    tags: ['Ratings'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            id: { type: 'number' }
        }
    },
    body: {
        type: 'object',
        properties: {
            rating: { type: 'number' }
        }
    },
    response: {
        200: {
            description: 'Rating modified successfully',
            type: 'object',
            properties: {
                id: { type: 'number' },
                movie_id: { type: 'number', nullable: true },
                book_id: { type: 'number', nullable: true },
                user_id: { type: 'number' },
                rating: { type: 'number' },
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

export const deleteRatingSchema: FastifySchema = {
    description: 'Delete a rating',
    tags: ['Ratings'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            id: { type: 'number' }
        }
    },
    response: {
        204: {
            description: 'Rating deleted successfully'
        },
        400: error400,
        401: error401,
        403: error403,
        404: error404,
        500: error500
    }
}