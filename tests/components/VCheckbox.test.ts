import VCheckboxVue from "~/components/VCheckbox.vue";

import { fireEvent } from "@testing-library/vue";
import { render } from "@/vueHelpers";

describe.concurrent("VCheckbox.vue", () => {
	test("Render", () => {
		const component = render(VCheckboxVue, {
			props: {
				value: false,
				inputId: "_uid",
			},
		});

		expect(component.getByRole("checkbox")).toBeDefined();
	});

	test("Emit event", async () => {
		const component = render(VCheckboxVue, {
			props: {
				value: false,
				inputId: "_uid",
			},
		});

		await fireEvent.click(component.getByRole("checkbox"));

		expect(component.emitted()).toHaveProperty("input");
	});
});
