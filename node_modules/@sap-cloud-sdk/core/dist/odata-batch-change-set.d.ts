import { Entity } from './entity';
import { CreateRequestBuilder, DeleteRequestBuilder, UpdateRequestBuilder } from './request-builder';
/**
 * OData batch change set, which holds a collection of write operations.
 */
export declare class ODataBatchChangeSet<T extends CreateRequestBuilder<Entity> | UpdateRequestBuilder<Entity> | DeleteRequestBuilder<Entity>> {
    readonly requests: T[];
    readonly changeSetId: string;
    constructor(requests: T[], changeSetId?: string);
}
/**
 * Build the change set payload as the partial payload of the batch request.
 * @param changeSet - Change set holds a collection of write operations.
 * @returns The generated payload from the given change set.
 */
export declare function toBatchChangeSet<T extends CreateRequestBuilder<Entity> | UpdateRequestBuilder<Entity> | DeleteRequestBuilder<Entity>>(changeSet: ODataBatchChangeSet<T>): string | undefined;
//# sourceMappingURL=odata-batch-change-set.d.ts.map