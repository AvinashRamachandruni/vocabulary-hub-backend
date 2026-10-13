import { GraphdbService } from '../graphdb/graphdb.service';
import { RegisterOntologyDto } from './ontologies.dto';
export declare class OntologiesService {
    private readonly graphdb;
    constructor(graphdb: GraphdbService);
    register(dto: RegisterOntologyDto): Promise<{
        resourceUri: string;
        graphUri: string;
        id: string;
        title: string;
        namespace: string;
        sourceUrl: string;
        description?: string;
        publisher?: string;
        resourceType?: string;
        accessLevel?: string;
        format?: string;
        domain?: string;
    }>;
    sync(id: string, sourceUrl: string, contentType?: string): Promise<{
        id: string;
        graphUri: string;
        sourceUrl: string;
        contentType: string;
        bytes: number;
        syncedAt: string;
    }>;
}
