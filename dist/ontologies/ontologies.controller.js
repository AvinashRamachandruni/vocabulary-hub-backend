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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OntologiesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const ontologies_dto_1 = require("./ontologies.dto");
const ontologies_service_1 = require("./ontologies.service");
let OntologiesController = class OntologiesController {
    service;
    constructor(service) {
        this.service = service;
    }
    register(dto) { return this.service.register(dto); }
    async registerUpload(dto, file) {
        if (!file)
            throw new common_1.BadRequestException('A Turtle file is required');
        return this.service.registerUpload(dto, file);
    }
    sync(id, sourceUrl, contentType) {
        return this.service.sync(id, sourceUrl, contentType);
    }
};
exports.OntologiesController = OntologiesController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register ontology metadata in the Vocabulary Hub' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ontologies_dto_1.RegisterOntologyDto]),
    __metadata("design:returntype", void 0)
], OntologiesController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('register-upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { limits: { fileSize: 25 * 1024 * 1024 } })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', required: ['id', 'title', 'namespace', 'sourceUrl', 'file'], properties: {
                id: { type: 'string' }, title: { type: 'string' }, namespace: { type: 'string' }, sourceUrl: { type: 'string' },
                description: { type: 'string' }, publisher: { type: 'string' }, domain: { type: 'string' },
                file: { type: 'string', format: 'binary' },
            } } }),
    (0, swagger_1.ApiOperation)({ summary: 'Register ontology metadata and upload a Turtle file into GraphDB' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ontologies_dto_1.RegisterOntologyDto, Object]),
    __metadata("design:returntype", Promise)
], OntologiesController.prototype, "registerUpload", null);
__decorate([
    (0, common_1.Post)(':id/sync'),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch ontology from a canonical URL and cache it in GraphDB' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('sourceUrl')),
    __param(2, (0, common_1.Query)('contentType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], OntologiesController.prototype, "sync", null);
exports.OntologiesController = OntologiesController = __decorate([
    (0, swagger_1.ApiTags)('Ontology ingestion'),
    (0, common_1.Controller)('ontologies'),
    __metadata("design:paramtypes", [ontologies_service_1.OntologiesService])
], OntologiesController);
//# sourceMappingURL=ontologies.controller.js.map