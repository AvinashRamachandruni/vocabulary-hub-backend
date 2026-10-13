export declare class CreateMappingDto {
    concept: string;
    targetUri: string;
    relation?: 'exactMatch' | 'relatedMatch';
    conceptUri?: string;
}
