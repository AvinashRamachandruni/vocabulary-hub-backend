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
exports.ResourcesService = void 0;
const common_1 = require("@nestjs/common");
const graphdb_service_1 = require("../graphdb/graphdb.service");
const val = (row, key) => row?.[key]?.value ?? '';
let ResourcesService = class ResourcesService {
    graphdb;
    constructor(graphdb) {
        this.graphdb = graphdb;
    }
    async list() {
        const rows = await this.graphdb.select(`
PREFIX hub: <http://example.org/vocab-hub#>
PREFIX dcterms: <http://purl.org/dc/terms/>
SELECT DISTINCT ?resource ?title ?description ?publisher ?resourceType ?accessLevel ?resourceFormat ?availability ?namespaceURI ?sourceURI ?domainTag ?graphURI
WHERE {
  GRAPH <${this.graphdb.resourceGraph}> {
    ?resource a hub:SemanticResource ; dcterms:title ?title ; hub:resourceType ?resourceType ; hub:accessLevel ?accessLevel ; hub:namespaceURI ?namespaceURI .
    OPTIONAL { ?resource dcterms:description ?description . }
    OPTIONAL { ?resource dcterms:publisher ?publisher . }
    OPTIONAL { ?resource hub:resourceFormat ?resourceFormat . }
    OPTIONAL { ?resource hub:availability ?availability . }
    OPTIONAL { ?resource hub:sourceURI ?sourceURI . }
    OPTIONAL { ?resource hub:domainTag ?domainTag . }
    OPTIONAL { ?resource hub:graphURI ?graphURI . }
  }
}
ORDER BY ?title`);
        return rows.map((r) => ({
            id: val(r, 'resource'), title: val(r, 'title'), description: val(r, 'description'), publisher: val(r, 'publisher'),
            type: val(r, 'resourceType'), access: val(r, 'accessLevel'), format: val(r, 'resourceFormat'),
            availability: val(r, 'availability'), namespace: val(r, 'namespaceURI'), source: val(r, 'sourceURI'),
            domain: val(r, 'domainTag'), graph: val(r, 'graphURI'),
        }));
    }
};
exports.ResourcesService = ResourcesService;
exports.ResourcesService = ResourcesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [graphdb_service_1.GraphdbService])
], ResourcesService);
//# sourceMappingURL=resources.service.js.map