import { FastifyInstance } from "fastify";
import { getBookById, getBookByGenre, getBookByTitle, getBooks, createBook, modifyBook, deleteBook } from "../controllers/bookControllers";
import { getBookByIdSchema, getBookByGenreSchema, getBookByTitleSchema, getBooksSchema, createBookSchema, modifyBookSchema, deleteBookSchema } from "../dtos/bookDtos";
import { authenticate, optionnalAuthenticate } from "../middleware/auth";

export const bookRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/', {
        schema: getBooksSchema,
    }, getBooks);

    fastify.get('/search', {
        schema: getBookByTitleSchema,
    }, getBookByTitle);

    fastify.get('/genre', {
        schema: getBookByGenreSchema,
    }, getBookByGenre);

    fastify.get('/:id', {
        schema: getBookByIdSchema,
        preHandler: [optionnalAuthenticate],
    }, getBookById);

    fastify.post('/', {
        schema: createBookSchema,
        preHandler: [authenticate],
        attachValidation: true
    }, createBook);

    fastify.patch('/:id', {
        schema: modifyBookSchema,
        preHandler: [authenticate],
        attachValidation: true
    }, modifyBook);

    fastify.delete('/:id', {
        schema: deleteBookSchema,
        preHandler: [authenticate]
    }, deleteBook);
}