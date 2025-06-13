import { FastifyInstance } from "fastify";
import { getMovieById, getMovieByTitle, getMovies } from "../controllers/movieControllers";
import { getMovieByIdSchema, getMovieByTitleSchema, getMoviesSchema } from "../dtos/movieDtos";

export const movieRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/', {
        schema: getMoviesSchema,
    }, getMovies);

    fastify.get('/:id', {
        schema: getMovieByIdSchema,
    }, getMovieById);

    fastify.get('/search', {
        schema: getMovieByTitleSchema,
    }, getMovieByTitle);
}