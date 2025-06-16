import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../src/app';
import { sign } from 'jsonwebtoken';

describe('📦 Test Suite: seen.test.ts', () => {
    let adminToken: string;
    let userToken: string;
    let anotherUserToken: string;
    let testMovieId: number;
    let testBookId: number;
    let testSeenId: number;

    beforeAll(async () => {
        await app.ready();

        const uniqueId = Date.now();

        const adminRegisterResponse = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: {
                username: `testadmin${uniqueId}`,
                email: `testadmin${uniqueId}@example.com`,
                password: 'password123'
            }
        });
        const adminUser = JSON.parse(adminRegisterResponse.payload);

        const userRegisterResponse = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: {
                username: `testuser${uniqueId}`,
                email: `testuser${uniqueId}@example.com`,
                password: 'password123'
            }
        });
        const normalUser = JSON.parse(userRegisterResponse.payload);

        const anotherUserRegisterResponse = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: {
                username: `anothertestuser${uniqueId}`,
                email: `anothertestuser${uniqueId}@example.com`,
                password: 'password123'
            }
        });
        const anotherUser = JSON.parse(anotherUserRegisterResponse.payload);

        adminToken = sign(
            { id: adminUser.id, username: adminUser.username, email: adminUser.email, is_admin: true },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );

        userToken = sign(
            { id: normalUser.id, username: normalUser.username, email: normalUser.email, is_admin: false },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );

        anotherUserToken = sign(
            { id: anotherUser.id, username: anotherUser.username, email: anotherUser.email, is_admin: false },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );

        const movieResponse = await app.inject({
            method: 'POST',
            url: '/api/v1/movies',
            headers: {
                authorization: `Bearer ${adminToken}`
            },
            payload: {
                title: 'Test Movie for Seen',
                cover_image: 'test.jpg',
                description: 'A test movie',
                director: 'Test Director',
                release_date: '2023-01-01',
                genre: 'Action'
            }
        });
        const movieData = JSON.parse(movieResponse.payload);
        testMovieId = movieData.id;

        const bookResponse = await app.inject({
            method: 'POST',
            url: '/api/v1/books',
            headers: {
                authorization: `Bearer ${adminToken}`
            },
            payload: {
                title: 'Test Book for Seen',
                description: 'A test book',
                author: 'Test Author',
                publish_date: '2023-01-01',
                genre: 'Fiction',
                cover_image: 'test.jpg'
            }
        });
        const bookData = JSON.parse(bookResponse.payload);
        testBookId = bookData.id;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('🔹 POST /seen', () => {
        it('should return 401 for missing token', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/seen',
                payload: {
                    movie_id: testMovieId,
                    book_id: null
                }
            });

            expect(response.statusCode).toBe(401);
        });

        it('should return 400 for invalid data (missing movie_id and book_id)', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/seen',
                headers: {
                    authorization: `Bearer ${userToken}`
                },
                payload: {
                    movie_id: null,
                    book_id: null
                }
            });

            expect(response.statusCode).toBe(400);
            const errorResponse = JSON.parse(response.payload);
            expect(errorResponse.message).toBe('Either movie_id or book_id must be provided');
        });

        it('should create a seen record for movie', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/seen',
                headers: {
                    authorization: `Bearer ${userToken}`
                },
                payload: {
                    movie_id: testMovieId,
                    book_id: null
                }
            });

            expect(response.statusCode).toBe(200);
            const seen = JSON.parse(response.payload);
            expect(seen.movie_id).toBe(testMovieId);
            expect(seen.book_id).toBeNull();
            testSeenId = seen.id;
        });

        it('should create a seen record for book', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/seen',
                headers: {
                    authorization: `Bearer ${anotherUserToken}`
                },
                payload: {
                    movie_id: null,
                    book_id: testBookId
                }
            });

            expect(response.statusCode).toBe(200);
            const seen = JSON.parse(response.payload);
            expect(seen.movie_id).toBeNull();
            expect(seen.book_id).toBe(testBookId);
        });

        it('should return 400 for duplicate seen record', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/seen',
                headers: {
                    authorization: `Bearer ${userToken}`
                },
                payload: {
                    movie_id: testMovieId,
                    book_id: null
                }
            });

            expect(response.statusCode).toBe(400);
            const errorResponse = JSON.parse(response.payload);
            expect(errorResponse.message).toBe('Seen already exists');
        });
    });

    describe('🔹 DELETE /seen/:id', () => {
        it('should return 401 for missing token', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: `/api/v1/seen/${testSeenId}`
            });

            expect(response.statusCode).toBe(401);
        });

        it('should return 404 for non-existent seen record', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: '/api/v1/seen/9999',
                headers: {
                    authorization: `Bearer ${userToken}`
                }
            });

            expect(response.statusCode).toBe(404);
            const errorResponse = JSON.parse(response.payload);
            expect(errorResponse.message).toBe('Seen not found');
        });

        it('should return 403 for non-owner', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: `/api/v1/seen/${testSeenId}`,
                headers: {
                    authorization: `Bearer ${anotherUserToken}`
                }
            });

            expect(response.statusCode).toBe(403);
            const errorResponse = JSON.parse(response.payload);
            expect(errorResponse.message).toBe('You are not the owner of this seen');
        });

        it('should delete seen record by owner', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: `/api/v1/seen/${testSeenId}`,
                headers: {
                    authorization: `Bearer ${userToken}`
                }
            });

            expect(response.statusCode).toBe(204);
            expect(response.payload).toBe('');
        });
    });
}); 