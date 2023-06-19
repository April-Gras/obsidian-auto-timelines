import { render as nativeRender } from "@testing-library/vue";

import createVueI18nConfig from "~/i18n.config";

import type { RenderOptions } from "@testing-library/vue";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function render(component: any, options: RenderOptions = {}) {
	return nativeRender(component, {
		global: {
			plugins: [createVueI18nConfig()],
			renderStubDefaultSlot: false,
		},
		...options,
	});
}
