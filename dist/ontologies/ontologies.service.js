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
exports.OntologiesService = void 0;
const common_1 = require("@nestjs/common");
const graphdb_service_1 = require("../graphdb/graphdb.service");
const sparql_1 = require("../common/sparql");
let OntologiesService = class OntologiesService {
    graphdb;
    constructor(graphdb) {
        this.graphdb = graphdb;
    }
    async register(dto) {
        const graphUri = `http://example.org/graph/ontology/${encodeURIComponent(dto.id)}`;
        const resourceUri = `http://example.org/vocab-hub/resource/${encodeURIComponent(dto.id)}`;
        await this.graphdb.update(`
PREFIX hub: <http://example.org/vocab-hub#>
PREFIX dcterms: <http://purl.org/dc/terms/>
INSERT DATA {
  GRAPH <${this.graphdb.resourceGraph}> {
    ${(0, sparql_1.iri)(resourceUri)} a hub:SemanticResource ;
      dcterms:title "${(0, sparql_1.escapeSparqlString)(dto.title)}" ;
      dcterms:description "${(0, sparql_1.escapeSparqlString)(dto.description ?? '')}" ;
      dcterms:publisher "${(0, sparql_1.escapeSparqlString)(dto.publisher ?? '')}" ;
      hub:resourceType "${(0, sparql_1.escapeSparqlString)(dto.resourceType ?? 'ontology')}" ;
      hub:accessLevel "${(0, sparql_1.escapeSparqlString)(dto.accessLevel ?? 'public')}" ;
      hub:resourceFormat "${(0, sparql_1.escapeSparqlString)(dto.format ?? 'text/turtle')}" ;
      hub:availability "remote+cached" ;
      hub:namespaceURI "${(0, sparql_1.escapeSparqlString)(dto.namespace)}" ;
      hub:sourceURI "${(0, sparql_1.escapeSparqlString)(dto.sourceUrl)}" ;
      hub:domainTag "${(0, sparql_1.escapeSparqlString)(dto.domain ?? '')}" ;
      hub:graphURI "${(0, sparql_1.escapeSparqlString)(graphUri)}" .
  }
}`);
        return { ...dto, resourceUri, graphUri };
    }
    async sync(id, sourceUrl, contentType) {
        const graphUri = `http://example.org/graph/ontology/${encodeURIComponent(id)}`;
        const response = await fetch(sourceUrl, { headers: { Accept: 'text/turtle, application/rdf+xml, application/ld+json;q=0.9, */*;q=0.1' } });
        if (!response.ok)
            throw new common_1.BadRequestException(`Could not fetch ontology: ${response.status} ${response.statusText}`);
        const body = Buffer.from(await response.arrayBuffer());
        const type = contentType || response.headers.get('content-type')?.split(';')[0] || 'text/turtle';
        await this.graphdb.update(`CLEAR GRAPH <${graphUri}>`);
        await this.graphdb.upload(body, type, graphUri);
        return { id, graphUri, sourceUrl, contentType: type, bytes: body.length, syncedAt: new Date().toISOString() };
    }
};
exports.OntologiesService = OntologiesService;
exports.OntologiesService = OntologiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [graphdb_service_1.GraphdbService])
], OntologiesService);
//# sourceMappingURL=ontologies.service.js.map