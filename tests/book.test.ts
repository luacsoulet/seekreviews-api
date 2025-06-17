import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import app from '../src/app';
import { sign } from 'jsonwebtoken';
import FormData from 'form-data';

vi.mock('../src/middleware/cloudinary', () => ({
    uploadToCloudinary: vi.fn().mockResolvedValue('https://res.cloudinary.com/test/image/upload/v123456789/test-book.jpg')
}));

describe('📦 Test Suite: book.test.ts', () => {
    let adminToken: string;
    let userToken: string;
    let testBookId: number;

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

    describe('🔹 GET /books', () => {
        it('should return books with pagination', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/books?page=1'
            });

            expect(response.statusCode).toBe(200);
            const books = JSON.parse(response.payload);
            expect(Array.isArray(books)).toBe(true);
        });
    });

    describe('🔹 GET /books/search', () => {
        it('should search books by title', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/books/search?title=test'
            });

            expect([200, 404]).toContain(response.statusCode);
            if (response.statusCode === 200) {
                const books = JSON.parse(response.payload);
                expect(Array.isArray(books)).toBe(true);
            }
        });
    });

    describe('🔹 GET /books/genre', () => {
        it('should get books by genre', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/books/genre?genre=Fiction&page=1'
            });

            expect([200, 404]).toContain(response.statusCode);
            if (response.statusCode === 200) {
                const books = JSON.parse(response.payload);
                expect(Array.isArray(books)).toBe(true);
            }
        });
    });

    describe('🔹 POST /books', () => {
        it('should return 401 without token', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/books',
                payload: {
                    title: 'Test Book',
                    description: 'Test description',
                    author: 'Test Author',
                    genre: 'Fiction',
                    cover_image: 'test.jpg',
                    publish_date: '2023-01-01'
                }
            });

            expect(response.statusCode).toBe(401);
        });

        it('should return 403 for non-admin user', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/books',
                headers: {
                    authorization: `Bearer ${userToken}`
                },
                payload: {
                    title: 'Test Book',
                    description: 'Test description',
                    author: 'Test Author',
                    genre: 'Fiction',
                    cover_image: 'test.jpg',
                    publish_date: '2023-01-01'
                }
            });

            expect(response.statusCode).toBe(403);
        });

        it('should create book for admin', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/books',
                headers: {
                    authorization: `Bearer ${adminToken}`
                },
                payload: {
                    title: 'Test Book',
                    description: 'Test description',
                    author: 'Test Author',
                    genre: 'Fiction',
                    cover_image: 'test.jpg',
                    publish_date: '2023-01-01'
                }
            });

            expect(response.statusCode).toBe(201);
            const book = JSON.parse(response.payload);
            expect(book.title).toBe('Test Book');
            expect(book.author).toBe('Test Author');
            testBookId = book.id;
        });

        it('should create book with multipart form data', async () => {
            const imageBuffer = Buffer.from('fake-book-image-data');

            const form = new FormData();
            form.append('title', 'Test Book Multipart');
            form.append('description', 'Test description multipart');
            form.append('author', 'Test Author Multipart');
            form.append('genre', 'Science Fiction');
            form.append('publish_date', '2023-02-01');
            form.append('cover_image', imageBuffer, {
                filename: 'test-book-image.png',
                contentType: 'image/png'
            });

            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/books',
                headers: {
                    authorization: `Bearer ${adminToken}`,
                    'content-type': `multipart/form-data; boundary=${form.getBoundary()}`
                },
                payload: form.getBuffer()
            });

            expect(response.statusCode).toBe(201);
            const book = JSON.parse(response.payload);
            expect(book.title).toBe('Test Book Multipart');
            expect(book.author).toBe('Test Author Multipart');
            expect(book.genre).toBe('Science Fiction');
            expect(book.cover_image).toBe('https://res.cloudinary.com/test/image/upload/v123456789/test-book.jpg');
        });

        it('should create book with multipart without file', async () => {
            const form = new FormData();
            form.append('title', 'Test Book No File');
            form.append('description', 'Test description no file');
            form.append('author', 'Test Author No File');
            form.append('genre', 'Mystery');
            form.append('publish_date', '2023-03-01');

            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/books',
                headers: {
                    authorization: `Bearer ${adminToken}`,
                    'content-type': `multipart/form-data; boundary=${form.getBoundary()}`
                },
                payload: form.getBuffer()
            });

            expect(response.statusCode).toBe(201);
            const book = JSON.parse(response.payload);
            expect(book.title).toBe('Test Book No File');
            expect(book.genre).toBe('Mystery');
            expect([null, '']).toContain(book.cover_image);
        });
    });

    describe('🔹 GET /books/:id', () => {
        it('should return 404 for non-existent book', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/books/999999'
            });

            expect(response.statusCode).toBe(404);
        });

        it('should return book by id', async () => {
            const response = await app.inject({
                method: 'GET',
                url: `/api/v1/books/${testBookId}`
            });

            expect(response.statusCode).toBe(200);
            const book = JSON.parse(response.payload);
            expect(book.id).toBe(testBookId);
            expect(book.title).toBe('Test Book');
        });
    });

    describe('🔹 PATCH /books/:id', () => {
        it('should return 401 without token', async () => {
            const response = await app.inject({
                method: 'PATCH',
                url: `/api/v1/books/${testBookId}`,
                payload: {
                    title: 'Updated Book'
                }
            });

            expect(response.statusCode).toBe(401);
        });

        it('should return 403 for non-admin user', async () => {
            const response = await app.inject({
                method: 'PATCH',
                url: `/api/v1/books/${testBookId}`,
                headers: {
                    authorization: `Bearer ${userToken}`
                },
                payload: {
                    title: 'Updated Book'
                }
            });

            expect(response.statusCode).toBe(403);
        });

        it('should update book for admin', async () => {
            const response = await app.inject({
                method: 'PATCH',
                url: `/api/v1/books/${testBookId}`,
                headers: {
                    authorization: `Bearer ${adminToken}`
                },
                payload: {
                    title: 'Updated Book',
                    description: 'Updated description'
                }
            });

            expect(response.statusCode).toBe(200);
            const book = JSON.parse(response.payload);
            expect(book.title).toBe('Updated Book');
            expect(book.description).toBe('Updated description');
        });

        it('should update book with multipart form data', async () => {
            const imageBuffer = Buffer.from('fake-updated-book-image');

            const form = new FormData();
            form.append('title', 'Updated Book Multipart');
            form.append('author', 'Updated Author Multipart');
            form.append('genre', 'Updated Genre');
            form.append('cover_image', imageBuffer, {
                filename: 'updated-book-image.png',
                contentType: 'image/png'
            });

            const response = await app.inject({
                method: 'PATCH',
                url: `/api/v1/books/${testBookId}`,
                headers: {
                    authorization: `Bearer ${adminToken}`,
                    'content-type': `multipart/form-data; boundary=${form.getBoundary()}`
                },
                payload: form.getBuffer()
            });

            expect(response.statusCode).toBe(200);
            const book = JSON.parse(response.payload);
            expect(book.title).toBe('Updated Book Multipart');
            expect(book.author).toBe('Updated Author Multipart');
            expect(book.genre).toBe('Updated Genre');
            expect(book.cover_image).toBe('https://res.cloudinary.com/test/image/upload/v123456789/test-book.jpg');
        });

        it('should update book with multipart without file', async () => {
            const form = new FormData();
            form.append('title', 'Updated Book No File');
            form.append('description', 'Updated description no file');

            const response = await app.inject({
                method: 'PATCH',
                url: `/api/v1/books/${testBookId}`,
                headers: {
                    authorization: `Bearer ${adminToken}`,
                    'content-type': `multipart/form-data; boundary=${form.getBoundary()}`
                },
                payload: form.getBuffer()
            });

            expect(response.statusCode).toBe(200);
            const book = JSON.parse(response.payload);
            expect(book.title).toBe('Updated Book No File');
            expect(book.description).toBe('Updated description no file');
        });
    });

    describe('🔹 DELETE /books/:id', () => {
        it('should return 401 without token', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: `/api/v1/books/${testBookId}`
            });

            expect(response.statusCode).toBe(401);
        });

        it('should return 403 for non-admin user', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: `/api/v1/books/${testBookId}`,
                headers: {
                    authorization: `Bearer ${userToken}`
                }
            });

            expect(response.statusCode).toBe(403);
        });

        it('should delete book for admin', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: `/api/v1/books/${testBookId}`,
                headers: {
                    authorization: `Bearer ${adminToken}`
                }
            });

            expect(response.statusCode).toBe(204);
        });

        it('should return 404 when trying to delete non-existent book', async () => {
            const response = await app.inject({
                method: 'DELETE',
                url: '/api/v1/books/999999',
                headers: {
                    authorization: `Bearer ${adminToken}`
                }
            });

            expect(response.statusCode).toBe(404);
        });
    });
}); 