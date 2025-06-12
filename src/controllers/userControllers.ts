import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedUser } from "../middleware/auth";

export const getUsers = async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.headers.authorization;

    if (!token) {
        return reply.code(401).send({ message: 'You are not authorized to access this resource' });
    }
    const decoded = await request.jwtVerify<AuthenticatedUser>();

    if (!decoded.is_admin) {
        return reply.code(403).send({ message: 'You are not an admin' });
    }
    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('SELECT * FROM users');
        return rows;
    } finally {
        client.release();
    }
}

export const getUserById = async (request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) => {
    const id = request.params.id;

    if (!id) {
        return reply.code(400).send({ message: 'Id is required' });
    }

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('SELECT * FROM users WHERE id = $1', [id]);
        if (rows.length === 0) {
            return reply.code(404).send({ message: 'User not found' });
        }
        return rows[0];
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const userFavorites = async (request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) => {
    const id = request.params.id;

    if (!id) {
        return reply.code(400).send({ message: 'Id is required' });
    }

    const client = await request.server.pg.connect();
    try {
        const { rows: user } = await client.query('SELECT * FROM users WHERE id = $1', [id]);
        if (user.length === 0) {
            return reply.code(404).send({ message: 'User not found' });
        }
        const { rows } = await client.query(
            `SELECT 
            favorites.id AS favorite_id,
            favorites.created_at AS favorited_at,
            movies.id AS movie_id,
            movies.title AS movie_title,
            movies.cover_image AS movie_cover,
            books.id AS book_id,
            books.title AS book_title,
            books.cover_image AS book_cover
            FROM favorites
            LEFT JOIN movies ON favorites.movie_id = movies.id
            LEFT JOIN books ON favorites.book_id = books.id
            WHERE favorites.user_id = $1`,
            [id]);
        return rows;
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}