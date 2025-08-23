//
//  useMemoryCache.test.ts
//  pester
//
//  Created by karim-w on 22/08/2025.
//

/// <reference types="vitest" />

import { renderHook, act, waitFor } from '@testing-library/react';
import { useCache } from '../use_cache';
import { beforeEach, describe, it, expect, vi, Mock } from "vitest";


vi.mock('../memory_cache', () => ({
	MemoryCache: { get: vi.fn() },
}));
vi.mock('../try_catch', () => ({
	TryCatch: vi.fn(),
}));

import { MemoryCache } from '../memory_cache';
import { TryCatch } from '../try_catch';

type Res = string;

describe('useCache', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('returns cached data immediately if available', async () => {
		(MemoryCache.get as Mock).mockReturnValue('cached');
		(TryCatch as Mock).mockResolvedValue({ result: 'fetched' });

		const { result } = renderHook(() =>
			useCache<Res>({ id: '1', fetcher: async () => 'fetched' })
		);

		// immediate cached value
		expect(result.current.data).toBe('cached');

		await waitFor(() => expect(result.current.isReady).toBe(true));
		expect(TryCatch).not.toHaveBeenCalled();
	});

	it('fetches if cache is empty and sets data', async () => {
		(MemoryCache.get as Mock).mockReturnValue(undefined);
		(TryCatch as Mock).mockResolvedValue({ result: 'fetched' });

		const { result } = renderHook(() =>
			useCache<Res>({ id: '2', fetcher: async () => 'fetched' })
		);

		await waitFor(() => expect(result.current.data).toBe('fetched'));
		expect(result.current.error).toBeNull();
	});

	it('sets error when fetcher throws', async () => {
		(MemoryCache.get as Mock).mockReturnValue(undefined);
		const boom = new Error('boom');
		(TryCatch as Mock).mockResolvedValue({ error: boom });

		const { result } = renderHook(() =>
			useCache<Res>({ id: '3', fetcher: async () => { throw boom; } })
		);

		await waitFor(() => expect(result.current.error).toBe(boom));
		expect(result.current.data).toBeUndefined();
	});

	it('sets error when fetch returns undefined', async () => {
		(MemoryCache.get as Mock).mockReturnValue(undefined);
		(TryCatch as Mock).mockResolvedValue({ result: undefined, error: undefined });

		const { result } = renderHook(() =>
			useCache<Res>({ id: '4', fetcher: async () => undefined as unknown as Res })
		);

		await waitFor(() => {
			expect(result.current.error).toBeInstanceOf(Error);
			expect(result.current.error?.message).toBe('No result returned');
		});
	});

	it('re-fetches on id change', async () => {
		(MemoryCache.get as Mock).mockReturnValueOnce(undefined);
		(TryCatch as Mock).mockResolvedValueOnce({ result: 'first' });

		const fetcher = vi.fn().mockResolvedValue('first').mockResolvedValue('second');

		const { result, rerender } = renderHook(
			({ id }) => useCache<Res>({ id, fetcher }),
			{ initialProps: { id: '5' } }
		);

		await waitFor(() => expect(result.current.data).toBe('first'));

		(MemoryCache.get as Mock).mockReturnValueOnce(undefined);
		(TryCatch as Mock).mockResolvedValueOnce({ result: 'second' });

		await act(async () => {
			rerender({ id: '6' });
		});

		await waitFor(() => expect(result.current.data).toBe('second'));
		expect(result.current.error).toBeNull();
	});
});
