import express from 'express';
import pg from 'pg';

const pool = new pg.Pool({
    database: 'tasks',
    user: 'postgres',
    password: 'postgres',
    host: 'localhost'
});

const client = await pool.connect();

const app = express();

app.use(express.static('public'));
app.use((req, res, next) => {
    console.info(`Incoming Request: ${req.method} ${req.url}`);
    next();
});

// app.get('')

app.listen(process.env.PORT | 8000);
