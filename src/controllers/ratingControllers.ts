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

export const getUserRatings = async (request: FastifyRequest<{ Querystring: { user_id: number } }>, reply: FastifyReply) => {
    const { user_id } = request.query;

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query(`
            SELECT 
                r.*,
                CASE 
                    WHEN r.movie_id IS NOT NULL THEN m.title
                    WHEN r.book_id IS NOT NULL THEN b.title
                END as title
            FROM ratings r
            LEFT JOIN movies m ON r.movie_id = m.id
            LEFT JOIN books b ON r.book_id = b.id
            WHERE r.user_id = $1
            ORDER BY r.created_at DESC
        `, [user_id]);
        if (rows.length === 0) {
            return reply.code(404).send({ message: 'No ratings found for this user' });
        } else {
            return rows;
        }
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}