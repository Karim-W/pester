//
//  session_cache.ts
//  pester
//
//  Created by karim-w on 23/08/2025.
//

import { Cachers } from './cachers';
import { TryCatchSync } from './try_catch';

export class SessionCache implements Cachers {
	private _observers: Map<string, Set<Function>> = new Map();

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


	set(key: string, value: any, validFor: number = 5 * 60 * 1000): void {

		const expiry = Date.now() + validFor;

		window.sessionStorage.setItem(key, JSON.stringify({
			value,
			expiry,
		}));

		this.notify(key, 'set', value);

	}

	get<T>(key: string): T | undefined {
		const entry_raw = window.sessionStorage.getItem(key);
		if (!entry_raw) {
			return
		}

		const {
			result: entry,
			error,
		} = TryCatchSync(() => JSON.parse(entry_raw));
		if (error || !entry) {
			return
		}

		const { value, expiry } = entry;
		if (expiry > Date.now()) {
			return value as T;
		}

		window.sessionStorage.removeItem(key); // Remove expired item
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
			window.sessionStorage.removeItem(key);
			this.notify(key, 'invalidate');
		});
	}

	update(key: string, value: any): void {
		const entry = this.get(key);
		if (!entry) {
			return
		}

		this.set(key, value);
		this.notify(key, 'update', value);
	}
}

export const SessionStorage = new SessionCache();
