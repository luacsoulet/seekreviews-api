import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedUser } from "../middleware/auth";

export const getMovieComments = async (request: FastifyRequest<{ Querystring: { movie_id: number } }>, reply: FastifyReply) => {
    const { movie_id } = request.query;

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('SELECT * FROM comments WHERE movie_id = $1 AND book_id IS NULL', [movie_id]);
        return rows;
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}
export const getBookComments = async (request: FastifyRequest<{ Querystring: { book_id: number } }>, reply: FastifyReply) => {
    const { book_id } = request.query;

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('SELECT * FROM comments WHERE book_id = $1 AND movie_id IS NULL', [book_id]);
        return rows;
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const createComment = async (request: FastifyRequest, reply: FastifyReply) => {
    const { movie_id, book_id, comment } = request.body as { movie_id: number | null, book_id: number | null, comment: string };

    const decoded = await request.jwtVerify<AuthenticatedUser>();

    if (movie_id === null && book_id === null) {
        return reply.code(400).send({ message: 'Either movie_id or book_id must be provided' });
    }

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('INSERT INTO comments (movie_id, book_id, user_id, comment) VALUES ($1, $2, $3, $4) RETURNING *', [movie_id, book_id, decoded.id, comment]);
        return rows[0];
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}