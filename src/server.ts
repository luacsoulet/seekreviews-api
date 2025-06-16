import app from './app';

const start = async () => {
    try {
        const port = process.env.PORT || 4000;
        const address = await app.listen({ port: Number(port), host: '0.0.0.0' });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();