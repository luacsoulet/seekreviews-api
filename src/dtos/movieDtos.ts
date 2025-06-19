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
                    director: { type: 'string' },
                    release_date: { type: 'string' },
                    avg_rating: { type: 'number' },
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
    security: [{ bearerAuth: [] }],
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
                director: { type: 'string' },
                release_date: { type: 'string' },
                avg_rating: { type: 'number' },
                genre: { type: 'string' },
                created_at: { type: 'string' },
                is_seen: { type: 'boolean' },
                seen_id: { type: 'number', nullable: true }
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
                    avg_rating: { type: 'number' },
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
                    avg_rating: { type: 'number' },
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
    consumes: ['multipart/form-data'],
    body: {
        type: 'object',
        properties: {
            title: {
                type: 'string',
                description: 'Movie title'
            },
            description: {
                type: 'string',
                description: 'Movie description'
            },
            director: {
                type: 'string',
                description: 'Movie director'
            },
            release_date: {
                type: 'string',
                format: 'date',
                description: 'Release date (YYYY-MM-DD)'
            },
            genre: {
                type: 'string',
                description: 'Movie genre'
            },
            cover_image: {
                type: 'string',
                format: 'binary',
                description: 'Cover image file (optional)'
            }
        },
        required: ['title', 'description', 'director', 'release_date', 'genre'],
        additionalProperties: true
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
        401: error401,
        403: error403,
        404: error404,
        500: error500
    }
}

export const modifyMovieSchema: FastifySchema = {
    description: 'Modify a movie',
    tags: ['Movies'],
    security: [{ bearerAuth: [] }],
    consumes: ['multipart/form-data'],
    params: {
        type: 'object',
        properties: {
            id: { type: 'number' }
        }
    },
    body: {
        type: 'object',
        properties: {
            title: {
                type: 'string',
                description: 'Movie title'
            },
            description: {
                type: 'string',
                description: 'Movie description'
            },
            director: {
                type: 'string',
                description: 'Movie director'
            },
            release_date: {
                type: 'string',
                format: 'date',
                description: 'Release date (YYYY-MM-DD)'
            },
            genre: {
                type: 'string',
                description: 'Movie genre'
            },
            cover_image: {
                type: 'string',
                format: 'binary',
                description: 'Cover image file (optional)'
            }
        },
        additionalProperties: true
    },
    response: {
        200: {
            description: 'Movie modified successfully',
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
        401: error401,
        403: error403,
        404: error404,
        500: error500
    }
}

export const deleteMovieSchema: FastifySchema = {
    description: 'Delete a movie',
    tags: ['Movies'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            id: { type: 'number' }
        }
    },
    response: {
        204: {
            description: 'Movie deleted successfully'
        },
        400: error400,
        401: error401,
        403: error403,
        404: error404,
        500: error500
    }
}