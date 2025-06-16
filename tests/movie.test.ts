import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import app from '../src/app';
import { sign } from 'jsonwebtoken';
import FormData from 'form-data';

vi.mock('../src/middleware/cloudinary', () => ({
    uploadToCloudinary: vi.fn().mockResolvedValue('https://res.cloudinary.com/test/image/upload/v123456789/test-image.jpg')
}));

describe('📦 Test Suite: movie.test.ts', () => {
    let adminToken: string;
    let userToken: string;
    let testMovieId: number;

    beforeAll(async () => {
        await app.ready();

        adminToken = sign(
            { id: 1, username: 'admin', email: 'admin@example.com', is_admin: true },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );

        userToken = sign(
            { id: 2, username: 'user', email: 'user@example.com', is_admin: false },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );
    });

    afterAll(async () => {
        await app.close();
    });

    describe('🔹 GET /movies', () => {
        it('should return movies with pagination', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/movies?page=1'
            });

            expect(response.statusCode).toBe(200);
            const movies = JSON.parse(response.payload);
            expect(Array.isArray(movies)).toBe(true);
        });
    });

    describe('🔹 GET /movies/search', () => {
        it('should search movies by title', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/movies/search?title=test'
            });

            expect(response.statusCode).toBe(200);
            const movies = JSON.parse(response.payload);
            expect(Array.isArray(movies)).toBe(true);
        });
    });

    describe('🔹 GET /movies/genre', () => {
        it('should get movies by genre', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/movies/genre?genre=Action&page=1'
            });

            expect(response.statusCode).toBe(200);
            const movies = JSON.parse(response.payload);
            expect(Array.isArray(movies)).toBe(true);
        });
    });

    describe('🔹 POST /movies', () => {
        it('should return 401 without token', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/movies',
                payload: {
                    title: 'Test Movie',
                    cover_image: 'test.jpg',
                    description: 'Test description',
                    director: 'Test Director',
                    release_date: '2023-01-01',
                    genre: 'Action'
                }
            });

            expect(response.statusCode).toBe(401);
        });

        it('should return 403 for non-admin user', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/movies',
                headers: {
                    authorization: `Bearer ${userToken}`
                },
                payload: {
                    title: 'Test Movie',
                    cover_image: 'test.jpg',
                    description: 'Test description',
                    director: 'Test Director',
                    release_date: '2023-01-01',
                    genre: 'Action'
                }
            });

            expect(response.statusCode).toBe(403);
        });

        it('should create movie for admin', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/movies',
                headers: {
                    authorization: `Bearer ${adminToken}`
                },
                payload: {
                    title: 'Test Movie',
                    cover_image: 'test.jpg',
                    description: 'Test description',
                    director: 'Test Director',
                    release_date: '2023-01-01',
                    genre: 'Action'
                }
            });

            expect(response.statusCode).toBe(201);
            const movie = JSON.parse(response.payload);
            expect(movie.title).toBe('Test Movie');
            testMovieId = movie.id;
        });

        it('should create movie with multipart form data', async () => {
            const imageBuffer = Buffer.from('fake-image-data');

            const form = new FormData();
            form.append('title', 'Test Movie Multipart');
            form.append('description', 'Test description multipart');
            form.append('director', 'Test Director Multipart');
            form.append('release_date', '2023-01-01');
            form.append('genre', 'Drama');
            form.append('cover_image', imageBuffer, {
                filename: 'test-movie-image.png',
                contentType: 'image/png'
            });

            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/movies',
                headers: {
                    authorization: `Bearer ${adminToken}`,
                    'content-type': `multipart/form-data; boundary=${form.getBoundary()}`
                },
                payload: form.getBuffer()
            });

            expect(response.statusCode).toBe(201);
            const movie = JSON.parse(response.payload);
            expect(movie.title).toBe('Test Movie Multipart');
            expect(movie.director).toBe('Test Director Multipart');
            expect(movie.genre).toBe('Drama');
            expect(movie.cover_image).toBe('https://res.cloudinary.com/test/image/upload/v123456789/test-image.jpg');
        });

        it('should create movie with multipart without file', async () => {
            const form = new FormData();
            form.append('title', 'Test Movie No File');
            form.append('description', 'Test description no file');
            form.append('director', 'Test Director No File');
            form.append('release_date', '2023-01-01');
            form.append('genre', 'Comedy');

            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/movies',
                headers: {
                    authorization: `Bearer ${adminToken}`,
                    'content-type': `multipart/form-data; boundary=${form.getBoundary()}`
                },
                payload: form.getBuffer()
            });

            expect(response.statusCode).toBe(201);
            const movie = JSON.parse(response.payload);
            expect(movie.title).toBe('Test Movie No File');
            expect(movie.genre).toBe('Comedy');
            expect([null, '']).toContain(movie.cover_image);
        });
    });

    describe('🔹 GET /movies/:id', () => {
        it('should return 404 for non-existent movie', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/movies/999999'
            });

            expect(response.statusCode).toBe(404);
        });

        it('should return movie by id', async () => {
            const response = await app.inject({
                method: 'GET',
                url: `/api/v1/movies/${testMovieId}`
            });

            expect(response.statusCode).toBe(200);
            const movie = JSON.parse(response.payload);
            expect(movie.id).toBe(testMovieId);
        });
    });

    describe('🔹 PATCH /movies/:id', () => {
        it('should return 401 without token', async () => {
            const response = await app.inject({
                method: 'PATCH',
                url: `/api/v1/movies/${testMovieId}`,
                payload: {
                    title: 'Updated Movie'
                }
            });

            expect(response.statusCode).toBe(401);
        });

        it('should return 403 for non-admin user', async () => {
            const response = await app.inject({
                method: 'PATCH',
                url: `/api/v1/movies/${testMovieId}`,
                headers: {
                    authorization: `Bearer ${userToken}`
                },
                payload: {
                    title: 'Updated Movie'
                }
            });

            expect(response.statusCode).toBe(403);
        });

        it('should update movie for admin', async () => {
            const response = await app.inject({
                method: 'PATCH',
                url: `/api/v1/movies/${testMovieId}`,
                headers: {
                    authorization: `Bearer ${adminToken}`
                },
                payload: {
                    title: 'Updated Movie'
                }
            });

            expect(response.statusCode).toBe(200);
            const movie = JSON.parse(response.payload);
            expect(movie.title).toBe('Updated Movie');
        });

        it('should update movie with multipart form data', async () => {
            const imageBuffer = Buffer.from('fake-updated-image-data');

            const form = new FormData();
            form.append('title', 'Updated Movie Multipart');
            form.append('description', 'Updated description multipart');
            form.append('cover_image', imageBuffer, {
                filename: 'updated-movie-image.png',
                contentType: 'image/png'
            });

            const response = await app.inject({
                method: 'PATCH',
                url: `/api/v1/movies/${testMovieId}`,
                headers: {
                    authorization: `Bearer ${adminToken}`,
                    'content-type': `multipart/form-data; boundary=${form.getBoundary()}`
                },
                payload: form.getBuffer()
            });

            expect(response.statusCode).toBe(200);
            const movie = JSON.parse(response.payload);
            expect(movie.title).toBe('Updated Movie Multipart');
            expect(movie.description).toBe('Updated description multipart');
            expect(movie.cover_image).toBe('https://res.cloudinary.com/test/image/upload/v123456789/test-image.jpg');
        });

        it('should update movie with multipart without file', async () => {
            const form = new FormData();
            form.append('title', 'Updated Movie No File');
            form.append('genre', 'Thriller');

            const response = await app.inject({
                method: 'PATCH',
                url: `/api/v1/movies/${testMovieId}`,
                headers: {
                    authorization: `Bearer ${adminToken}`,
                    'content-type': `multipart/form-data; boundary=${form.getBoundary()}`
                },
                payload: form.getBuffer()
            });

            expect(response.statusCode).toBe(200);
            const movie = JSON.parse(response.payload);
            expect(movie.title).toBe('Updated Movie No File');
            expect(movie.genre).toBe('Thriller');
        });
    });

    describe('🔹 DELETE /movies/:id', () => {
        it('should return 401 without token', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: `/api/v1/movies/${testMovieId}`
            });

            expect(response.statusCode).toBe(401);
        });

        it('should return 403 for non-admin user', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: `/api/v1/movies/${testMovieId}`,
                headers: {
                    authorization: `Bearer ${userToken}`
                }
            });

            expect(response.statusCode).toBe(403);
        });

        it('should delete movie for admin', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: `/api/v1/movies/${testMovieId}`,
                headers: {
                    authorization: `Bearer ${adminToken}`
                }
            });

            expect(response.statusCode).toBe(204);
        });
    });
}); 