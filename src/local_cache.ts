//
//  local_cache.ts
//  pester
//
//  Created by karim-w on 23/08/2025.
//


import { Cachers } from "./cachers";

export class LocalStorageCache implements Cachers {
	private _observers: Map<string, Set<Function>> = new Map();

	set(key: string, value: any, validFor: number): void {
		const expiry = Date.now() + validFor;
		const data = JSON.stringify({ value, expiry });
		window.localStorage.setItem(key, data);
		const observers = this._observers.get(key);
		if (observers) {
			observers.forEach(callback => callback(value));
		}
	}

	get<T>(key: string): T | undefined {
		const data = window.localStorage.getItem(key);
		if (data) {
			const { value, expiry } = JSON.parse(data);
			if (expiry > Date.now()) {
				return value as T;
			}
			window.localStorage.removeItem(key); // Remove expired item
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

export const LocalStorage = new LocalStorageCache();
