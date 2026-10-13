import { SearchDto } from './search.dto';
import { SearchService } from './search.service';
export declare class SearchController {
    private readonly service;
    constructor(service: SearchService);
    curated(dto: SearchDto): Promise<{
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
