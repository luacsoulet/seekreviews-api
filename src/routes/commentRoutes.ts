import { FastifyInstance } from "fastify";
import { createComment, getBookComments, getMovieComments } from "../controllers/commentControllers";
import { createCommentSchema, getBookCommentsSchema, getMovieCommentsSchema } from "../dtos/commentDtos";
import { authenticate } from "../middleware/auth";

export const commentRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/movie', {
        schema: getMovieCommentsSchema,
    }, getMovieComments);

    fastify.get('/book', {
        schema: getBookCommentsSchema,
    }, getBookComments);

    fastify.post('/', {
        schema: createCommentSchema,
        preHandler: [authenticate]
    }, createComment);
}