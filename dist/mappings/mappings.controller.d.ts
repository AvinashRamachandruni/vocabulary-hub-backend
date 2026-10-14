import { CreateMappingDto, UploadAlignmentDto } from './mappings.dto';
import { MappingsService } from './mappings.service';
export declare class MappingsController {
    private readonly service;
    constructor(service: MappingsService);
    alignments(): Promise<{
        graph: any;
        id: any;
        source: any;
        target: any;
        file: any;
    }[]>;
    uploadAlignment(dto: UploadAlignmentDto, file?: Express.Multer.File): Promise<{
        id: string;
        graph: string;
        source: string;
        target: string;
        file: string;
        bytes: number;
    }>;
    list(limit?: string): Promise<any[]>;
    create(dto: CreateMappingDto): Promise<{
        conceptUri: string;
        concept: string;
        relation: string;
        targetUri: string;
    }>;
}
