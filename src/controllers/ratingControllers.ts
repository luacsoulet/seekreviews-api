import { FastifyReply, FastifyRequest } from "fastify";

export const getMovieRatings = async (request: FastifyRequest<{ Querystring: { movie_id: number } }>, reply: FastifyReply) => {
    const { movie_id } = request.query;

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('SELECT * FROM ratings WHERE movie_id = $1 AND book_id IS NULL', [movie_id]);
        if (rows.length === 0) {
            return reply.code(404).send({ message: 'No ratings found for this movie' });
        } else {
            return rows;
        }
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const getBookRatings = async (request: FastifyRequest<{ Querystring: { book_id: number } }>, reply: FastifyReply) => {
    const { book_id } = request.query;

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('SELECT * FROM ratings WHERE book_id = $1 AND movie_id IS NULL', [book_id]);
        if (rows.length === 0) {
            return reply.code(404).send({ message: 'No ratings found for this book' });
        } else {
            return rows;
        }
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}