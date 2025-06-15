import { FastifyInstance } from "fastify";
import { getBookRatings, getMovieRatings } from "../controllers/ratingControllers";
import { getBookRatingsSchema, getMovieRatingsSchema } from "../dtos/ratingDtos";

export const ratingRoutes = (fastify: FastifyInstance) => {
    fastify.get('/movie', {
        schema: getMovieRatingsSchema,
    }, getMovieRatings);

    fastify.get('/book', {
        schema: getBookRatingsSchema,
    }, getBookRatings);
}