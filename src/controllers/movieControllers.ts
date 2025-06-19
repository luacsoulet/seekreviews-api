import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedUser } from "../middleware/auth";
import { uploadToCloudinary } from "../middleware/cloudinary";

export const getMovies = async (request: FastifyRequest<{ Querystring: { page: number, limit: number } }>, reply: FastifyReply) => {
    const page = request.query.page || 1;
    const limit = request.query.limit || 20;
    const offset = (page - 1) * limit;

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('SELECT * FROM movies LIMIT $1 OFFSET $2', [limit, offset]);
        return rows;
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const getMovieById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };

    let userId: number | null = null;
    const decoded = request.user as AuthenticatedUser;
    if (decoded) userId = decoded.id;

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('SELECT * FROM movies WHERE id = $1', [id]);
        if (rows.length === 0) return reply.code(404).send({ message: 'Movie not found' });
        const movie = rows[0];
        if (userId) {
            const { rows: seenRows } = await client.query('SELECT * FROM seen WHERE user_id = $1 AND movie_id = $2', [userId, id]);
            movie.is_seen = seenRows.length > 0;
            movie.seen_id = seenRows.length > 0 ? seenRows[0].id : null;
        } else {
            movie.is_seen = false;
            movie.seen_id = null;
        }
        return movie;
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const getMovieByTitle = async (request: FastifyRequest<{ Querystring: { title: string } }>, reply: FastifyReply) => {
    const title = request.query.title;

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('SELECT * FROM movies WHERE title ILIKE $1', [`%${title}%`]);
        return rows;
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const getMovieByGenre = async (request: FastifyRequest<{ Querystring: { genre: string, page: number } }>, reply: FastifyReply) => {
    const page = request.query.page || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const genre = request.query.genre;

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('SELECT * FROM movies WHERE genre = $1 LIMIT $2 OFFSET $3', [genre, limit, offset]);
        return rows;
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const createMovie = async (request: FastifyRequest, reply: FastifyReply) => {
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
    const director = body.director?.value || body.director;
    const release_date = body.release_date?.value || body.release_date;
    const genre = body.genre?.value || body.genre;

    if (!coverImageUrl && body.cover_image && typeof body.cover_image === 'string') {
        coverImageUrl = body.cover_image;
    }

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query(
            'INSERT INTO movies (title, cover_image, description, director, release_date, avg_rating, genre) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [title, coverImageUrl, description, director, release_date, 0, genre]
        );
        return reply.code(201).send(rows[0]);
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const modifyMovie = async (request: FastifyRequest, reply: FastifyReply) => {
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
    const director = body.director?.value || body.director;
    const release_date = body.release_date?.value || body.release_date;
    const genre = body.genre?.value || body.genre;

    if (!coverImageUrl && body.cover_image && typeof body.cover_image === 'string') {
        coverImageUrl = body.cover_image;
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
        updates.push(`title = $${paramCount}`);
        values.push(title);
        paramCount++;
    }
    if (coverImageUrl !== null) {
        updates.push(`cover_image = $${paramCount}`);
        values.push(coverImageUrl);
        paramCount++;
    }
    if (description !== undefined) {
        updates.push(`description = $${paramCount}`);
        values.push(description);
        paramCount++;
    }
    if (director !== undefined) {
        updates.push(`director = $${paramCount}`);
        values.push(director);
        paramCount++;
    }
    if (release_date !== undefined) {
        updates.push(`release_date = $${paramCount}`);
        values.push(release_date);
        paramCount++;
    }
    if (genre !== undefined) {
        updates.push(`genre = $${paramCount}`);
        values.push(genre);
        paramCount++;
    }

    if (updates.length === 0) {
        return reply.code(400).send({ message: 'No fields to update' });
    }

    values.push(id);
    const query = `UPDATE movies SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query(query, values);
        if (rows.length === 0) {
            return reply.code(404).send({ message: 'Movie not found' });
        }
        return reply.code(200).send(rows[0]);
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const deleteMovie = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };

    const decoded = await request.jwtVerify<AuthenticatedUser>();

    if (!decoded.is_admin) return reply.code(403).send({ message: 'You are not an admin' });

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('SELECT id FROM movies WHERE id = $1', [id]);
        if (rows.length === 0) {
            return reply.code(404).send({ message: 'Movie not found' });
        }
        await client.query('DELETE FROM movies WHERE id = $1', [id]);
        return reply.code(204).send();
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}