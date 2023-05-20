import { writeFileSync, readFileSync } from "node:fs";

writeFileSync("./node_modules/obsidian/index.js", "export default {}");

const packagejson = JSON.parse(
	readFileSync("./node_modules/obsidian/package.json")
);

packagejson.main = "index.js";

writeFileSync(
	"./node_modules/obsidian/package.json",
	JSON.stringify(packagejson, null, "\t")
);
