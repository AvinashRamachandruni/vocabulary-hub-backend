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
exports.GraphdbService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let GraphdbService = class GraphdbService {
    config;
    repository;
    baseUrl;
    queryEndpoint;
    statementsEndpoint;
    mappingGraph;
    resourceGraph;
    constructor(config) {
        this.config = config;
        this.queryEndpoint = this.config.get('GRAPHDB_URL', 'http://graphdb:7200/repositories/Vocabulary_Hub_MVP').replace(/\/$/, '');
        this.repository = this.queryEndpoint.split('/').pop() ?? '';
        this.baseUrl = this.queryEndpoint.replace(/\/repositories\/[^/]+$/, '');
        this.statementsEndpoint = `${this.queryEndpoint}/statements`;
        this.mappingGraph = this.config.get('GRAPHDB_MAPPING_GRAPH', 'http://example.org/graph/hub/mappings');
        this.resourceGraph = this.config.get('GRAPHDB_RESOURCE_GRAPH', 'http://example.org/graph/hub/resources');
    }
    async select(query) {
        const body = new URLSearchParams({ query });
        const response = await fetch(this.queryEndpoint, {
            method: 'POST',
            headers: { Accept: 'application/sparql-results+json', 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
        });
        if (!response.ok)
            throw new common_1.ServiceUnavailableException(`GraphDB SELECT failed: ${response.status} ${await response.text()}`);
        const json = await response.json();
        return json.results?.bindings ?? [];
    }
    async update(update) {
        const body = new URLSearchParams({ update });
        const response = await fetch(this.statementsEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
        });
        if (!response.ok)
            throw new common_1.ServiceUnavailableException(`GraphDB UPDATE failed: ${response.status} ${await response.text()}`);
    }
    async upload(content, contentType, graphUri, baseUri) {
        const params = new URLSearchParams({ context: `<${graphUri}>` });
        if (baseUri)
            params.set('baseURI', `<${baseUri}>`);
        const url = `${this.statementsEndpoint}?${params}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': contentType },
            body: typeof content === 'string' ? content : new Uint8Array(content),
        });
        if (!response.ok)
            throw new common_1.ServiceUnavailableException(`GraphDB upload failed: ${response.status} ${await response.text()}`);
    }
    async ping() {
        try {
            const response = await fetch(`${this.baseUrl}/rest/repositories`, { signal: AbortSignal.timeout(5000) });
            return response.ok;
        }
        catch {
            return false;
        }
    }
};
exports.GraphdbService = GraphdbService;
exports.GraphdbService = GraphdbService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GraphdbService);
//# sourceMappingURL=graphdb.service.js.map