import { ConfigService } from '@nestjs/config';
export declare class GraphdbService {
    private readonly config;
    readonly repository: string;
    readonly baseUrl: string;
    readonly queryEndpoint: string;
    readonly statementsEndpoint: string;
    readonly mappingGraph: string;
    readonly resourceGraph: string;
    constructor(config: ConfigService);
    select(query: string): Promise<any[]>;
    update(update: string): Promise<void>;
    upload(content: Buffer | string, contentType: string, graphUri: string): Promise<void>;
    ping(): Promise<boolean>;
}
