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

You can view the documentation in the [docs folder](./docs/README.md).

To build the [mermaid.js diagrams](https://mermaid.js.org) for the documentation, you'll need
[nix](https://nixos.org):

```bash
cd docs/
nix-shell --command ./build.sh ../shell.nix
```
