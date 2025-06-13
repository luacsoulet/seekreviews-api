import { FastifyInstance } from "fastify";
import { getMovieById, getMovies } from "../controllers/movieControllers";
import { getMovieByIdSchema, getMoviesSchema } from "../dtos/movieDtos";

export const movieRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/', {
        schema: getMoviesSchema,
    }, getMovies);

    fastify.get('/:id', {
        schema: getMovieByIdSchema,
    }, getMovieById);
}