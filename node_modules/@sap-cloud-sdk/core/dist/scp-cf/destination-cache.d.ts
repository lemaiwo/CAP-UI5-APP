import { MapType } from '@sap-cloud-sdk/util';
import { Cache, IsolationStrategy } from './cache';
import { DestinationsByType } from './destination-accessor-types';
import { Destination } from './destination-service-types';
/**
 * Calculates a cache key based on the jwt and destination name for the given isolation strategy.
 * Cache keys for strategies are non-overlapping, i.e. using a cache key for strategy [[IsolationStrategy.Tenant]]
 * will not result in a cache hit for a destination that has been cached with strategy [[IsolationStrategy.Tenant_User]].
 *
 * @param decodedJwt - The decoded JWT of the current request.
 * @param destinationName - The name of the destination.
 * @param isolationStrategy - The strategy used to isolate cache entries.
 * @returns The cache key.
 * @hidden
 */
export declare function getDestinationCacheKey(decodedJwt: MapType<any>, destinationName: string, isolationStrategy: IsolationStrategy): string;
export declare const destinationCache: {
    retrieveDestinationFromCache: (decodedJwt: MapType<any>, name: string, isolation: IsolationStrategy) => Destination | undefined;
    cacheRetrievedDestinations: (decodedJwt: MapType<any>, retrievedDestinations: DestinationsByType, isolation: IsolationStrategy) => void;
    clear: () => void;
    getCacheInstance: () => Cache<Destination>;
};
//# sourceMappingURL=destination-cache.d.ts.map