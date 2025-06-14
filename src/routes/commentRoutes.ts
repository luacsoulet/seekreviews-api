import { FastifyInstance } from "fastify";
import { getBookComments, getMovieComments } from "../controllers/commentControllers";
import { getBookCommentsSchema, getMovieCommentsSchema } from "../dtos/commentDtos";

export const commentRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/movie', {
        schema: getMovieCommentsSchema,
    }, getMovieComments);

    fastify.get('/book', {
        schema: getBookCommentsSchema,
    }, getBookComments);
}