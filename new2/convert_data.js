const fs = require("fs");
const vm = require("vm");

const code = fs.readFileSync("products-data.js", "utf8");
const sandbox = { window: {}, console: console };
vm.createContext(sandbox);

try {
  vm.runInContext(code, sandbox);
  const data = sandbox.window.siteData || sandbox.siteData;
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
  console.log("Successfully wrote data.json");
} catch (e) {
  console.error("Error parsing:", e);
}
