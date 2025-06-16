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
        return reply.code(200).send(rows);
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
        return reply.code(200).send(rows[0]);
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
        return reply.code(200).send(rows);
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const userSeen = async (request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) => {
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
                seen.id AS seen_id,
                seen.seen_at AS seen_at,
                movies.id AS movie_id,
                movies.title AS movie_title,
                movies.cover_image AS movie_cover,
                books.id AS book_id,
                books.title AS book_title,
                books.cover_image AS book_cover
            FROM seen
            LEFT JOIN movies ON seen.movie_id = movies.id
            LEFT JOIN books ON seen.book_id = books.id
            WHERE seen.user_id = $1`, [id]);
        return reply.code(200).send(rows);
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const modifyUser = async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.headers.authorization;
    const id = (request.params as { id: number }).id;
    const { username, email, description } = request.body as { username?: string, email?: string, description?: string };
    const decoded = await request.jwtVerify<AuthenticatedUser>();

    if (!token) return reply.code(401).send({ message: 'You are not authorized to access this resource' });

    if (!id) return reply.code(400).send({ message: 'Id is required' });

    if (decoded.id !== id && !decoded.is_admin) {
        return reply.code(403).send({ message: 'You are not authorized to modify this user' });
    }

    const client = await request.server.pg.connect();
    try {
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (username !== undefined) {
            updates.push(`username = $${paramCount}`);
            values.push(username);
            paramCount++;
        }
        if (email !== undefined) {
            updates.push(`email = $${paramCount}`);
            values.push(email);
            paramCount++;
        }
        if (description !== undefined) {
            updates.push(`description = $${paramCount}`);
            values.push(description);
            paramCount++;
        }

        if (updates.length === 0) {
            return reply.code(400).send({ message: 'No fields to update' });
        }

        values.push(id);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

        const { rows } = await client.query(query, values);
        return reply.code(200).send(rows[0]);
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const deleteUser = async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.headers.authorization;
    const id = (request.params as { id: number }).id;
    const decoded = await request.jwtVerify<AuthenticatedUser>();

    if (!token) return reply.code(401).send({ message: 'You are not authorized to access this resource' });

    if (!id) return reply.code(400).send({ message: 'Id is required' });

    if (decoded.id !== id && !decoded.is_admin) {
        return reply.code(403).send({ message: 'You are not authorized to delete this user' });
    }

    const client = await request.server.pg.connect();
    try {
        await client.query('DELETE FROM users WHERE id = $1', [id]);
        return reply.code(204).send();
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}