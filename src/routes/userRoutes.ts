import { FastifyInstance } from "fastify";
import { getUserById, getUsers, userFavorites } from "../controllers/userControllers";
import { getUserByIdSchema, getUsersSchema, userFavoritesSchema } from "../dtos/userDtos";
import { authenticate } from "../middleware/auth";

export default async function userRoutes(fastify: FastifyInstance) {
    fastify.get('/', {
        schema: getUsersSchema,
        preHandler: [authenticate]
    }, getUsers);
    fastify.get('/:id', {
        schema: getUserByIdSchema,
    }, getUserById);
    fastify.get('/:id/favorites', {
        schema: userFavoritesSchema,
    }, userFavorites);
}