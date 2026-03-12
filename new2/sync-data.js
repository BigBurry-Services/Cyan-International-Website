// This script syncs products-data.js to data.json
// Run this in Node.js: node sync-data.js

const fs = require("fs");

// Read the products-data.js file
const productsDataContent = fs.readFileSync("products-data.js", "utf8");

// Extract the siteData object using regex
const match = productsDataContent.match(
  /window\.siteData\s*=\s*(\{[\s\S]*\});/,
);

if (match && match[1]) {
  // Evaluate the JavaScript object
  const siteData = eval("(" + match[1] + ")");

  // Write to data.json
  fs.writeFileSync("data.json", JSON.stringify(siteData, null, 2));
  console.log("✅ Successfully synced products-data.js to data.json");
} else {
  console.error("❌ Could not extract siteData from products-data.js");
}
