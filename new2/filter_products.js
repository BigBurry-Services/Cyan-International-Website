const fs = require("fs");
const path = require("path");

const dataPath = "data.json";
const productsDir = "products";

try {
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const files = fs.readdirSync(productsDir);
  // Create a Set of lowercased filenames for case-insensitive comparison
  // Windows is case-insensitive, but it's good to be robust.
  const fileSet = new Set(files.map((f) => f.toLowerCase()));

  const initialCount = data.products.length;
  const originalProducts = data.products;

  const validProducts = originalProducts.filter((p) => {
    if (!p.image) return false;
    // p.image is likely "products/Filename.jpg"
    const filename = path.basename(p.image).toLowerCase();

    // Check if the file exists in the directory list
    const exists = fileSet.has(filename);

    if (!exists) {
      // console.log(`Missing image for: ${p.name} (${p.image})`);
    }
    return exists;
  });

  data.products = validProducts;

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

  console.log(`Successfully filtered products.`);
  console.log(`Initial count: ${initialCount}`);
  console.log(`Final count: ${validProducts.length}`);
  console.log(`Removed ${initialCount - validProducts.length} products.`);

  // List removed items for log visibility
  const removedDocs = originalProducts.filter(
    (p) => !validProducts.includes(p)
  );
  if (removedDocs.length > 0) {
    console.log("Removed products:", removedDocs.map((p) => p.name).join(", "));
  }
} catch (err) {
  console.error("Error processing data:", err);
}
