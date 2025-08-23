//
//  try_catch.ts
//  pester
//
//  Created by karim-w on 22/08/2025.
//



/**
 * Executes an async function and safely captures its result or error.
 *
 * @template T - The type of the result returned by the function.
 * @param {() => Promise<T>} fn - The async function to execute.
 * @returns {Promise<{ result?: T; error?: Error }>} An object containing either
 *          the function result or the captured error.
 */
export async function TryCatch<T>(fn: () => Promise<T>): Promise<{ result?: T; error?: Error }> {
	try {
		const result = await fn();
		return { result };
	} catch (error) {
		if (error instanceof Error) {
			return { error };
		} else {
			return { error: new Error('An unknown error occurred') };
		}
	}
}

/**
 * Executes a synchronous function and safely captures its result or error.
 *
 * @template T - The type of the result returned by the function.
 * @param {() => T} fn - The synchronous function to execute.
 * @returns {{ result?: T; error?: Error }} An object containing either
 *          the function result or the captured error.
 */
export function TryCatchSync<T>(fn: () => T): { result?: T; error?: Error } {
	try {
		const result = fn();
		return { result };
	} catch (error) {
		if (error instanceof Error) {
			return { error };
		} else {
			return { error: new Error('An unknown error occurred') };
		}
	}
}

