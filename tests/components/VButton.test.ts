import VButtonVue from "~/components/VButton.vue";

import { fireEvent } from "@testing-library/vue";
import { render } from "@/vueHelpers";

describe.concurrent("VButton.vue", () => {
	test("Render and event", async () => {
		const component = render(VButtonVue);
		const button = component.getByRole("button");

		expect(button).toBeDefined();
		expect(button.attributes).not.toHaveProperty("disabled");
		expect(button.classList.contains("mod-cta")).toBe(false);
		await fireEvent.click(button);
		expect(component.emitted()).toHaveProperty("click");
	});

	test("Check disabled attr", () => {
		const component = render(VButtonVue, {
			props: {
				disabled: true,
				hasAccent: true,
			},
		});
		const button = component.getByRole("button");

		expect(button.attributes).toHaveProperty("disabled");
		expect(button.classList.contains("mod-cta")).toBe(true);
	});
});
