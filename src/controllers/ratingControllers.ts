import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedUser } from "../middleware/auth";

export const getMovieRatings = async (request: FastifyRequest<{ Querystring: { movie_id: number } }>, reply: FastifyReply) => {
    const { movie_id } = request.query;

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('SELECT * FROM ratings WHERE movie_id = $1 AND book_id IS NULL', [movie_id]);
        return reply.code(200).send(rows);
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
        return reply.code(200).send(rows);
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
        return reply.code(200).send(rows);
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const createRating = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { movie_id, book_id, rating } = request.body as { movie_id: number | null, book_id: number | null, rating: number };
        const decoded = await request.jwtVerify<AuthenticatedUser>();

        if (movie_id === null && book_id === null) {
            return reply.code(400).send({ message: 'Either movie_id or book_id must be provided' });
        }

        const client = await request.server.pg.connect();
        try {
            let existingRatingQuery;
            let existingRatingParams;

            if (movie_id !== null) {
                existingRatingQuery = 'SELECT * FROM ratings WHERE movie_id = $1 AND book_id IS NULL AND user_id = $2';
                existingRatingParams = [movie_id, decoded.id];
            } else {
                existingRatingQuery = 'SELECT * FROM ratings WHERE book_id = $1 AND movie_id IS NULL AND user_id = $2';
                existingRatingParams = [book_id, decoded.id];
            }

            const { rows: existingRatingRows } = await client.query(existingRatingQuery, existingRatingParams);
            if (existingRatingRows.length > 0) {
                return reply.code(400).send({ message: 'Rating already exists' });
            }

            const { rows } = await client.query('INSERT INTO ratings (movie_id, book_id, user_id, rating) VALUES ($1, $2, $3, $4) RETURNING id, movie_id, book_id, user_id, rating, created_at', [movie_id, book_id, decoded.id, rating]);

            await updateAverageRating(client, movie_id, book_id);

            return reply.code(200).send(rows[0]);
        } catch (error) {
            return reply.code(500).send({ message: 'Internal server error' });
        } finally {
            client.release();
        }
    } catch (error) {
        return reply.code(401).send({ message: 'Unauthorized' });
    }
}

export const modifyRating = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as { id: number };
        const { rating } = request.body as { rating: number };
        const decoded = await request.jwtVerify<AuthenticatedUser>();

        const client = await request.server.pg.connect();
        try {
            const { rows: existingRatingRows } = await client.query('SELECT * FROM ratings WHERE id = $1', [id]);
            if (existingRatingRows.length === 0) {
                return reply.code(404).send({ message: 'Rating not found' });
            }
            if (existingRatingRows[0].user_id !== decoded.id) {
                return reply.code(403).send({ message: 'You are not the owner of this rating' });
            }

            const { rows: updatedRatingRows } = await client.query('UPDATE ratings SET rating = $1 WHERE id = $2 AND user_id = $3 RETURNING id, movie_id, book_id, user_id, rating, created_at', [rating, id, decoded.id]);

            await updateAverageRating(client, updatedRatingRows[0].movie_id, updatedRatingRows[0].book_id);

            return reply.code(200).send(updatedRatingRows[0]);
        } catch (error) {
            return reply.code(500).send({ message: 'Internal server error' });
        } finally {
            client.release();
        }
    } catch (error) {
        return reply.code(401).send({ message: 'Unauthorized' });
    }
}

export const deleteRating = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as { id: number };
        const decoded = await request.jwtVerify<AuthenticatedUser>();

        const client = await request.server.pg.connect();
        try {
            const { rows: existingRatingRows } = await client.query('SELECT * FROM ratings WHERE id = $1', [id]);
            if (existingRatingRows.length === 0) {
                return reply.code(404).send({ message: 'Rating not found' });
            }
            if (existingRatingRows[0].user_id !== decoded.id) {
                return reply.code(403).send({ message: 'You are not the owner of this rating' });
            }

            const movie_id = existingRatingRows[0].movie_id;
            const book_id = existingRatingRows[0].book_id;

            await client.query('DELETE FROM ratings WHERE id = $1 AND user_id = $2', [id, decoded.id]);

            await updateAverageRating(client, movie_id, book_id);

            return reply.code(204).send();
        } catch (error) {
            return reply.code(500).send({ message: 'Internal server error' });
        } finally {
            client.release();
        }
    } catch (error) {
        return reply.code(401).send({ message: 'Unauthorized' });
    }
}

export const updateAverageRating = async (client: any, movie_id: number | null, book_id: number | null) => {
    try {
        if (movie_id !== null) {
            const { rows } = await client.query(`
                WITH avg_rating AS (
                    SELECT COALESCE(AVG(rating), 0) as new_avg
                    FROM ratings
                    WHERE movie_id = $1 AND book_id IS NULL
                )
                UPDATE movies
                SET avg_rating = (SELECT new_avg FROM avg_rating)
                WHERE id = $1
                RETURNING avg_rating
            `, [movie_id]);
            return rows[0].avg_rating;
        } else if (book_id !== null) {
            const { rows } = await client.query(`
                WITH avg_rating AS (
                    SELECT COALESCE(AVG(rating), 0) as new_avg
                    FROM ratings
                    WHERE book_id = $1 AND movie_id IS NULL
                )
                UPDATE books
                SET avg_rating = (SELECT new_avg FROM avg_rating)
                WHERE id = $1
                RETURNING avg_rating
            `, [book_id]);
            return rows[0].avg_rating;
        }
    } catch (error) {
        throw error;
    }
}