import { GraphdbService } from '../graphdb/graphdb.service';
export declare class HealthController {
    private readonly graphdb;
    constructor(graphdb: GraphdbService);
    health(): Promise<{
        status: string;
        graphdb: boolean;
        repository: string;
        timestamp: string;
    }>;
}
