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

## Ontology alignments

`POST /api/mappings/alignments/upload` accepts multipart fields `id`,
`sourceOntology`, `targetOntology`, and a `file` containing Turtle (up to 25 MB).
The ontology fields are resource URIs from `/api/vocabularies`; select two
different registered ontologies with named graphs. IDs contain letters, numbers,
hyphens, or underscores, start with a letter or number, and are at most 100 characters.

Each alignment is preserved in its own named graph, for example
`http://example.org/vocab-hub/mapping/Brick-bot`. This graph URI is also the
parser base for relative IRIs unless the Turtle declares its own base.
Use absolute term IRIs or an explicit `@base` when the alignment has another base.
Existing IDs are rejected rather than silently overwritten.

`GET /api/mappings/alignments` lists uploaded files and their selected ontologies.
`GET /api/mappings` includes manual mappings and imported SKOS/OWL relations or
Alignment API cells (`entity1`, `entity2`, `relation`). Curated search includes both
manual hub-concept mappings and registered ontology alignments, matching either
alignment endpoint by URI or label. OWL equivalence and Alignment API `=` count as
exact matches; subclass and subproperty relations count as related matches.

Discovery ranks exact label/local-name matches, whole-word matches, partial
label/local-name matches, and finally full-URI-only matches before limiting results.
It does not search descriptions or other literal fields.

After building, run the workflow checks with Node 22:

```bash
node --env-file=.env --test scripts/test-workflows.cjs
```

The GraphDB checks are read-only. Without `GRAPHDB_URL`, they are skipped.

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
