import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Authentication Routes', () => {
    beforeAll(async () => {
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /api/v1/auth/register', () => {
        it('should register a new user successfully', async () => {
            const uniqueId = Date.now();
            const response = await request(app.server)
                .post('/api/v1/auth/register')
                .send({
                    username: `testuser${uniqueId}`,
                    email: `test${uniqueId}@example.com`,
                    password: 'password123'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('username', `testuser${uniqueId}`);
            expect(response.body).toHaveProperty('email', `test${uniqueId}@example.com`);
        });

        it('should fail to register with existing email', async () => {
            const uniqueId = Date.now();
            await request(app.server)
                .post('/api/v1/auth/register')
                .send({
                    username: `testuser${uniqueId}`,
                    email: `test${uniqueId}@example.com`,
                    password: 'password123'
                });

            const response = await request(app.server)
                .post('/api/v1/auth/register')
                .send({
                    username: `testuser2${uniqueId}`,
                    email: `test${uniqueId}@example.com`,
                    password: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'User already exists');
        });

        it('should fail to register with existing username', async () => {
            const uniqueId = Date.now();
            await request(app.server)
                .post('/api/v1/auth/register')
                .send({
                    username: `testuser${uniqueId}`,
                    email: `test${uniqueId}@example.com`,
                    password: 'password123'
                });

            const response = await request(app.server)
                .post('/api/v1/auth/register')
                .send({
                    username: `testuser${uniqueId}`,
                    email: `test2${uniqueId}@example.com`,
                    password: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Username already exists');
        });

        it('should fail to register with password too short', async () => {
            const uniqueId = Date.now();
            const response = await request(app.server)
                .post('/api/v1/auth/register')
                .send({
                    username: `testuser${uniqueId}`,
                    email: `test${uniqueId}@example.com`,
                    password: '12345'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'body/password must NOT have fewer than 6 characters');
        });

        it('should fail to register with missing required fields', async () => {
            const uniqueId = Date.now();
            const response = await request(app.server)
                .post('/api/v1/auth/register')
                .send({
                    username: `testuser${uniqueId}`,
                    email: `test${uniqueId}@example.com`
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'body must have required property \'password\'');
        });
    });
});