import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../src/app';
import { sign } from 'jsonwebtoken';

describe('📦 Test Suite: comment.test.ts', () => {
    let adminToken: string;
    let userToken: string;
    let anotherUserToken: string;
    let testMovieId: number;
    let testBookId: number;
    let testCommentId: number;

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
                title: 'Test Movie for Comments',
                cover_image: 'test.jpg',
                description: 'Test description',
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
                title: 'Test Book for Comments',
                description: 'Test description',
                author: 'Test Author',
                genre: 'Fiction',
                cover_image: 'test.jpg',
                publish_date: '2023-01-01'
            }
        });
        const bookData = JSON.parse(bookResponse.payload);
        testBookId = bookData.id;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('🔹 GET /comments/movie', () => {
        it('should return movie comments', async () => {
            const response = await app.inject({
                method: 'GET',
                url: `/api/v1/comments/movie?movie_id=${testMovieId}`
            });

            expect(response.statusCode).toBe(200);
            const comments = JSON.parse(response.payload);
            expect(Array.isArray(comments)).toBe(true);
        });
    });

    describe('🔹 GET /comments/book', () => {
        it('should return book comments', async () => {
            const response = await app.inject({
                method: 'GET',
                url: `/api/v1/comments/book?book_id=${testBookId}`
            });

            expect(response.statusCode).toBe(200);
            const comments = JSON.parse(response.payload);
            expect(Array.isArray(comments)).toBe(true);
        });
    });

    describe('🔹 POST /comments', () => {
        it('should return 401 without token', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/comments',
                payload: {
                    movie_id: testMovieId,
                    book_id: null,
                    message: 'Test comment'
                }
            });

            expect(response.statusCode).toBe(401);
        });

        it('should return 400 when both movie_id and book_id are null', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/comments',
                headers: {
                    authorization: `Bearer ${userToken}`
                },
                payload: {
                    movie_id: null,
                    book_id: null,
                    message: 'Test comment'
                }
            });

            expect(response.statusCode).toBe(400);
        });

        it('should create movie comment for authenticated user', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/comments',
                headers: {
                    authorization: `Bearer ${userToken}`
                },
                payload: {
                    movie_id: testMovieId,
                    book_id: null,
                    message: 'This is a test movie comment'
                }
            });

            expect(response.statusCode).toBe(200);
            const comment = JSON.parse(response.payload);
            expect(comment.message).toBe('This is a test movie comment');
            expect(comment.movie_id).toBe(testMovieId);
            expect(comment.book_id).toBeNull();
            testCommentId = comment.id;
        });

        it('should create book comment for authenticated user', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/comments',
                headers: {
                    authorization: `Bearer ${userToken}`
                },
                payload: {
                    movie_id: null,
                    book_id: testBookId,
                    message: 'This is a test book comment'
                }
            });

            expect(response.statusCode).toBe(200);
            const comment = JSON.parse(response.payload);
            expect(comment.message).toBe('This is a test book comment');
            expect(comment.book_id).toBe(testBookId);
            expect(comment.movie_id).toBeNull();
        });
    });

    describe('🔹 PUT /comments/:id', () => {
        it('should return 401 without token', async () => {
            const response = await app.inject({
                method: 'PUT',
                url: `/api/v1/comments/${testCommentId}`,
                payload: {
                    message: 'Updated comment'
                }
            });

            expect(response.statusCode).toBe(401);
        });

        it('should return 404 for non-existent comment', async () => {
            const response = await app.inject({
                method: 'PUT',
                url: '/api/v1/comments/999999',
                headers: {
                    authorization: `Bearer ${userToken}`
                },
                payload: {
                    message: 'Updated comment'
                }
            });

            expect(response.statusCode).toBe(404);
        });

        it('should return 403 when trying to modify another user\'s comment', async () => {
            const response = await app.inject({
                method: 'PUT',
                url: `/api/v1/comments/${testCommentId}`,
                headers: {
                    authorization: `Bearer ${anotherUserToken}`
                },
                payload: {
                    message: 'Trying to update another user comment'
                }
            });

            expect(response.statusCode).toBe(403);
        });

        it('should update comment for owner', async () => {
            const response = await app.inject({
                method: 'PUT',
                url: `/api/v1/comments/${testCommentId}`,
                headers: {
                    authorization: `Bearer ${userToken}`
                },
                payload: {
                    message: 'Updated test comment'
                }
            });

            expect(response.statusCode).toBe(200);
            const comment = JSON.parse(response.payload);
            expect(comment.message).toBe('Updated test comment');
        });
    });

    describe('🔹 DELETE /comments/:id', () => {
        let commentToDeleteId: number;

        beforeAll(async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/comments',
                headers: {
                    authorization: `Bearer ${userToken}`
                },
                payload: {
                    movie_id: testMovieId,
                    book_id: null,
                    message: 'Comment to delete'
                }
            });
            const comment = JSON.parse(response.payload);
            commentToDeleteId = comment.id;
        });

        it('should return 401 without token', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: `/api/v1/comments/${commentToDeleteId}`
            });

            expect(response.statusCode).toBe(401);
        });

        it('should return 404 for non-existent comment', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: '/api/v1/comments/999999',
                headers: {
                    authorization: `Bearer ${userToken}`
                }
            });

            expect(response.statusCode).toBe(404);
        });

        it('should return 403 when trying to delete another user\'s comment', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: `/api/v1/comments/${commentToDeleteId}`,
                headers: {
                    authorization: `Bearer ${anotherUserToken}`
                }
            });

            expect(response.statusCode).toBe(403);
        });

        it('should delete comment for owner', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: `/api/v1/comments/${commentToDeleteId}`,
                headers: {
                    authorization: `Bearer ${userToken}`
                }
            });

            expect(response.statusCode).toBe(204);
        });
    });
}); 