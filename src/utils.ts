//
//  utils.ts
//  pester
//
//  Created by karim-w on 25/08/2025.
//

import { LocalStorage } from "./local_cache"
import { MemoryCache } from "./memory_cache"
import { SessionStorage } from "./session_cache"

export const invalidate_caches = (...keys: string[]) => {
	if (keys.length > 0) {
		LocalStorage.invalidate(...keys)
		SessionStorage.invalidate(...keys)
		MemoryCache.invalidate(...keys)
	}
}
