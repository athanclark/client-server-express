CREATE TABLE steps (
  id serial PRIMARY KEY,
  title varchar(255) NOT NULL,
  description text,
  completed boolean NOT NULL DEFAULT false,
  next_step integer REFERENCES steps(id)
);

CREATE TABLE tasks (
  id serial PRIMARY KEY,
  title varchar(255) NOT NULL,
  description text,
  first_step integer NOT NULL REFERENCES steps(id)
);
