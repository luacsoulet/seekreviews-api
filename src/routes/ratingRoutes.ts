import { FastifyInstance } from "fastify";
import { getBookRatings, getMovieRatings, getUserRatings } from "../controllers/ratingControllers";
import { getBookRatingsSchema, getMovieRatingsSchema, getUserRatingsSchema } from "../dtos/ratingDtos";

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
}