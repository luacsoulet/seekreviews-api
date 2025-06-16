import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../src/app';
import { sign } from 'jsonwebtoken';

describe('📦 Test Suite: user.test.ts', () => {
    let adminToken: string;
    let userToken: string;
    let testUserId: number;
    let anotherUserToken: string;
    let anotherUserId: number;

    beforeAll(async () => {
        await app.ready();

        adminToken = sign(
            { id: 1, username: 'admin', email: 'admin@example.com', is_admin: true },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );

        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            }
        });

        const userData = JSON.parse(response.payload);
        testUserId = userData.id;

        userToken = sign(
            { id: testUserId, username: 'testuser', email: 'test@example.com', is_admin: false },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );

        const anotherResponse = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: {
                username: 'anotheruser',
                email: 'another@example.com',
                password: 'password123'
            }
        });

        const anotherUserData = JSON.parse(anotherResponse.payload);
        anotherUserId = anotherUserData.id;

        anotherUserToken = sign(
            { id: anotherUserId, username: 'anotheruser', email: 'another@example.com', is_admin: false },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );
    });

    afterAll(async () => {
        await app.close();
    });

    describe('🔹 GET /users', () => {
        it('should return 401 without token', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/users'
            });

            expect(response.statusCode).toBe(401);
        });

        it('should return 403 for non-admin user', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/users',
                headers: {
                    authorization: `Bearer ${userToken}`
                }
            });

            expect(response.statusCode).toBe(403);
        });

        it('should return all users for admin', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/users',
                headers: {
                    authorization: `Bearer ${adminToken}`
                }
            });

            expect(response.statusCode).toBe(200);
            const users = JSON.parse(response.payload);
            expect(Array.isArray(users)).toBe(true);
        });
    });

    describe('🔹 GET /users/:id', () => {
        it('should return 404 for non-existent user', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/users/999999'
            });

            expect(response.statusCode).toBe(404);
        });

        it('should return user by id', async () => {
            const response = await app.inject({
                method: 'GET',
                url: `/api/v1/users/${testUserId}`
            });

            expect(response.statusCode).toBe(200);
            const user = JSON.parse(response.payload);
            expect(user.id).toBe(testUserId);
        });
    });

    describe('🔹 GET /users/:id/favorites', () => {
        it('should return user favorites', async () => {
            const response = await app.inject({
                method: 'GET',
                url: `/api/v1/users/${testUserId}/favorites`
            });

            expect(response.statusCode).toBe(200);
            const favorites = JSON.parse(response.payload);
            expect(Array.isArray(favorites)).toBe(true);
        });
    });

    describe('🔹 GET /users/:id/seen', () => {
        it('should return user seen items', async () => {
            const response = await app.inject({
                method: 'GET',
                url: `/api/v1/users/${testUserId}/seen`
            });

            expect(response.statusCode).toBe(200);
            const seen = JSON.parse(response.payload);
            expect(Array.isArray(seen)).toBe(true);
        });
    });

    describe('🔹 PUT /users/:id', () => {
        it('should return 401 without token', async () => {
            const response = await app.inject({
                method: 'PATCH',
                url: `/api/v1/users/${testUserId}`,
                payload: {
                    username: 'updateduser'
                }
            });

            expect(response.statusCode).toBe(401);
        });

        it('should return 403 when updating other user', async () => {
            const response = await app.inject({
                method: 'PATCH',
                url: `/api/v1/users/${testUserId}`,
                headers: {
                    authorization: `Bearer ${anotherUserToken}`
                },
                payload: {
                    username: 'updateduser'
                }
            });

            expect(response.statusCode).toBe(403);
        });

        it('should update user profile', async () => {
            const response = await app.inject({
                method: 'PATCH',
                url: `/api/v1/users/${testUserId}`,
                headers: {
                    authorization: `Bearer ${userToken}`
                },
                payload: {
                    username: 'updateduser',
                    description: 'Test description'
                }
            });

            expect(response.statusCode).toBe(200);
            const updatedUser = JSON.parse(response.payload);
            expect(updatedUser.username).toBe('updateduser');
            expect(updatedUser.description).toBe('Test description');
        });
    });

    describe('🔹 DELETE /users/:id', () => {
        it('should return 401 without token', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: `/api/v1/users/${testUserId}`
            });

            expect(response.statusCode).toBe(401);
        });

        it('should return 403 when non-admin tries to delete other user', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: `/api/v1/users/${testUserId}`,
                headers: {
                    authorization: `Bearer ${anotherUserToken}`
                }
            });

            expect(response.statusCode).toBe(403);
        });

        it('should delete user when admin', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: `/api/v1/users/${testUserId}`,
                headers: {
                    authorization: `Bearer ${adminToken}`
                }
            });

            expect(response.statusCode).toBe(204);
        });
    });
}); 