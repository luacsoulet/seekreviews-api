import { FastifyReply, FastifyRequest } from "fastify";
import { RegisterDto } from "../dtos/authDtos";
import bcrypt from 'bcrypt';
import { AuthenticatedUser } from "../middleware/auth";

export const registerUser = async (request: FastifyRequest<{ Body: RegisterDto }>, reply: FastifyReply) => {
    const { username, email, password } = request.body;

    if (!username || !email || !password) {
        return reply.code(400).send({ message: 'Missing required fields' });
    }

    const client = await request.server.pg.connect();
    try {
        const existingUser = await client.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return reply.code(400).send({ message: 'User already exists' });
        }

        const existingUsername = await client.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        if (existingUsername.rows.length > 0) {
            return reply.code(400).send({ message: 'Username already exists' });
        }

        if (password.length < 6) {
            return reply.code(400).send({ message: 'Password must be at least 6 characters long' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const { rows } = await client.query(
            'INSERT INTO users(username, email, password_hash, is_admin, created_at, description) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, username, email, is_admin, description',
            [username, email, hashedPassword, false, new Date(), null]
        );

        return { id: rows[0].id, username: rows[0].username, email: rows[0].email, description: rows[0].description };
    } finally {
        client.release();
    }
}