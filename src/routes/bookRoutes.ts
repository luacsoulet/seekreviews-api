import { FastifyInstance } from "fastify";
import { getBookById, getBookByTitle, getBooks } from "../controllers/bookControllers";
import { getBookByIdSchema, getBookByTitleSchema, getBooksSchema } from "../dtos/bookDtos";

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
}