import { FastifySchema } from "fastify";
import { error400, error401, error403, error404, error500 } from "../utils/errorTypes";

export const getBooksSchema: FastifySchema = {
    description: 'Get all books',
    tags: ['Books'],
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number' }
        }
    },
    response: {
        200: {
            description: 'Books fetched successfully',
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    author: { type: 'string' },
                    genre: { type: 'string' },
                    cover_image: { type: 'string' },
                    publish_date: { type: 'string' },
                    avg_rating: { type: 'number' },
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

export const getBookByIdSchema: FastifySchema = {
    description: 'Get a book by id',
    tags: ['Books'],
    params: {
        type: 'object',
        properties: {
            id: { type: 'number' }
        }
    },
    response: {
        200: {
            description: 'Book fetched successfully',
            type: 'object',
            properties: {
                id: { type: 'number' },
                title: { type: 'string' },
                description: { type: 'string' },
                author: { type: 'string' },
                genre: { type: 'string' },
                cover_image: { type: 'string' },
                publish_date: { type: 'string' },
                avg_rating: { type: 'number' },
                created_at: { type: 'string' }
            }
        },
        400: error400,
        403: error403,
        404: error404,
        500: error500
    }
}

export const getBookByTitleSchema: FastifySchema = {
    description: 'Get a book by title',
    tags: ['Books'],
    querystring: {
        type: 'object',
        properties: {
            title: { type: 'string' }
        }
    },
    response: {
        200: {
            description: 'Book fetched successfully',
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    author: { type: 'string' },
                    genre: { type: 'string' },
                    cover_image: { type: 'string' },
                    publish_date: { type: 'string' },
                    avg_rating: { type: 'number' },
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

export const getBookByGenreSchema: FastifySchema = {
    description: 'Get a book by genre',
    tags: ['Books'],
    querystring: {
        type: 'object',
        properties: {
            genre: { type: 'string' },
            page: { type: 'number' }
        }
    },
    response: {
        200: {
            description: 'Book fetched successfully',
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    author: { type: 'string' },
                    genre: { type: 'string' },
                    cover_image: { type: 'string' },
                    publish_date: { type: 'string' },
                    avg_rating: { type: 'number' },
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

export const createBookSchema: FastifySchema = {
    description: 'Create a book',
    tags: ['Books'],
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            author: { type: 'string' },
            genre: { type: 'string' },
            cover_image: { type: 'string' },
            publish_date: { type: 'string' }
        }
    },
    response: {
        200: {
            description: 'Book created successfully',
            type: 'object',
            properties: {
                id: { type: 'number' },
                title: { type: 'string' },
                description: { type: 'string' },
                author: { type: 'string' },
                genre: { type: 'string' },
                cover_image: { type: 'string' },
                publish_date: { type: 'string' },
                avg_rating: { type: 'number' },
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

export const modifyBookSchema: FastifySchema = {
    description: 'Modify a book',
    tags: ['Books'],
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        properties: {
            title: { type: 'string', nullable: true },
            description: { type: 'string', nullable: true },
            author: { type: 'string', nullable: true },
            genre: { type: 'string', nullable: true },
            cover_image: { type: 'string', nullable: true },
            publish_date: { type: 'string', nullable: true }
        }
    },
    response: {
        200: {
            description: 'Book modified successfully',
            type: 'object',
            properties: {
                id: { type: 'number' },
                title: { type: 'string' },
                description: { type: 'string' },
                author: { type: 'string' },
                genre: { type: 'string' },
                cover_image: { type: 'string' },
                publish_date: { type: 'string' },
                avg_rating: { type: 'number' },
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

export const deleteBookSchema: FastifySchema = {
    description: 'Delete a book',
    tags: ['Books'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        properties: {
            id: { type: 'number' }
        }
    },
    response: {
        204: {
            description: 'Book deleted successfully'
        },
        400: error400,
        401: error401,
        403: error403,
        404: error404,
        500: error500
    }
}