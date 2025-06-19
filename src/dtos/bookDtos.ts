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
    security: [{ bearerAuth: [] }],
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
    consumes: ['multipart/form-data'],
    body: {
        type: 'object',
        properties: {
            title: {
                type: 'string',
                description: 'Book title'
            },
            description: {
                type: 'string',
                description: 'Book description'
            },
            author: {
                type: 'string',
                description: 'Book author'
            },
            genre: {
                type: 'string',
                description: 'Book genre'
            },
            publish_date: {
                type: 'string',
                format: 'date',
                description: 'Publication date (YYYY-MM-DD)'
            },
            cover_image: {
                type: 'string',
                format: 'binary',
                description: 'Cover image file (optional)'
            }
        },
        required: ['title', 'description', 'author', 'genre', 'publish_date'],
        additionalProperties: true
    },
    response: {
        201: {
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
                description: 'Book title'
            },
            description: {
                type: 'string',
                description: 'Book description'
            },
            author: {
                type: 'string',
                description: 'Book author'
            },
            genre: {
                type: 'string',
                description: 'Book genre'
            },
            publish_date: {
                type: 'string',
                format: 'date',
                description: 'Publication date (YYYY-MM-DD)'
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