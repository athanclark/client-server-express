# Client / Server - express.js

To start the database, you can use [docker compose](https://docs.docker.com/compose/):

```bash
docker compose up
```

... optionally starting the database as a [daemon](https://en.wikipedia.org/wiki/Daemon_(computing)):


```bash
docker compose up -d
```

Then, you can get node running:

```bash
npm ci
node app.js
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
          completed boolean
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
    Server->>Client: {JSON}
```

#### Getting the steps of a specific task

```mermaid
---
title: Get Steps for a Task
---
sequenceDiagram
    Client->>Server: GET /task/:id
    Server->>DB: SELECT * FROM steps WHERE task = :id
    DB->>Server: [Rows]
    Server->>Client: {JSON}
```
