import { FastifyInstance } from "fastify";
import { getBookById, getBookByGenre, getBookByTitle, getBooks } from "../controllers/bookControllers";
import { getBookByIdSchema, getBookByGenreSchema, getBookByTitleSchema, getBooksSchema } from "../dtos/bookDtos";

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
}