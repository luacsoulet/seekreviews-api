import { FastifyInstance } from "fastify";
import { getBooks } from "../controllers/bookControllers";
import { getBooksSchema } from "../dtos/bookDtos";

export const bookRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/', {
        schema: getBooksSchema,
    }, getBooks);
}