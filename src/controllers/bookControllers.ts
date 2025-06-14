import { FastifyReply, FastifyRequest } from "fastify";

export const getBooks = async (request: FastifyRequest<{ Querystring: { page: number } }>, reply: FastifyReply) => {
    const page = request.query.page || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('SELECT * FROM books LIMIT $1 OFFSET $2', [limit, offset]);
        return rows;
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}