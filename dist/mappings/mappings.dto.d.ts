export declare class CreateMappingDto {
    concept: string;
    targetUri: string;
    relation?: 'exactMatch' | 'relatedMatch';
    conceptUri?: string;
}
export declare class UploadAlignmentDto {
    id: string;
    sourceOntology: string;
    targetOntology: string;
}
