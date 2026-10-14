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
exports.MappingsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const mappings_dto_1 = require("./mappings.dto");
const mappings_service_1 = require("./mappings.service");
let MappingsController = class MappingsController {
    service;
    constructor(service) {
        this.service = service;
    }
    alignments() { return this.service.listAlignments(); }
    uploadAlignment(dto, file) {
        if (!file)
            throw new common_1.BadRequestException('An alignment Turtle file is required');
        return this.service.uploadAlignment(dto, file);
    }
    list(limit) { return this.service.list(limit ? Number(limit) : 500); }
    create(dto) { return this.service.create(dto.concept, dto.targetUri, dto.relation, dto.conceptUri); }
};
exports.MappingsController = MappingsController;
__decorate([
    (0, common_1.Get)('alignments'),
    (0, swagger_1.ApiOperation)({ summary: 'List uploaded ontology alignments' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MappingsController.prototype, "alignments", null);
__decorate([
    (0, common_1.Post)('alignments/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { limits: { fileSize: 25 * 1024 * 1024 } })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', required: ['id', 'sourceOntology', 'targetOntology', 'file'], properties: {
                id: { type: 'string' }, sourceOntology: { type: 'string' }, targetOntology: { type: 'string' },
                file: { type: 'string', format: 'binary' },
            } } }),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a Turtle alignment between two registered ontologies' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mappings_dto_1.UploadAlignmentDto, Object]),
    __metadata("design:returntype", void 0)
], MappingsController.prototype, "uploadAlignment", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List curated SKOS exact/related mappings' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MappingsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a curated mapping between a hub concept and an ontology term' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mappings_dto_1.CreateMappingDto]),
    __metadata("design:returntype", void 0)
], MappingsController.prototype, "create", null);
exports.MappingsController = MappingsController = __decorate([
    (0, swagger_1.ApiTags)('Mappings'),
    (0, common_1.Controller)('mappings'),
    __metadata("design:paramtypes", [mappings_service_1.MappingsService])
], MappingsController);
//# sourceMappingURL=mappings.controller.js.map