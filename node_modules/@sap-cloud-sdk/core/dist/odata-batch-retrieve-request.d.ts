import { Entity } from './entity';
import { GetAllRequestBuilder, GetByKeyRequestBuilder } from './request-builder';
/**
 * Build a string as the request body of the retrieve request.
 * Below is an example of the generated body, where the two empty line are mandatory to make the request valid.
 * *** example starts ***
 * Content-Type: application/http
 * Content-Transfer-Encoding: binary
 *
 * GET /SomeUrl/API_BUSINESS_PARTNER/A_BusinessPartnerBank?$format=json&$top=1 HTTP/1.1
 *
 *
 * *** example ends ***
 * @param requestBuilder - The request builder of the retrieve request.
 * @returns The request body.
 */
export declare function toBatchRetrieveBody(requestBuilder: GetAllRequestBuilder<Entity> | GetByKeyRequestBuilder<Entity>): string;
//# sourceMappingURL=odata-batch-retrieve-request.d.ts.map