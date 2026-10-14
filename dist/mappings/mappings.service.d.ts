import { GraphdbService } from '../graphdb/graphdb.service';
import { UploadAlignmentDto } from './mappings.dto';
export declare class MappingsService {
    private readonly graphdb;
    constructor(graphdb: GraphdbService);
    list(limit?: number): Promise<any[]>;
    listAlignments(): Promise<{
        graph: any;
        id: any;
        source: any;
        target: any;
        file: any;
    }[]>;
    uploadAlignment(dto: UploadAlignmentDto, file: Express.Multer.File): Promise<{
        id: string;
        graph: string;
        source: string;
        target: string;
        file: string;
        bytes: number;
    }>;
    create(concept: string, targetUri: string, relation?: string, conceptUri?: string): Promise<{
        conceptUri: string;
        concept: string;
        relation: string;
        targetUri: string;
    }>;
}
