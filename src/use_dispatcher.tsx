import { useEffect, useState } from "react";
import { TryCatch } from "./try_catch";
import { MemoryCache } from "./memory_cache";
import { LocalStorage } from "./local_cache";
import { SessionStorage } from "./session_cache";
import { CacheDispatcherOptions, CacheDispatcherResult } from "./contracts";
import { invalidate_caches } from "./utils";



export function useCacheDispatcher<T>(
	{ ids, action, invalidate }: CacheDispatcherOptions<T>
): CacheDispatcherResult<T> {

	const [data, setData] = useState<T | undefined>(undefined);
	const [error, setError] = useState<Error | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetch_contract().finally(() => setIsLoading(false))
	}, [])

	const fetch_contract = async () => {
		const {
			result,
			error
		} = await TryCatch(action)

		if (error) {
			setError(error);
			return;
		}

		setData(result);
		// set all caches
		ids.forEach((id) => {
			LocalStorage.update(id, result)
			SessionStorage.update(id, result)
			MemoryCache.update(id, result)
		})

		// invalidate all caches with the given ids
		invalidate_caches(...invalidate)

	};

	return {
		data,
		error,
		isLoading,
	}
}


