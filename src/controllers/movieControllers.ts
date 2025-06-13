import { FastifyReply, FastifyRequest } from "fastify";

export const getMovies = async (request: FastifyRequest, reply: FastifyReply) => {
    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('SELECT * FROM movies');
        return rows;
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}