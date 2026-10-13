import { RegisterOntologyDto } from './ontologies.dto';
import { OntologiesService } from './ontologies.service';
export declare class OntologiesController {
    private readonly service;
    constructor(service: OntologiesService);
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
