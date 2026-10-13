import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

async function loadEnv(file = '.env') {
  try {
    const text = await fs.readFile(file, 'utf8');
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const i = line.indexOf('=');
      if (i < 0) continue;
      const key = line.slice(0, i).trim();
      const value = line.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // Environment variables may already be provided by the shell/CI.
  }
}

await loadEnv();

const repositoryUrl = (process.env.GRAPHDB_URL ?? 'http://localhost:7200/repositories/Vocabulary_Hub_MVP').replace(/\/$/, '');
const repositoryMatch = repositoryUrl.match(/^(https?:\/\/[^/]+)\/repositories\/([^/?#]+)$/);
if (!repositoryMatch) throw new Error('GRAPHDB_URL must be a repository URL ending in /repositories/{repository}');
const [, baseUrl, repository] = repositoryMatch;
const graphs = {
  resources: process.env.GRAPHDB_RESOURCE_GRAPH ?? 'http://example.org/graph/hub/resources',
  mappings: process.env.GRAPHDB_MAPPING_GRAPH ?? 'http://example.org/graph/hub/mappings',
  ifc: process.env.GRAPHDB_IFC_GRAPH ?? 'http://example.org/graph/ontology/ifc',
};

async function ensureOk(response, label) {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${label} failed (${response.status}): ${body}`);
  }
  return response;
}

console.log(`GraphDB: ${baseUrl}`);
const repos = await ensureOk(await fetch(`${baseUrl}/rest/repositories`), 'Repository lookup').then(r => r.json());
if (!repos.some(r => r.id === repository)) {
  const configPath = path.resolve('graphdb/init/repository-config.ttl');
  const config = await fs.readFile(configPath);
  const form = new FormData();
  form.append('config', new Blob([config], { type: 'text/turtle' }), 'repository-config.ttl');
  await ensureOk(await fetch(`${baseUrl}/rest/repositories`, { method: 'POST', body: form }), 'Repository creation');
  console.log(`Created repository ${repository}`);
} else {
  console.log(`Repository ${repository} already exists`);
}

async function upload(relativePath, graph, contentType) {
  const bytes = await fs.readFile(path.resolve(relativePath));
  const context = encodeURIComponent(`<${graph}>`);
  await ensureOk(await fetch(`${repositoryUrl}/statements?context=${context}`, {
    method: 'POST',
    headers: { 'content-type': contentType },
    body: bytes,
  }), `Upload ${relativePath}`);
  console.log(`Loaded ${relativePath} -> ${graph}`);
}

await upload('graphdb/seed/hub_resources.ttl', graphs.resources, 'text/turtle');
await upload('graphdb/seed/hub_mappings.ttl', graphs.mappings, 'text/turtle');
await upload('graphdb/seed/IFContology.xml', graphs.ifc, 'application/rdf+xml');
console.log('GraphDB initialization complete.');
