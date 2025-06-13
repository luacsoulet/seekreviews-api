import { FastifyInstance } from "fastify";
import { getMovies } from "../controllers/movieControllers";
import { getMoviesSchema } from "../dtos/movieDtos";

export const movieRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/', {
        schema: getMoviesSchema,
    }, getMovies);
}