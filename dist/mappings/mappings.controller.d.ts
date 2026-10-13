import { CreateMappingDto } from './mappings.dto';
import { MappingsService } from './mappings.service';
export declare class MappingsController {
    private readonly service;
    constructor(service: MappingsService);
    list(limit?: string): Promise<any[]>;
    create(dto: CreateMappingDto): Promise<{
        conceptUri: string;
        concept: string;
        relation: string;
        targetUri: string;
    }>;
}
