/* eslint-disable @typescript-eslint/no-unused-vars */
declare module "*.vue" {
	import { ComponentOptions, DefineComponent } from "vue";
	// const componentOptions: ComponentOptions;
	// export default componentOptions;
	const defineComponent: DefineComponent;
	export default defineComponent;
}
