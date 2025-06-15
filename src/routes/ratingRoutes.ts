import { FastifyInstance } from "fastify";
import { createRating, deleteRating, getBookRatings, getMovieRatings, getUserRatings, modifyRating } from "../controllers/ratingControllers";
import { createRatingSchema, deleteRatingSchema, getBookRatingsSchema, getMovieRatingsSchema, getUserRatingsSchema, modifyRatingSchema } from "../dtos/ratingDtos";
import { authenticate } from "../middleware/auth";

export const ratingRoutes = (fastify: FastifyInstance) => {
    fastify.get('/movie', {
        schema: getMovieRatingsSchema,
    }, getMovieRatings);

    fastify.get('/book', {
        schema: getBookRatingsSchema,
    }, getBookRatings);

    fastify.get('/user', {
        schema: getUserRatingsSchema,
    }, getUserRatings);

    fastify.post('/', {
        schema: createRatingSchema,
        preHandler: [authenticate]
    }, createRating);

    fastify.patch('/:id', {
        schema: modifyRatingSchema,
        preHandler: [authenticate]
    }, modifyRating);

    fastify.delete('/:id', {
        schema: deleteRatingSchema,
        preHandler: [authenticate]
    }, deleteRating);
}