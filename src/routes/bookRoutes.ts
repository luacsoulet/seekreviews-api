import { FastifyInstance } from "fastify";
import { getBookById, getBookByGenre, getBookByTitle, getBooks, createBook, modifyBook } from "../controllers/bookControllers";
import { getBookByIdSchema, getBookByGenreSchema, getBookByTitleSchema, getBooksSchema, createBookSchema, modifyBookSchema } from "../dtos/bookDtos";
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

    fastify.patch('/:id', {
        schema: modifyBookSchema,
        preHandler: [authenticate]
    }, modifyBook);
}