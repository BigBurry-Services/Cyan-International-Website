const fs = require("fs");
console.log("Hello from node");
try {
  fs.writeFileSync("node_ran.txt", "yes from node");
  console.log("Wrote file");
} catch (e) {
  console.error(e);
}
