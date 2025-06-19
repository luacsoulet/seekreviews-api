import { FastifyInstance } from "fastify";
import { createMovie, deleteMovie, getMovieByGenre, getMovieById, getMovieByTitle, getMovies, modifyMovie } from "../controllers/movieControllers";
import { createMovieSchema, deleteMovieSchema, getMovieByGenreSchema, getMovieByIdSchema, getMovieByTitleSchema, getMoviesSchema, modifyMovieSchema } from "../dtos/movieDtos";
import { authenticate, optionnalAuthenticate } from "../middleware/auth";

export const movieRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/', {
        schema: getMoviesSchema,
    }, getMovies);

    fastify.get('/search', {
        schema: getMovieByTitleSchema,
    }, getMovieByTitle);

    fastify.get('/genre', {
        schema: getMovieByGenreSchema,
    }, getMovieByGenre);

    fastify.get('/:id', {
        schema: getMovieByIdSchema,
        preHandler: [optionnalAuthenticate],
    }, getMovieById);

    fastify.post('/', {
        schema: createMovieSchema,
        preHandler: [authenticate],
        attachValidation: true
    }, createMovie);

    fastify.patch('/:id', {
        schema: modifyMovieSchema,
        preHandler: [authenticate],
        attachValidation: true
    }, modifyMovie);

    fastify.delete('/:id', {
        schema: deleteMovieSchema,
        preHandler: [authenticate]
    }, deleteMovie);
}