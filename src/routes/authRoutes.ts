import { FastifyInstance } from "fastify";
import { loginUser, registerUser, verifyToken } from "../controllers/authControllers";
import { loginSchema, registerSchema, verifyTokenSchema } from "../dtos/authDtos";
import { authenticate } from "../middleware/auth";

export default async function authRoutes(fastify: FastifyInstance) {
    fastify.post('/login', {
        schema: loginSchema
    }, loginUser);
    fastify.post('/register', {
        schema: registerSchema
    }, registerUser);
    fastify.get('/verify-token', {
        schema: verifyTokenSchema,
        preHandler: [authenticate]
    }, verifyToken);
}