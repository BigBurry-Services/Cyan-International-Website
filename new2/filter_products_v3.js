const fs = require("fs");
const path = require("path");

const dataPath = "data.json";
const productsDir = "products";
const logPath = "filter_log.txt";

function log(msg) {
  fs.appendFileSync(logPath, msg + "\n");
}

try {
  if (fs.existsSync(logPath)) fs.unlinkSync(logPath);

  log("Starting filter process...");

  if (!fs.existsSync(dataPath)) {
    log("Error: data.json not found");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const files = fs.readdirSync(productsDir);
  const fileSet = new Set(files.map((f) => f.toLowerCase()));

  const initialCount = data.products.length;
  const originalProducts = data.products;

  const validProducts = originalProducts.filter((p) => {
    if (!p.image) return false;
    const filename = path.basename(p.image).toLowerCase();
    const exists = fileSet.has(filename);
    if (!exists) {
      log(`Removing missing image for: ${p.name}`);
    }
    return exists;
  });

  data.products = validProducts;

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

  log(`Initial count: ${initialCount}`);
  log(`Final count: ${validProducts.length}`);
  log(`Removed ${initialCount - validProducts.length} products.`);
  log("Success.");
} catch (err) {
  log(`Error: ${err.message}\n${err.stack}`);
}
