const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ConfigService } = require('@nestjs/config');
const { GraphdbService } = require('../dist/graphdb/graphdb.service');
const { SearchService } = require('../dist/search/search.service');
const { MappingsService } = require('../dist/mappings/mappings.service');

const graphs = {
  mappingGraph: 'http://example.org/graph/hub/mappings',
  resourceGraph: 'http://example.org/graph/hub/resources',
};
const dto = {
  id: 'Brick-bot',
  sourceOntology: 'http://example.org/vocab-hub/resource/brick',
  targetOntology: 'http://example.org/vocab-hub/resource/bot',
};
const file = { originalname: 'Brick-bot.ttl', buffer: Buffer.from('<a> <b> <c> .'), size: 13 };

test('alignment upload validates ontology registry and preserves separate graph and parser base', async () => {
  const calls = [];
  let selections = 0;
  const service = new MappingsService({ ...graphs,
    select: async () => ++selections === 1
      ? [dto.sourceOntology, dto.targetOntology].map(value => ({ resource: { value } })) : [],
    upload: async (...args) => calls.push(args),
    update: async query => calls.push(query),
  });
  const result = await service.uploadAlignment(dto, file);
  assert.equal(result.graph, 'http://example.org/vocab-hub/mapping/Brick-bot');
  assert.deepEqual(calls[0], [file.buffer, 'text/turtle', result.graph, result.graph]);
  assert.match(calls[1], /hub:sourceOntology/);
  assert.match(calls[1], /hub:targetOntology/);
});

test('alignment upload rejects invalid files, identical ontologies, unknown ontologies, and duplicate IDs', async () => {
  let uploads = 0;
  const service = new MappingsService({ ...graphs, select: async () => [], upload: async () => uploads++ });
  await assert.rejects(service.uploadAlignment(dto, { ...file, originalname: 'file.rdf' }), /non-empty .ttl/);
  await assert.rejects(service.uploadAlignment(dto, { ...file, size: 0 }), /non-empty .ttl/);
  await assert.rejects(service.uploadAlignment({ ...dto, targetOntology: dto.sourceOntology }, file), /different/);
  await assert.rejects(service.uploadAlignment(dto, file), /Both ontologies/);
  let selections = 0;
  service.graphdb.select = async () => ++selections === 1
    ? [dto.sourceOntology, dto.targetOntology].map(value => ({ resource: { value } })) : [{ predicate: {} }];
  await assert.rejects(service.uploadAlignment(dto, file), /already exists/);
  assert.equal(uploads, 0);
});

test('discovery escapes regex input', async () => {
  let query;
  await new SearchService({ ...graphs, select: async value => { query = value; return []; } }).discover('Sensor (A+)');
  assert.ok(!query.includes('LIMIT 200'));
  assert.ok(query.includes(String.raw`\\(a\\+\\)`));
});

test('discovery ranks exact, whole-word, partial, and URI matches with missing labels/types before limiting', async () => {
  const row = (term, label) => ({ term: { value: term }, ...(label ? { label: { value: label } } : {}) });
  const rows = [row('https://sensor.example.org/Room', 'Room'), row('https://example.org/Sensorium', 'Sensorium'),
    row('https://example.org/Air_Sensor', 'Air Sensor'), row('https://example.org/SensorWithoutLabel'),
    row('https://example.org/Sensor', 'Sensor')];
  const service = new SearchService({ ...graphs, select: async () => rows });
  const results = await service.discover('sensor');
  assert.deepEqual(results.map(result => result.label), ['Sensor', '', 'Air Sensor', 'Sensorium', 'Room']);
  assert.equal(results[1].type, '');
  rows.splice(0, 0, ...Array.from({ length: 205 }, (_, index) => row(`https://sensor.example.org/Room${index}`, 'Room')));
  const limited = await service.discover('sensor');
  assert.equal(limited.length, 200);
  assert.equal(limited[0].label, 'Sensor');
});

test('GraphDB executes discovery over loaded ontology graphs without null-literal errors', {
  skip: !process.env.GRAPHDB_URL,
}, async () => {
  const graphdb = new GraphdbService(new ConfigService(process.env));
  const search = new SearchService(graphdb);
  for (const query of ['sensor', 'space', 'air handling unit', 'Sensor (A+)']) {
    assert.ok(Array.isArray(await search.discover(query)));
  }
  const service = new MappingsService(graphdb);
  assert.ok(Array.isArray(await service.list()));
  assert.ok(Array.isArray(await service.listAlignments()));
});