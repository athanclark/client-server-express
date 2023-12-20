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
          completed boolean "DEFAULT=FALSE"
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

#### Getting a specific task

```mermaid
---
title: Get a Task
---
sequenceDiagram
    Client->>Server: GET /task/:id
    Server->>DB: SELECT * FROM tasks WHERE id = :id
    DB->>Server: {title, desc, first_step}
    loop Every Step
      Server->>DB: SELECT * FROM steps WHERE id = first_step
      DB->>Server: row
      Server->>DB: SELECT * FROM steps WHERE id = row.next_step
      DB->>Server: row
      Server-->>DB: ...
      DB-->>Server: ...
      Server->>DB: SELECT * FROM steps WHERE id = row.next_step
      DB->>Server: row (next_step == NULL)
    end
    Server->>Client: {title, desc, steps: [...]}
```

#### Adding a new task

```mermaid
---
title: Add a new task
---
sequenceDiagram
    Client->>Server: POST /tasks {title, desc, steps}
    loop Every Step in Reverse
      Server->>DB: INSERT INTO steps (title, description) VALUES (..., ...) RETURNING id -- last step
      DB->>Server: id
      Server->>DB: INSERT INTO steps (next_step, title, description) VALUES (..., ..., ...) RETURNING id -- 2nd to last step
      DB->>Server: id
      Server-->>DB: ...
      DB-->>Server: ...
      Server->>DB: INSERT INTO steps (next_step, title, description) VALUES (..., ..., ...) RETURNING id -- first step
      DB->>Server: id
    end
    Server->>DB: INSERT INTO tasks (title, description, first_step) VALUES (..., ..., ...) RETURNING id
    DB->>Server: id
    Server->>Client: task id
```


#### Updating a task

```mermaid
---
title: Update a task
---
sequenceDiagram
    Client->>Server: PATCH /tasks {id, title, desc, steps}
    loop Every Step in Reverse
      Server->>DB: UPDATE steps SET title = ..., description = ... WHERE id = ... -- last step
      Server->>DB: UPDATE steps SET next_step = ...prev id..., title = ..., description = ... WHERE id = ... -- 2nd to last step
      Server-->>DB: ...
      Server->>DB: UPDATE steps SET next_step = ...prev id..., title = ..., description = ... WHERE id = ... -- first step
    end
    Server->>DB: UPDATE tasks title = ..., description = ..., first_step = ... WHERE id = ...
    Server->>Client: {id, title, desc, steps}
```
