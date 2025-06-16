import { FastifyReply, FastifyRequest } from "fastify";

export interface AuthenticatedUser {
    id: number;
    email: string;
    username: string;
    is_admin: boolean;
}

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const token = request.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return reply.code(401).send({
                message: 'Token authentication missing',
                error: 'Unauthorized'
            });
        }

        const decoded = await request.jwtVerify<AuthenticatedUser>();
        (request as any).user = decoded;

    } catch (err) {
        return reply.code(401).send({
            message: 'Token invalid or expired',
            error: 'Unauthorized'
        });
    }
};