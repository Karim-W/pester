//
//  cachers.ts
//  pester
//
//  Created by karim-w on 22/08/2025.
//

export interface Cachers {
	set(key: string, value: any, validFor: number): void;
	update(key: string, value: any): void;
	get<T>(key: string): T | undefined;
	observe(key: string, callback: (value: any) => void): void;
	invalidate(...keys: string[]): void;
}
