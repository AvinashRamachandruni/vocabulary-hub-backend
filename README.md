# WILSON Vocabulary Hub — Backend

NestJS REST API backed by GraphDB. This is the single application backend used by both the React frontend and external adapters such as the EDC adapter.

## Local run

1. Start GraphDB locally on port 7200.
2. Configure and run:

```bash
cp .env.example .env
npm install
npm run graphdb:init
npm run start:dev
```

API: `http://localhost:3000/api`  
Swagger: `http://localhost:3000/swagger`

## Production build

```bash
npm run build
npm start
```

## Docker

```bash
docker build -t wilson-vocabulary-hub-backend .
```

GraphDB is intentionally an external service/container. The `graphdb/` and `scripts/init-graphdb.mjs` files are included so this project can initialise a configured GraphDB instance.

For a cloud/server container deployment with GraphDB as a separate container:

```bash
docker compose up -d --build
# after GraphDB is ready, initialise/seed it from a Node checkout:
npm run graphdb:init
```
