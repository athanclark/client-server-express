# Entity Relationship Diagram

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

# Client / Server / DB Sequence Diagrams

Here are some sequence diagrams to help discuss how the server should behaive.

## Initialization

The Client will need to initialize and fetch all the tasks:

![Init](./init.mmdc.svg)

![Get Steps](./get-steps.mmdc.svg)
