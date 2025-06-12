import { FastifyInstance } from "fastify";
import { getUserById, getUsers, modifyUser, userFavorites, userSeen } from "../controllers/userControllers";
import { getUserByIdSchema, getUsersSchema, modifyUserSchema, userFavoritesSchema, userSeenSchema } from "../dtos/userDtos";
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
    fastify.get('/:id/seen', {
        schema: userSeenSchema,
    }, userSeen);
    fastify.patch('/:id', {
        schema: modifyUserSchema,
        preHandler: [authenticate]
    }, modifyUser);
}