import { GraphdbService } from '../graphdb/graphdb.service';
export declare class SearchService {
    private readonly graphdb;
    constructor(graphdb: GraphdbService);
    curated(q: string, relation?: string, access?: string): Promise<{
        vocabulary: any;
        access: any;
        namespace: any;
        term: any;
        label: any;
        relation: any;
    }[]>;
    discover(q: string): Promise<{
        graph: any;
        term: any;
        label: any;
        type: any;
    }[]>;
}
