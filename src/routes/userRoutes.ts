import { FastifyInstance } from "fastify";
import { getUserById, getUsers } from "../controllers/userControllers";
import { getUserByIdSchema, getUsersSchema } from "../dtos/userDtos";
import { authenticate } from "../middleware/auth";

export default async function userRoutes(fastify: FastifyInstance) {
    fastify.get('/', {
        schema: getUsersSchema,
        preHandler: [authenticate]
    }, getUsers);
    fastify.get('/:id', {
        schema: getUserByIdSchema,
    }, getUserById);
}