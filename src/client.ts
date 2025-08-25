//
//  client.ts
//  pester
//
//  Created by karim-w on 25/08/2025.
//

import { Cachers } from "./cachers";
import { UseCacheOptions } from "./contracts";
import { LocalStorage } from "./local_cache";
import { MemoryCache } from "./memory_cache";
import { SessionStorage } from "./session_cache";
import { TryCatch } from "./try_catch";
import { invalidate_caches } from "./utils";


export const Client = <T>({
	id,
	dataStore = 'local',
	fetcher,
	validFor = 5 * 60 * 1000
}: UseCacheOptions<T>) => {

	let cacher: Cachers;

	switch (dataStore) {
		case 'local':
			cacher = LocalStorage;
			break;
		case 'session':
			cacher = SessionStorage;
			break;
		case 'memory':
		default:
			cacher = MemoryCache;
			break;
	}

	const get = async (): Promise<T> => {

		const { result, error } = await TryCatch(fetcher);

		if (error || !result) {
			throw error || new Error('Unknown error');
		}

		cacher.set(id, result, validFor);

		return result;
	}

	const set = async (action: () => Promise<T>, {
		invalidate = []
	}: {
		invalidate?: string[]
	}) => {
		const { result, error } = await TryCatch(action);

		if (error || !result) {
			throw error || new Error('Unknown error');
		}

		invalidate.push(id)
		invalidate_caches(...invalidate);

		cacher.set(id, result, validFor);


		return result;
	};

	return { get, set }

}

