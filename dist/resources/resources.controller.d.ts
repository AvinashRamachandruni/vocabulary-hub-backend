import { ResourcesService } from './resources.service';
export declare class ResourcesController {
    private readonly service;
    constructor(service: ResourcesService);
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
