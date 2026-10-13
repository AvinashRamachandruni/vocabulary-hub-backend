import { GraphdbService } from '../graphdb/graphdb.service';
export declare class ResourcesService {
    private readonly graphdb;
    constructor(graphdb: GraphdbService);
    list(): Promise<{
        id: any;
        title: any;
        description: any;
        publisher: any;
        type: any;
        access: any;
        format: any;
        availability: any;
        namespace: any;
        source: any;
        domain: any;
        graph: any;
    }[]>;
}
