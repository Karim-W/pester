import { useEffect, useRef, useState } from 'react';
import { UseCacheOptions, UseCacheResult } from './contracts';
import { MemoryCache } from './memory_cache';
import { TryCatch } from './try_catch';
import { Cachers } from './cachers';
import { LocalStorage } from './local_cache';
import { SessionStorage } from './session_cache';


export function useCache<T>(
	options: UseCacheOptions<T>
): UseCacheResult<T> {
	const { id, fetcher, skipInitialFetch } = options;

	const cacherRef = useRef<Cachers>(MemoryCache);

	const [data, setData] = useState<T | undefined>(undefined);
	const [error, setError] = useState<Error | null>(null);
	const [isReady, setIsReady] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		switch (options.dataStore) {
			case 'local':
				cacherRef.current = LocalStorage;
				break;
			case 'session':
				cacherRef.current = SessionStorage;
				break;
			case 'memory':
			default:
				cacherRef.current = MemoryCache;
				break;
		}

		if (skipInitialFetch) {
			return;
		}

		fetch_contract().finally(() => {
			setIsReady(true);
		});

	}, []);

	useEffect(() => {
		if (!isReady) {
			if (skipInitialFetch) {
				setIsReady(true);
			}
			return;
		}

		setIsLoading(true);

		fetch_contract().then(() => {
			setIsLoading(false);
		})

	}, [id]);

	const fetch_contract = async () => {
		// L1
		const inital_result = cacherRef.current.get<T>(id);
		if (inital_result !== undefined) {
			setData(inital_result);
		}

		// L2
		const {
			result,
			error
		} = await TryCatch(fetcher);

		if (error) {
			setError(error);
			return;
		}
		if (result === undefined) {
			setError(new Error('No result returned'))
			return;
		}

		if (JSON.stringify(inital_result) === JSON.stringify(result)) {
			return;
		}

		setData(result);
		cacherRef.current.set(id, result, options.validFor || 1000 * 60 * 5);
	}


	return {
		data,
		isLoading,
		isReady,
		error,
	};
}


