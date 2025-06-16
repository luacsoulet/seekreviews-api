import { FastifyInstance } from "fastify";
import { createComment, deleteComment, getBookComments, getMovieComments, modifyComment } from "../controllers/commentControllers";
import { createCommentSchema, deleteCommentSchema, getBookCommentsSchema, getMovieCommentsSchema, modifyCommentSchema } from "../dtos/commentDtos";
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

    fastify.put('/:id', {
        schema: modifyCommentSchema,
        preHandler: [authenticate]
    }, modifyComment);

    fastify.delete('/:id', {
        schema: deleteCommentSchema,
        preHandler: [authenticate]
    }, deleteComment);
}