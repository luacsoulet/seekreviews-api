import { FastifyReply, FastifyRequest } from "fastify";

export const getMovies = async (request: FastifyRequest<{ Querystring: { page: number } }>, reply: FastifyReply) => {
    const page = request.query.page || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('SELECT * FROM movies LIMIT $1 OFFSET $2', [limit, offset]);
        return rows;
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const getMovieById = async (request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) => {
    const id = request.params.id;

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('SELECT * FROM movies WHERE id = $1', [id]);
        if (rows.length === 0) return reply.code(404).send({ message: 'Movie not found' });
        return rows[0];
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const getMovieByTitle = async (request: FastifyRequest<{ Querystring: { title: string } }>, reply: FastifyReply) => {
    const title = request.query.title;

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('SELECT * FROM movies WHERE title ILIKE $1', [`%${title}%`]);
        return rows;
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}