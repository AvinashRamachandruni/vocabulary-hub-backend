"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MappingsService = void 0;
const common_1 = require("@nestjs/common");
const graphdb_service_1 = require("../graphdb/graphdb.service");
const sparql_1 = require("../common/sparql");
const crypto_1 = require("crypto");
let MappingsService = class MappingsService {
    graphdb;
    constructor(graphdb) {
        this.graphdb = graphdb;
    }
    async list(limit = 500) {
        return this.graphdb.select(`
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX hub: <http://example.org/vocab-hub#>
PREFIX align: <http://knowledgeweb.semanticweb.org/heterogeneity/alignment#>
SELECT DISTINCT ?concept ?label ?relation ?target ?graph WHERE {
  {
    GRAPH <${this.graphdb.mappingGraph}> {
    ?concept a skos:Concept ; skos:prefLabel ?label ; ?relation ?target .
    FILTER(?relation IN (skos:exactMatch, skos:relatedMatch))
    }
    BIND(<${this.graphdb.mappingGraph}> AS ?graph)
  } UNION {
    GRAPH <${this.graphdb.mappingGraph}> { ?graph a hub:OntologyAlignment . }
    GRAPH ?graph {
      {
        ?concept ?relation ?target .
        FILTER(?relation IN (skos:exactMatch, skos:relatedMatch, skos:closeMatch,
          skos:broadMatch, skos:narrowMatch, owl:equivalentClass, owl:equivalentProperty,
          owl:sameAs, rdfs:subClassOf, rdfs:subPropertyOf))
      } UNION {
        ?cell align:entity1 ?concept ; align:entity2 ?target ; align:relation ?relation .
      }
      OPTIONAL { ?concept rdfs:label|skos:prefLabel ?label . }
    }
  }
} ORDER BY ?label LIMIT ${Math.min(Math.max(limit, 1), 2000)}`);
    }
    async listAlignments() {
        const rows = await this.graphdb.select(`
PREFIX hub: <http://example.org/vocab-hub#>
SELECT ?graph ?id ?source ?target ?file WHERE {
  GRAPH <${this.graphdb.mappingGraph}> {
    ?graph a hub:OntologyAlignment ; hub:alignmentId ?id ;
      hub:sourceOntology ?source ; hub:targetOntology ?target ; hub:uploadedFile ?file .
  }
} ORDER BY ?id`);
        return rows.map(row => ({ graph: row.graph.value, id: row.id.value,
            source: row.source.value, target: row.target.value, file: row.file.value }));
    }
    async uploadAlignment(dto, file) {
        if (!file.originalname.toLowerCase().endsWith('.ttl') || !file.size) {
            throw new common_1.BadRequestException('A non-empty .ttl alignment file is required');
        }
        if (dto.sourceOntology === dto.targetOntology) {
            throw new common_1.BadRequestException('Select two different registered ontologies');
        }
        const ontologies = await this.graphdb.select(`
PREFIX hub: <http://example.org/vocab-hub#>
SELECT DISTINCT ?resource WHERE {
  GRAPH <${this.graphdb.resourceGraph}> {
    VALUES ?resource { ${(0, sparql_1.iri)(dto.sourceOntology)} ${(0, sparql_1.iri)(dto.targetOntology)} }
    ?resource a hub:SemanticResource ; hub:resourceType "ontology" ; hub:graphURI ?ontologyGraph .
  }
}`);
        if (new Set(ontologies.map(row => row.resource.value)).size !== 2) {
            throw new common_1.BadRequestException('Both ontologies must be registered with a named graph');
        }
        const graphUri = `http://example.org/vocab-hub/mapping/${dto.id}`;
        const existing = await this.graphdb.select(`SELECT ?predicate WHERE {
      GRAPH <${this.graphdb.mappingGraph}> { ${(0, sparql_1.iri)(graphUri)} ?predicate ?value }
    } LIMIT 1`);
        if (existing.length)
            throw new common_1.ConflictException('An alignment with this ID already exists');
        await this.graphdb.upload(file.buffer, 'text/turtle', graphUri, graphUri);
        await this.graphdb.update(`
PREFIX hub: <http://example.org/vocab-hub#>
INSERT DATA { GRAPH <${this.graphdb.mappingGraph}> {
  ${(0, sparql_1.iri)(graphUri)} a hub:OntologyAlignment ;
    hub:alignmentId "${(0, sparql_1.escapeSparqlString)(dto.id)}" ;
    hub:sourceOntology ${(0, sparql_1.iri)(dto.sourceOntology)} ; hub:targetOntology ${(0, sparql_1.iri)(dto.targetOntology)} ;
    hub:uploadedFile "${(0, sparql_1.escapeSparqlString)(file.originalname)}" .
} }`);
        return { id: dto.id, graph: graphUri, source: dto.sourceOntology,
            target: dto.targetOntology, file: file.originalname, bytes: file.size };
    }
    async create(concept, targetUri, relation = 'exactMatch', conceptUri) {
        const hash = (0, crypto_1.createHash)('sha1').update(concept.toLowerCase()).digest('hex').slice(0, 12);
        const hubConcept = conceptUri ?? `http://example.org/vocab-hub/concept/${hash}`;
        const predicate = relation === 'relatedMatch' ? 'skos:relatedMatch' : 'skos:exactMatch';
        await this.graphdb.update(`
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
INSERT DATA {
  GRAPH <${this.graphdb.mappingGraph}> {
    ${(0, sparql_1.iri)(hubConcept)} a skos:Concept ;
      skos:prefLabel "${(0, sparql_1.escapeSparqlString)(concept)}"@en ;
      ${predicate} ${(0, sparql_1.iri)(targetUri)} .
  }
}`);
        return { conceptUri: hubConcept, concept, relation, targetUri };
    }
};
exports.MappingsService = MappingsService;
exports.MappingsService = MappingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [graphdb_service_1.GraphdbService])
], MappingsService);
//# sourceMappingURL=mappings.service.js.map