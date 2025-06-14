import { FastifyInstance } from "fastify";
import { getBookById, getBooks } from "../controllers/bookControllers";
import { getBookByIdSchema, getBooksSchema } from "../dtos/bookDtos";

export const bookRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/', {
        schema: getBooksSchema,
    }, getBooks);

    fastify.get('/:id', {
        schema: getBookByIdSchema,
    }, getBookById);
}