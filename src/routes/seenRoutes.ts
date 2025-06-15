import { FastifyInstance } from "fastify";
import { deleteSeen, postSeen } from "../controllers/seenControllers";
import { deleteSeenSchema, postSeenSchema } from "../dtos/seenDtos";
import { authenticate } from "../middleware/auth";

export const seenRoutes = (fastify: FastifyInstance) => {
    fastify.post('/', {
        schema: postSeenSchema,
        preHandler: [authenticate]
    }, postSeen);

    fastify.delete('/:id', {
        schema: deleteSeenSchema,
        preHandler: [authenticate]
    }, deleteSeen);
}