import express from 'express';
import pg from 'pg';

const pool = new pg.Pool({
    database: 'tasks',
    user: 'postgres',
    password: 'postgres',
    host: 'localhost'
});

const psql = await pool.connect();

const app = express();

function send500(res) {
    res.status(500).set('Content-Type', 'text/plain').send('Server Error');
}

app.use(express.static('./public/dist'));
app.use((req, res, next) => {
    console.info(`Incoming Request: ${req.method} ${req.url}`);
    next();
});

app.get('/tasks', async (req, res) => {
    const result = await psql.query('SELECT id, title, description FROM tasks');
    res.json(result.rows);
});

app.get('/tasks/:id', async (req, res, next) => {
    try {
        const result = await psql.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
        let steps = [];
        if (result.rows.length === 1) {
            let task = result.rows[0];
            let next_step = task.first_step;
            while (next_step !== null) {
                const step_result = await psql.query('SELECT * FROM steps WHERE id = $1', [next_step]);
                if (step_result.rows.length !== 1) {
                    throw new Error('Foreign key broken', step_result);
                }
                const step = step_result.rows[0];
                next_step = step.next_step;
                steps.push(step);
            }
            res.json({...task, steps});
        } else {
            next();
        }
    } catch(e) {
        console.warn('DB Error', e);
        send500(res);
    }
});

app.post('/steps', async (req, res) => {
    
});

app.post('/tasks', express.json({type: '*/*'}), async (req, res) => {
    const o = req.body;
    if (
        typeof o.title !== 'string'
            || (o.description ? typeof o.description !== 'string' : false)
            || !Array.isArray(o.steps)
            || !o.steps.every(s =>
                typeof s.title === 'string'
                    && (s.description ? typeof s.description === 'string' : true)
                    && (s.completed ? typeof s.completed === 'boolean' : true)
            )
    ) {
        console.warn('Bad Request', o);
        res.status(400).set('Content-Type', 'text/plain').send('Bad Request');
        return;
    }
    let next_step = null;
    // Create linked list for steps
    for (let i = o.steps.length - 1; i >= 0; i--) {
        let {title, description, completed} = o.steps[i];
        try {
            description = description || null;
            completed = completed || false;
            const result = await psql.query(
                'INSERT INTO steps (title, description, completed, next_step) VALUES ($1, $2, $3, $4) RETURNING id',
                [title, description, completed, next_step]
            );
            if (!result.rows) {
                console.warn('Result has no rows', result);
                throw new Error('Result has no rows');
            }
            if (result.rows.length !== 1) {
                throw new Error('Non-Singular rows returned on insert', result);
            }
            next_step = result.rows[0].id;
        } catch(e) {
            console.warn('DB Error', e);
            send500(res);
            return;
        }
    }
    // Insert task
    let {title, description} = o;
    description = description || null;
    try {
        const result = await psql.query(
            'INSERT INTO tasks (title, description, first_step) VALUES ($1, $2, $3) RETURNING id',
            [title, description, next_step]
        );
        if (result.rows.length !== 1) {
            throw new Error('Non-Singular rows returned on insert', result);
        }
        const { id } = result.rows[0];
        res.json(id);
    } catch(e) {
        console.warn('DB Error', e);
        send500(res);
    }
});

app.use((req, res) => {
    res.status(404).set('Content-Type', 'text/plain').send('Not Found');
});

app.listen(process.env.PORT | 8000);
