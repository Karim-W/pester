//
//  contracts.ts
//  pester
//
//  Created by karim-w on 22/08/2025.
//

export type DataStore = 'local' | 'session' | 'memory';

export type UseCacheOptions<T> = {
	id: string;
	dataStore?: DataStore; // default is 'memory'
	fetcher: () => Promise<T>;
	skipInitialFetch?: boolean; // default is false
	validFor?: number;
}

export type UseCacheResult<T> = {
	data: T | undefined;
	isLoading: boolean;
	isReady: boolean;
	// isStale: boolean;
	error: Error | null;
	// refresh: () => void;
}

