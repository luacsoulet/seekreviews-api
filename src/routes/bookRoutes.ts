import { FastifyInstance } from "fastify";
import { getBookById, getBookByGenre, getBookByTitle, getBooks, createBook } from "../controllers/bookControllers";
import { getBookByIdSchema, getBookByGenreSchema, getBookByTitleSchema, getBooksSchema, createBookSchema } from "../dtos/bookDtos";
import { authenticate } from "../middleware/auth";

export const bookRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/', {
        schema: getBooksSchema,
    }, getBooks);

    fastify.get('/:id', {
        schema: getBookByIdSchema,
    }, getBookById);

    fastify.get('/search', {
        schema: getBookByTitleSchema,
    }, getBookByTitle);

    fastify.get('/genre', {
        schema: getBookByGenreSchema,
    }, getBookByGenre);

    fastify.post('/', {
        schema: createBookSchema,
        preHandler: [authenticate]
    }, createBook);
}