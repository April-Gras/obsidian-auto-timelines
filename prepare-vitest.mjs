import { writeFileSync, readFileSync } from "node:fs";

writeFileSync("./node_modules/obsidian/index.mjs", "export default {}");

const packagejson = JSON.parse(
  readFileSync("./node_modules/obsidian/package.json"),
);

packagejson.main = "index.mjs";

writeFileSync(
  "./node_modules/obsidian/package.json",
  JSON.stringify(packagejson, null, "\t"),
);
