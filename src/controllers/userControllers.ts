import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedUser } from "../middleware/auth";

export const getUsers = async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.headers.authorization;

    if (!token) {
        return reply.code(401).send({ message: 'You are not authorized to access this resource' });
    }
    const decoded = await request.jwtVerify<AuthenticatedUser>();

    if (!decoded.is_admin) {
        return reply.code(403).send({ message: 'You are not an admin' });
    }
    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('SELECT * FROM users');
        return rows;
    } finally {
        client.release();
    }
}