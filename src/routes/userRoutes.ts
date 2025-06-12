import { FastifyInstance } from "fastify";
import { getUsers } from "../controllers/userControllers";
import { getUsersSchema } from "../dtos/userDtos";
import { authenticate } from "../middleware/auth";

export default async function userRoutes(fastify: FastifyInstance) {
    fastify.get('/', {
        schema: getUsersSchema,
        preHandler: [authenticate]
    }, getUsers);
}