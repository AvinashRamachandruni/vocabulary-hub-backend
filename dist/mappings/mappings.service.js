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
SELECT DISTINCT ?concept ?label ?relation ?target WHERE {
  GRAPH <${this.graphdb.mappingGraph}> {
    ?concept a skos:Concept ; skos:prefLabel ?label ; ?relation ?target .
    FILTER(?relation IN (skos:exactMatch, skos:relatedMatch))
  }
} ORDER BY ?label LIMIT ${Math.min(Math.max(limit, 1), 2000)}`);
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