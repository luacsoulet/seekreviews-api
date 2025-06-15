import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedUser } from "../middleware/auth";

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

export const createRating = async (request: FastifyRequest, reply: FastifyReply) => {
    const { movie_id, book_id, rating } = request.body as { movie_id: number | null, book_id: number | null, rating: number };

    const decoded = await request.jwtVerify<AuthenticatedUser>();

    const client = await request.server.pg.connect();
    try {
        const { rows: existingRatingRows } = await client.query('SELECT * FROM ratings WHERE movie_id = $1 AND book_id = $2 AND user_id = $3', [movie_id, book_id, decoded.id]);
        if (existingRatingRows.length > 0) {
            return reply.code(400).send({ message: 'Rating already exists' });
        }

        const { rows } = await client.query('INSERT INTO ratings (movie_id, book_id, user_id, rating) VALUES ($1, $2, $3, $4) RETURNING *', [movie_id, book_id, decoded.id, rating]);
        return rows[0];
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const modifyRating = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const { rating } = request.body as { rating: number };

    const decoded = await request.jwtVerify<AuthenticatedUser>();

    const client = await request.server.pg.connect();
    try {
        const { rows: existingRatingRows } = await client.query('SELECT * FROM ratings WHERE id = $1 AND user_id = $2', [id, decoded.id]);
        if (existingRatingRows.length === 0) {
            return reply.code(404).send({ message: 'Rating not found' });
        }
        if (existingRatingRows[0].user_id !== decoded.id) {
            return reply.code(403).send({ message: 'You are not the owner of this rating' });
        }

        const { rows: updatedRatingRows } = await client.query('UPDATE ratings SET rating = $1 WHERE id = $2 AND user_id = $3 RETURNING *', [rating, id, decoded.id]);

        return updatedRatingRows[0];
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}