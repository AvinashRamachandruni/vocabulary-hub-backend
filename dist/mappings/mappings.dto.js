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
exports.CreateMappingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateMappingDto {
    concept;
    targetUri;
    relation = 'exactMatch';
    conceptUri;
}
exports.CreateMappingDto = CreateMappingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'air handling unit' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], CreateMappingDto.prototype, "concept", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://brickschema.org/schema/Brick#Air_Handler_Unit' }),
    (0, class_validator_1.IsUrl)({ require_tld: false }),
    __metadata("design:type", String)
], CreateMappingDto.prototype, "targetUri", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['exactMatch', 'relatedMatch'], default: 'exactMatch' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['exactMatch', 'relatedMatch']),
    __metadata("design:type", String)
], CreateMappingDto.prototype, "relation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional preferred URI for the hub concept.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({ require_tld: false }),
    __metadata("design:type", String)
], CreateMappingDto.prototype, "conceptUri", void 0);
//# sourceMappingURL=mappings.dto.js.map