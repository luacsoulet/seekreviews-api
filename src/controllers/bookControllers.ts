import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedUser } from "../middleware/auth";
import { uploadToCloudinary } from "../middleware/cloudinary";

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

export const getBookById = async (request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) => {
    const { id } = request.params;

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
    const decoded = await request.jwtVerify<AuthenticatedUser>();
    if (!decoded.is_admin) return reply.code(403).send({ message: 'You are not an admin' });

    let coverImageUrl = null;

    const file: any = (request.body as any)?.cover_image;
    if (file && file.toBuffer) {
        try {
            const buffer = await file.toBuffer();
            coverImageUrl = await uploadToCloudinary(buffer);
        } catch (error) {
            return reply.code(500).send({ message: 'Error during uploading image' });
        }
    }

    const body = request.body as any;
    const title = body.title?.value || body.title;
    const description = body.description?.value || body.description;
    const author = body.author?.value || body.author;
    const genre = body.genre?.value || body.genre;
    const publish_date = body.publish_date?.value || body.publish_date;

    if (!coverImageUrl && body.cover_image && typeof body.cover_image === 'string') {
        coverImageUrl = body.cover_image;
    }

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query(
            'INSERT INTO books (title, description, author, genre, cover_image, publish_date, avg_rating) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [title, description, author, genre, coverImageUrl, publish_date, 0]
        );
        return reply.code(201).send(rows[0]);
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const modifyBook = async (request: FastifyRequest, reply: FastifyReply) => {
    const decoded = await request.jwtVerify<AuthenticatedUser>();
    if (!decoded.is_admin) return reply.code(403).send({ message: 'You are not an admin' });

    const { id } = request.params as { id: number };

    let coverImageUrl = null;

    const file: any = (request.body as any)?.file || (request.body as any)?.cover_image;
    if (file && file.toBuffer) {
        try {
            const buffer = await file.toBuffer();
            coverImageUrl = await uploadToCloudinary(buffer);
        } catch (error) {
            return reply.code(500).send({ message: 'Error during uploading image' });
        }
    }

    const body = request.body as any;
    const title = body.title?.value || body.title;
    const description = body.description?.value || body.description;
    const author = body.author?.value || body.author;
    const genre = body.genre?.value || body.genre;
    const publish_date = body.publish_date?.value || body.publish_date;

    if (!coverImageUrl && body.cover_image && typeof body.cover_image === 'string') {
        coverImageUrl = body.cover_image;
    }

    const client = await request.server.pg.connect();
    try {
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (title !== null && title !== undefined) {
            updates.push(`title = $${paramCount}`);
            values.push(title);
            paramCount++;
        }

        if (description !== null && description !== undefined) {
            updates.push(`description = $${paramCount}`);
            values.push(description);
            paramCount++;
        }

        if (author !== null && author !== undefined) {
            updates.push(`author = $${paramCount}`);
            values.push(author);
            paramCount++;
        }

        if (genre !== null && genre !== undefined) {
            updates.push(`genre = $${paramCount}`);
            values.push(genre);
            paramCount++;
        }

        if (coverImageUrl !== null) {
            updates.push(`cover_image = $${paramCount}`);
            values.push(coverImageUrl);
            paramCount++;
        }

        if (publish_date !== null && publish_date !== undefined) {
            updates.push(`publish_date = $${paramCount}`);
            values.push(publish_date);
            paramCount++;
        }

        if (updates.length === 0) {
            return reply.code(400).send({ message: 'No fields to update' });
        }

        values.push(id);
        const query = `UPDATE books SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

        const { rows } = await client.query(query, values);
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

export const deleteBook = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };

    const decoded = await request.jwtVerify<AuthenticatedUser>();

    if (!decoded.is_admin) return reply.code(403).send({ message: 'You are not an admin' });

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('SELECT id FROM books WHERE id = $1', [id]);
        if (rows.length === 0) {
            return reply.code(404).send({ message: 'Book not found' });
        }
        await client.query('DELETE FROM books WHERE id = $1', [id]);
        return reply.code(204).send();
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}