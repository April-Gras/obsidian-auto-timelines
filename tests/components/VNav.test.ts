import VNav from "~/components/VNav.vue";

import { fireEvent } from "@testing-library/vue";
import { render } from "@/vueHelpers";

describe.concurrent("VNav.vue", () => {
	test("Render", () => {
		const component = render(VNav, {
			props: {
				value: "index",
			},
		});

		expect(component.getAllByRole("listitem").length).toBe(2);
	});

	test("Click", async () => {
		const component = render(VNav, {
			props: {
				value: "date-formats",
			},
		});

		const navItems = component.getAllByRole("listitem");

		await fireEvent.click(navItems[0]);
		const emits = component.emitted();
		expect(emits).toHaveProperty("update:value");
		expect(emits["update:value"]).toStrictEqual([["index"]]);
	});
});
