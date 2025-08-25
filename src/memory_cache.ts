//
//  memory_cache.ts
//  pester
//
//  Created by karim-w on 22/08/2025.
//

import { Cachers } from "./cachers";

export class InMemoryCache implements Cachers {

	private cache: Map<string, { value: any; expiry: number }>;
	private _observers: Map<string, Set<Function>> = new Map();

	constructor() {
		this.cache = new Map();
	}

	notify(key: string, action: 'set' | 'update' | 'invalidate', value?: any): void {
		const observers = this._observers.get(key);
		if (!observers) {
			return;
		}

		observers.forEach(callback => {
			if (typeof callback !== 'function') {
				this._observers.get(key)?.delete(callback);
				return;
			}
			callback({
				action: action,
				key: key,
				value: value,

			})
		});
	}




	update(key: string, value: any): void {
		const entry = this.cache.get(key);
		if (!entry) {
			return
		}

		entry.value = value;
		this.cache.set(key, entry);

		this.notify(key, 'update', value);
	}

	set(key: string, value: any, validFor: number = 5 * 60 * 1000): void {

		const expiry = Date.now() + validFor;

		this.cache.set(key, { value, expiry });

		this.notify(key, 'set', value);
	}

	get<T>(key: string): T | undefined {
		const entry = this.cache.get(key);
		if (!entry) {
			return undefined;
		}

		if (entry.expiry > Date.now()) {
			return entry.value as T;
		}

		this.cache.delete(key); // Remove expired item
		this.notify(key, 'invalidate');

		return
	}

	observe(key: string, callback: Function): void {
		if (!this._observers.has(key)) {
			this._observers.set(key, new Set());
		}
		this._observers.get(key)?.add(callback);
	}

	invalidate(...keys: string[]): void {
		keys.forEach(key => {
			this.cache.delete(key);
			this.notify(key, 'invalidate');
		});
	}

}


export const MemoryCache = new InMemoryCache();
