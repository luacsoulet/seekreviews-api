import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../src/app';
import { sign } from 'jsonwebtoken';

describe('📦 Test Suite: rating.test.ts', () => {
    let adminToken: string;
    let userToken: string;
    let anotherUserToken: string;
    let testMovieId: number;
    let testBookId: number;
    let testRatingId: number;

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
                title: 'Test Movie for Ratings',
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
                title: 'Test Book for Ratings',
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

    describe('🔹 GET /ratings/movie', () => {
        it('should return movie ratings', async () => {
            const response = await app.inject({
                method: 'GET',
                url: `/api/v1/ratings/movie?movie_id=${testMovieId}`
            });

            expect(response.statusCode).toBe(200);
            const ratings = JSON.parse(response.payload);
            expect(Array.isArray(ratings)).toBe(true);
        });
    });

    describe('🔹 GET /ratings/book', () => {
        it('should return book ratings', async () => {
            const response = await app.inject({
                method: 'GET',
                url: `/api/v1/ratings/book?book_id=${testBookId}`
            });

            expect(response.statusCode).toBe(200);
            const ratings = JSON.parse(response.payload);
            expect(Array.isArray(ratings)).toBe(true);
        });
    });

    describe('🔹 GET /ratings/user', () => {
        it('should return user ratings', async () => {
            const userPayload = JSON.parse(Buffer.from(userToken.split('.')[1], 'base64').toString());
            const userId = userPayload.id;

            const response = await app.inject({
                method: 'GET',
                url: `/api/v1/ratings/user?user_id=${userId}`
            });

            expect(response.statusCode).toBe(200);
            const ratings = JSON.parse(response.payload);
            expect(Array.isArray(ratings)).toBe(true);
        });
    });

    describe('🔹 POST /ratings', () => {
        it('should return 401 for missing token', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/ratings',
                payload: {
                    movie_id: testMovieId,
                    book_id: null,
                    rating: 5
                }
            });

            expect(response.statusCode).toBe(401);
        });

        it('should return 400 for invalid data (missing movie_id and book_id)', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/ratings',
                headers: {
                    authorization: `Bearer ${userToken}`
                },
                payload: {
                    movie_id: null,
                    book_id: null,
                    rating: 5
                }
            });

            expect(response.statusCode).toBe(400);
            const errorResponse = JSON.parse(response.payload);
            expect(errorResponse.message).toBe('Either movie_id or book_id must be provided');
        });

        it('should create a rating for movie', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/ratings',
                headers: {
                    authorization: `Bearer ${userToken}`
                },
                payload: {
                    movie_id: testMovieId,
                    book_id: null,
                    rating: 5
                }
            });

            expect(response.statusCode).toBe(200);
            const rating = JSON.parse(response.payload);

            expect(rating).toHaveProperty('id');
            expect(rating).toHaveProperty('movie_id');
            expect(rating).toHaveProperty('book_id');
            expect(rating).toHaveProperty('user_id');
            expect(rating).toHaveProperty('rating');
            expect(rating).toHaveProperty('created_at');

            expect(typeof rating.id).toBe('number');
            expect(typeof rating.movie_id).toBe('number');
            expect(rating.book_id).toBeNull();
            expect(typeof rating.user_id).toBe('number');
            expect(typeof rating.rating).toBe('number');
            expect(typeof rating.created_at).toBe('string');

            testRatingId = rating.id;
        });

        it('should create a rating for book', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/ratings',
                headers: {
                    authorization: `Bearer ${anotherUserToken}`
                },
                payload: {
                    movie_id: null,
                    book_id: testBookId,
                    rating: 4
                }
            });

            expect(response.statusCode).toBe(200);
            const rating = JSON.parse(response.payload);

            expect(rating).toHaveProperty('id');
            expect(rating).toHaveProperty('movie_id');
            expect(rating).toHaveProperty('book_id');
            expect(rating).toHaveProperty('user_id');
            expect(rating).toHaveProperty('rating');
            expect(rating).toHaveProperty('created_at');

            expect(typeof rating.id).toBe('number');
            expect(rating.movie_id).toBeNull();
            expect(typeof rating.book_id).toBe('number');
            expect(typeof rating.user_id).toBe('number');
            expect(typeof rating.rating).toBe('number');
            expect(typeof rating.created_at).toBe('string');
        });

        it('should return 400 for duplicate rating', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/ratings',
                headers: {
                    authorization: `Bearer ${userToken}`
                },
                payload: {
                    movie_id: testMovieId,
                    book_id: null,
                    rating: 4
                }
            });

            expect(response.statusCode).toBe(400);
            const errorResponse = JSON.parse(response.payload);
            expect(errorResponse.message).toBe('Rating already exists');
        });
    });

    describe('🔹 PATCH /ratings/:id', () => {
        it('should return 401 for missing token', async () => {
            const response = await app.inject({
                method: 'PATCH',
                url: `/api/v1/ratings/${testRatingId}`,
                payload: {
                    rating: 3
                }
            });

            expect(response.statusCode).toBe(401);
        });

        it('should return 404 for non-existent rating', async () => {
            const response = await app.inject({
                method: 'PATCH',
                url: '/api/v1/ratings/9999',
                headers: {
                    authorization: `Bearer ${userToken}`
                },
                payload: {
                    rating: 3
                }
            });

            expect(response.statusCode).toBe(404);
            const errorResponse = JSON.parse(response.payload);
            expect(errorResponse.message).toBe('Rating not found');
        });

        it('should return 403 for non-owner', async () => {
            const response = await app.inject({
                method: 'PATCH',
                url: `/api/v1/ratings/${testRatingId}`,
                headers: {
                    authorization: `Bearer ${anotherUserToken}`
                },
                payload: {
                    rating: 3
                }
            });

            expect(response.statusCode).toBe(403);
            const errorResponse = JSON.parse(response.payload);
            expect(errorResponse.message).toBe('You are not the owner of this rating');
        });

        it('should update rating by owner', async () => {
            const response = await app.inject({
                method: 'PATCH',
                url: `/api/v1/ratings/${testRatingId}`,
                headers: {
                    authorization: `Bearer ${userToken}`
                },
                payload: {
                    rating: 3
                }
            });

            expect(response.statusCode).toBe(200);
            const rating = JSON.parse(response.payload);

            expect(rating).toHaveProperty('id');
            expect(rating).toHaveProperty('movie_id');
            expect(rating).toHaveProperty('book_id');
            expect(rating).toHaveProperty('user_id');
            expect(rating).toHaveProperty('rating');
            expect(rating).toHaveProperty('created_at');

            expect(typeof rating.id).toBe('number');
            expect(typeof rating.user_id).toBe('number');
            expect(typeof rating.rating).toBe('number');
            expect(typeof rating.created_at).toBe('string');
            expect(rating.id).toBe(testRatingId);
        });
    });

    describe('🔹 DELETE /ratings/:id', () => {
        it('should return 401 for missing token', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: `/api/v1/ratings/${testRatingId}`
            });

            expect(response.statusCode).toBe(401);
        });

        it('should return 404 for non-existent rating', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: '/api/v1/ratings/9999',
                headers: {
                    authorization: `Bearer ${userToken}`
                }
            });

            expect(response.statusCode).toBe(404);
            const errorResponse = JSON.parse(response.payload);
            expect(errorResponse.message).toBe('Rating not found');
        });

        it('should return 403 for non-owner', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: `/api/v1/ratings/${testRatingId}`,
                headers: {
                    authorization: `Bearer ${anotherUserToken}`
                }
            });

            expect(response.statusCode).toBe(403);
            const errorResponse = JSON.parse(response.payload);
            expect(errorResponse.message).toBe('You are not the owner of this rating');
        });

        it('should delete rating by owner', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: `/api/v1/ratings/${testRatingId}`,
                headers: {
                    authorization: `Bearer ${userToken}`
                }
            });

            expect(response.statusCode).toBe(204);
            expect(response.payload).toBe('');
        });
    });
}); 