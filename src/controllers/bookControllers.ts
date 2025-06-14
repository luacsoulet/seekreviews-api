import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedUser } from "../middleware/auth";

export const getBooks = async (request: FastifyRequest<{ Querystring: { page: number } }>, reply: FastifyReply) => {
    const page = request.query.page || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('SELECT * FROM books LIMIT $1 OFFSET $2', [limit, offset]);
        return rows;
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const getBookById = async (request: FastifyRequest, reply: FastifyReply) => {
    const id = request.params as { id: number };

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('SELECT * FROM books WHERE id = $1', [id]);
        if (rows.length === 0) {
            return reply.code(404).send({ message: 'Book not found' });
        }
        return rows[0];
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const getBookByTitle = async (request: FastifyRequest<{ Querystring: { title: string } }>, reply: FastifyReply) => {
    const { title } = request.query;

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('SELECT * FROM books WHERE title ILIKE $1', [`%${title}%`]);
        if (rows.length === 0) {
            return reply.code(404).send({ message: 'No books found' });
        }
        return rows;
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const getBookByGenre = async (request: FastifyRequest<{ Querystring: { genre: string, page: number } }>, reply: FastifyReply) => {
    const { genre } = request.query;
    const page = request.query.page || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('SELECT * FROM books WHERE genre = $1 LIMIT $2 OFFSET $3', [genre, limit, offset]);
        if (rows.length === 0) {
            return reply.code(404).send({ message: 'No books found for this genre' });
        }
        return rows;
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const createBook = async (request: FastifyRequest, reply: FastifyReply) => {
    const { title, description, author, genre, cover_image, publish_date } = request.body as { title: string, description: string, author: string, genre: string, cover_image: string, publish_date: string };

    const decoded = await request.jwtVerify<AuthenticatedUser>();

    if (!decoded.is_admin) return reply.code(403).send({ message: 'You are not an admin' });

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('INSERT INTO books (title, description, author, genre, cover_image, publish_date, avg_rating) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [title, description, author, genre, cover_image, publish_date, 0]);
        return rows[0];
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const modifyBook = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const { title, description, author, genre, cover_image, publish_date } = request.body as { title: string | null, description: string | null, author: string | null, genre: string | null, cover_image: string | null, publish_date: string | null };

    const decoded = await request.jwtVerify<AuthenticatedUser>();

    if (!decoded.is_admin) return reply.code(403).send({ message: 'You are not an admin' });

    const client = await request.server.pg.connect();
    try {
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (title !== null) {
            updates.push(`title = $${paramCount}`);
            values.push(title);
            paramCount++;
        }

        if (description !== null) {
            updates.push(`description = $${paramCount}`);
            values.push(description);
            paramCount++;
        }

        if (author !== null) {
            updates.push(`author = $${paramCount}`);
            values.push(author);
            paramCount++;
        }

        if (genre !== null) {
            updates.push(`genre = $${paramCount}`);
            values.push(genre);
            paramCount++;
        }

        if (cover_image !== null) {
            updates.push(`cover_image = $${paramCount}`);
            values.push(cover_image);
            paramCount++;
        }

        if (publish_date !== null) {
            updates.push(`publish_date = $${paramCount}`);
            values.push(publish_date);
            paramCount++;
        }

        if (updates.length === 0) {
            return reply.code(400).send({ message: 'No fields to update' });
        }

        const updateString = updates.join(', ');

        const { rows } = await client.query(`
            UPDATE books 
            SET
                ${updateString}
            WHERE id = $${paramCount}
            RETURNING *
        `, [...values, id]);
        return rows[0];
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}