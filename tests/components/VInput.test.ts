import VInput from "~/components/VInput.vue";

import { fireEvent } from "@testing-library/vue";
import { render } from "@/vueHelpers";

describe.concurrent("VInput.vue", () => {
	test("Render slots and type string", () => {
		const component = render(VInput, {
			props: {
				value: "",
				inputId: "sample",
				type: "text",
			},
			// Can't test inputs for now because of isCE bug ?
			// slots: {
			// 	label: "label",
			// 	description: "description",
			// },
		});
		const input = component.getByRole("textbox");

		fireEvent.update(input, "value");
		expect(component.emitted()).toHaveProperty("input");
		// Can't test inputs for now because of isCE bug ?
		// expect(component.getByText("label")).not.toBeUndefined();
	});

	test("Render and type number", () => {
		const component = render(VInput, {
			props: {
				value: 0,
				inputId: "sample",
				type: "number",
			},
		});
		const input = component.getByRole("spinbutton");

		fireEvent.update(input, "54");
		expect(component.emitted()).toHaveProperty("input");
	});
});
