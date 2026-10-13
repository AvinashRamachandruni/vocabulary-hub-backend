import { GraphdbService } from '../graphdb/graphdb.service';
export declare class MappingsService {
    private readonly graphdb;
    constructor(graphdb: GraphdbService);
    list(limit?: number): Promise<any[]>;
    create(concept: string, targetUri: string, relation?: string, conceptUri?: string): Promise<{
        conceptUri: string;
        concept: string;
        relation: string;
        targetUri: string;
    }>;
}
