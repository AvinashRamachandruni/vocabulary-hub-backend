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
exports.ResourcesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const resources_service_1 = require("./resources.service");
let ResourcesController = class ResourcesController {
    service;
    constructor(service) {
        this.service = service;
    }
    list() { return this.service.list(); }
};
exports.ResourcesController = ResourcesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List registered semantic resources / vocabularies' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ResourcesController.prototype, "list", null);
exports.ResourcesController = ResourcesController = __decorate([
    (0, swagger_1.ApiTags)('Vocabularies'),
    (0, common_1.Controller)('vocabularies'),
    __metadata("design:paramtypes", [resources_service_1.ResourcesService])
], ResourcesController);
//# sourceMappingURL=resources.controller.js.map