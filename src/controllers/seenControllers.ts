import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedUser } from "../middleware/auth";

export const postSeen = async (request: FastifyRequest, reply: FastifyReply) => {
    const { movie_id, book_id } = request.body as { movie_id: number | null, book_id: number | null };

    const decoded = await request.jwtVerify<AuthenticatedUser>();

    const client = await request.server.pg.connect();
    try {
        const { rows: existingSeenRows } = await client.query('SELECT * FROM seen WHERE user_id = $1 AND movie_id = $2 AND book_id = $3', [decoded.id, movie_id, book_id]);
        if (existingSeenRows.length > 0) {
            return reply.code(400).send({ message: 'Seen already exists' });
        }

        const { rows: newSeenRows } = await client.query('INSERT INTO seen (user_id, movie_id, book_id) VALUES ($1, $2, $3) RETURNING *', [decoded.id, movie_id, book_id]);
        return newSeenRows[0];
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}

export const deleteSeen = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };

    const decoded = await request.jwtVerify<AuthenticatedUser>();

    const client = await request.server.pg.connect();
    try {
        const { rows: existingSeenRows } = await client.query('SELECT * FROM seen WHERE id = $1 AND user_id = $2', [id, decoded.id]);
        if (existingSeenRows.length === 0) {
            return reply.code(404).send({ message: 'Seen not found' });
        }
        if (existingSeenRows[0].user_id !== decoded.id) {
            return reply.code(403).send({ message: 'You are not the owner of this seen' });
        }

        await client.query('DELETE FROM seen WHERE id = $1 AND user_id = $2', [id, decoded.id]);
        return reply.code(204).send();
    } catch (error) {
        return reply.code(500).send({ message: 'Internal server error' });
    } finally {
        client.release();
    }
}