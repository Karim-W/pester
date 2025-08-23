//
//  vitest.config.ts
//  pester
//
//  Created by karim-w on 22/08/2025.
//

import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",   // 👈 gives you document/window
		globals: true,          // so you can use describe/it/expect/vi without imports
		setupFiles: "./vitest.setup.ts", // optional
	},
});
