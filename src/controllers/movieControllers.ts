import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedUser } from "../middleware/auth";

export const getMovies = async (request: FastifyRequest<{ Querystring: { page: number } }>, reply: FastifyReply) => {
    const page = request.query.page || 1;
    const limit = 20;
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

export const getMovieById = async (request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) => {
    const id = request.params.id;

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('SELECT * FROM movies WHERE id = $1', [id]);
        if (rows.length === 0) return reply.code(404).send({ message: 'Movie not found' });
        return rows[0];
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
    const { title, cover_image, description, director, release_date, genre } = request.body as { title: string, cover_image: string, description: string, director: string, release_date: string, genre: string };

    const decoded = await request.jwtVerify<AuthenticatedUser>();

    if (!decoded.is_admin) return reply.code(403).send({ message: 'You are not an admin' });

    console.log(title, cover_image, description, director, release_date, genre);

    const client = await request.server.pg.connect();
    try {
        const { rows } = await client.query('INSERT INTO movies (title, cover_image, description, director, release_date, avg_rating, genre) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [title, cover_image, description, director, release_date, 0, genre]);
        return rows[0];
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const modifyMovie = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const { title, cover_image, description, director, release_date, genre } = request.body as { title: string | null, cover_image: string | null, description: string | null, director: string | null, release_date: string | null, genre: string | null };

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
        if (cover_image !== null) {
            updates.push(`cover_image = $${paramCount}`);
            values.push(cover_image);
            paramCount++;
        }
        if (description !== null) {
            updates.push(`description = $${paramCount}`);
            values.push(description);
            paramCount++;
        }
        if (director !== null) {
            updates.push(`director = $${paramCount}`);
            values.push(director);
            paramCount++;
        }
        if (release_date !== null) {
            updates.push(`release_date = $${paramCount}`);
            values.push(release_date);
            paramCount++;
        }
        if (genre !== null) {
            updates.push(`genre = $${paramCount}`);
            values.push(genre);
            paramCount++;
        }

        if (updates.length === 0) {
            return reply.code(400).send({ message: 'No fields to update' });
        }

        const updateString = updates.join(', ');

        const { rows } = await client.query(`
            UPDATE movies 
            SET
                ${updateString}
            WHERE id = $8 
            RETURNING *
        `, [...values, id]);
        return rows[0];
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const deleteMovie = async (request: FastifyRequest, reply: FastifyReply) => {
    const id = request.params as { id: number }

    const decoded = await request.jwtVerify<AuthenticatedUser>();

    if (!decoded.is_admin) return reply.code(403).send({ message: 'You are not an admin' });

    const client = await request.server.pg.connect();
    try {
        await client.query('DELETE FROM movies WHERE id = $1', [id]);
        return reply.code(204).send({ message: 'Movie deleted successfully' });
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}