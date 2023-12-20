# Client / Server - express.js

## Building

### Database

To start the database, you can use [docker compose](https://docs.docker.com/compose/):

```bash
docker compose up
```

... optionally starting the database as a [daemon](https://en.wikipedia.org/wiki/Daemon_(computing)):

```bash
docker compose up -d
```

### NPM Dependencies

```bash
npm ci
```

### Client & Server

You can get the client built and server running just with `npm start`:

```bash
npm start
```

This will build the client with [vite](https://vitejs.dev/), which will provide lots of nice
features like [cache busting](https://www.keycdn.com/support/what-is-cache-busting),
"browserification" of ES6 modules, etc.

You can also watch changes:

```bash
npm run watch
```

## Documentation

### Entity Relationship Diagram

The ERD is simple - there are tasks and steps for those tasks - a task starts with one step,
and each step points to its next step, if it exists:

```mermaid
---
title: Tasks and Steps
---
erDiagram
    steps {
          id serial PK
          title varchar(255)
          description text
          completed boolean FALSE
          next_step bigint FK "Linked List"
    }
    tasks {
          id serial PK
          title varchar(255)
          description text
          first_step bigint FK
    }
    steps ||--o| steps : next
    tasks ||--|| steps : first
```

### Client / Server / DB Sequence Diagrams

Here are some sequence diagrams to help discuss how the server should behaive.

#### Initialization

The Client will need to initialize and fetch all the tasks:

```mermaid
---
title: Load Application
---
sequenceDiagram
    Client->>Server: GET /index.html
    Server->>Client: HTML
    Client->>Server: GET /public/app.js, /public/styles.css
    Server->>Client: JS, CSS
    Client->>Server: GET /tasks
    Server->>DB: SELECT * FROM tasks
    DB->>Server: [Rows]
    Server->>Client: [{title, description, id}]
```

#### Getting the steps of a specific task

```mermaid
---
title: Get Steps for a Task
---
sequenceDiagram
    Client->>Server: GET /task/:id
    Server->>DB: SELECT first_step FROM tasks WHERE id = :id
    DB->>Server: first_step id
    loop Every Step
      Server->>DB: SELECT * FROM steps WHERE id = first_step
      DB->>Server: row
      Server->>DB: SELECT * FROM steps WHERE id = row.next_step
      DB->>Server: row
      Server-->>DB: ...
      Server->>DB: SELECT * FROM steps WHERE id = row.next_step
      DB->>Server: row (next_step == NULL)
    end
    Server->>Client: [{title, description, id, completed}]
```

#### Adding a new task

```mermaid
---
title: Add a new task
---
sequenceDiagram
    Client->>Server: POST /steps [{title, desc}, {title, desc}, ...]
    loop Every Step in Reverse
      Server->>DB: INSERT INTO steps (title, description) VALUES (..., ...) RETURNING id -- last step
      DB->>Server: id
      Server->>DB: INSERT INTO steps (next_step, title, description) VALUES (..., ..., ...) RETURNING id -- 2nd to last step
      DB->>Server: id
      Server-->>DB: ...
      Server->>DB: INSERT INTO steps (next_step, title, description) VALUES (..., ..., ...) RETURNING id -- first step
      DB->>Server: id
    end
    Server->>Client: first_step id
    Client->>Server: POST /tasks {title, desc, first_step}
    Server->>DB: INSERT INTO tasks (title, description, first_step) VALUES (..., ..., ...) RETURNING id
    DB->>Server: id
    Server->>Client: task id
```
