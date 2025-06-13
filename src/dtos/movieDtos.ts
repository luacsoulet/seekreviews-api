import { FastifySchema } from "fastify";
import { error400, error401, error403, error404, error500 } from "../utils/errorTypes";

export const getMoviesSchema: FastifySchema = {
    description: 'Get all movies',
    tags: ['Movies'],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number', default: 1 }
        }
    },
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

export const getMovieByIdSchema: FastifySchema = {
    description: 'Get a movie by id',
    tags: ['Movies'],
    params: {
        type: 'object',
        properties: {
            id: { type: 'number' }
        }
    },
    response: {
        200: {
            description: 'Movie fetched successfully',
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
        },
        400: error400,
        403: error403,
        404: error404,
        500: error500
    }
}

export const getMovieByTitleSchema: FastifySchema = {
    description: 'Get a movie by title',
    tags: ['Movies'],
    querystring: {
        type: 'object',
        properties: {
            title: { type: 'string' }
        }
    },
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

export const getMovieByGenreSchema: FastifySchema = {
    description: 'Get a movie by genre',
    tags: ['Movies'],
    querystring: {
        type: 'object',
        properties: {
            genre: { type: 'string' },
            page: { type: 'number', default: 1 }
        }
    },
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

export const createMovieSchema: FastifySchema = {
    description: 'Create a movie',
    tags: ['Movies'],
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        properties: {
            title: { type: 'string' },
            cover_image: { type: 'string' },
            description: { type: 'string' },
            director: { type: 'string' },
            release_date: { type: 'string' },
            genre: { type: 'string' }
        }
    },
    response: {
        201: {
            description: 'Movie created successfully',
            type: 'object',
            properties: {
                id: { type: 'number' },
                title: { type: 'string' },
                cover_image: { type: 'string' },
                description: { type: 'string' },
                release_date: { type: 'string' },
                director: { type: 'string' },
                avg_rating: { type: 'number' },
                genre: { type: 'string' },
                created_at: { type: 'string' }
            }
        },
        400: error400,
        403: error403,
        404: error404,
        500: error500
    }
}