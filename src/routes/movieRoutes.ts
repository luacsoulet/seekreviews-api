import { FastifyInstance } from "fastify";
import { createMovie, getMovieByGenre, getMovieById, getMovieByTitle, getMovies } from "../controllers/movieControllers";
import { createMovieSchema, getMovieByGenreSchema, getMovieByIdSchema, getMovieByTitleSchema, getMoviesSchema } from "../dtos/movieDtos";
import { authenticate } from "../middleware/auth";

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

    fastify.post('/', {
        schema: createMovieSchema,
        preHandler: [authenticate]
    }, createMovie);
}