import { FastifyInstance } from "fastify";
import { getMovieByGenre, getMovieById, getMovieByTitle, getMovies } from "../controllers/movieControllers";
import { getMovieByGenreSchema, getMovieByIdSchema, getMovieByTitleSchema, getMoviesSchema } from "../dtos/movieDtos";

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

    fastify.get('/genre', {
        schema: getMovieByGenreSchema,
    }, getMovieByGenre);
}