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

app.use(express.static('./public/dist'));
app.use((req, res, next) => {
    console.info(`Incoming Request: ${req.method} ${req.url}`);
    next();
});

app.get('/tasks', async (req, res) => {
    const result = await client.query('SELECT id, title, description FROM tasks');
    res.json(result.rows);
});

// app.use((req, res) => {
//     res.status(404).set('Content-Type', 'text/plain').send('Not Found');
// });

app.listen(process.env.PORT | 8000);
