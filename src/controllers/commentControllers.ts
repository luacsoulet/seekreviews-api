import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedUser } from "../middleware/auth";

export const getMovieComments = async (request: FastifyRequest<{ Querystring: { movie_id: number } }>, reply: FastifyReply) => {
    const { movie_id } = request.query;

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('SELECT * FROM comments WHERE movie_id = $1 AND book_id IS NULL', [movie_id]);
        return reply.code(200).send(rows);
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
        return reply.code(200).send(rows);
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const createComment = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { movie_id, book_id, message } = request.body as { movie_id: number | null, book_id: number | null, message: string };

        const decoded = await request.jwtVerify<AuthenticatedUser>();

        if (movie_id === null && book_id === null) {
            return reply.code(400).send({ message: 'Either movie_id or book_id must be provided' });
        }

        const client = await request.server.pg.connect();
        try {
            const { rows } = await client.query(
                'INSERT INTO comments (movie_id, book_id, user_id, message) VALUES ($1, $2, $3, $4) RETURNING id, movie_id, book_id, user_id, message, created_at',
                [movie_id, book_id, decoded.id, message]
            );
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

export const modifyComment = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as { id: number };
        const { message } = request.body as { message: string };
        const decoded = await request.jwtVerify<AuthenticatedUser>();

        const client = await request.server.pg.connect();
        try {
            const { rows } = await client.query('SELECT * FROM comments WHERE id = $1', [id]);
            if (rows.length === 0) {
                return reply.code(404).send({ message: 'Comment not found' });
            }

            if (rows[0].user_id !== decoded.id) {
                return reply.code(403).send({ message: 'You are not the owner of this comment' });
            }

            const { rows: updatedRows } = await client.query(
                'UPDATE comments SET message = $1 WHERE id = $2 AND user_id = $3 RETURNING id, movie_id, book_id, user_id, message, created_at',
                [message, id, decoded.id]
            );
            return reply.code(200).send(updatedRows[0]);
        } catch (error) {
            return reply.code(500).send({ message: 'Internal server error' });
        } finally {
            client.release();
        }
    } catch (error) {
        return reply.code(401).send({ message: 'Unauthorized' });
    }
}

export const deleteComment = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as { id: number };
        const decoded = await request.jwtVerify<AuthenticatedUser>();

        const client = await request.server.pg.connect();
        try {
            const { rows } = await client.query('SELECT * FROM comments WHERE id = $1', [id]);
            if (rows.length === 0) {
                return reply.code(404).send({ message: 'Comment not found' });
            }

            if (rows[0].user_id !== decoded.id) {
                return reply.code(403).send({ message: 'You are not the owner of this comment' });
            }

            await client.query('DELETE FROM comments WHERE id = $1 AND user_id = $2', [id, decoded.id]);
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