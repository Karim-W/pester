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

	set(key: string, value: any, validFor: number): void {
		const expiry = Date.now() + validFor;
		this.cache.set(key, { value, expiry });
		const observers = this._observers.get(key);
		if (observers) {
			observers.forEach(callback => callback(value));
		}
	}

	get<T>(key: string): T | undefined {
		const entry = this.cache.get(key);
		if (entry && entry.expiry > Date.now()) {
			return entry.value as T;
		}
		return undefined;
	}

	observe(key: string, callback: Function): void {
		if (!this._observers.has(key)) {
			this._observers.set(key, new Set());
		}
		this._observers.get(key)?.add(callback);
	}
}


export const MemoryCache = new InMemoryCache();
