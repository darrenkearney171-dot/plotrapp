import mysql from "mysql2/promise";
import "dotenv/config";

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Map of old real names → new generic names for suppliers
const supplierRenames = [
  ["Jewson Belfast", "Island Builders Merchant"],
  ["Haldane Fisher", "Capital Building Supplies"],
  ["Buildbase Belfast", "Premier Build Centre"],
  ["Macnaughton Blair", "Greenfield Timber & Sheet"],
  ["James Leckey Timber", "Atlantic Timber Supplies"],
  ["Johnstone's Decorating Centre Belfast", "Prestige Decorating Centre"],
  ["Dulux Decorator Centre Belfast", "Colour & Craft Supplies"],
  ["Tile Style Belfast", "Cornerstone Tile & Stone"],
  ["Karndean Flooring NI", "Luxe Flooring Ireland"],
  ["Bathstore Belfast", "Aqua Bathroom Studio"],
  ["Moores Kitchens Belfast", "Hearth Kitchen Showroom"],
  ["City Electrical Factors Belfast", "Volt Electrical Wholesale"],
  ["Graham Plumbers Merchant Belfast", "Flow Plumbing & Heating"],
  ["Turkington Windows NI", "Clearview Windows & Doors"],
  ["SIG Roofing Belfast", "Summit Roofing Supplies"],
];

// Map of old real names → new generic names for tradespeople
const tradespeopleRenames = [
  ["Mark Thompson Joinery", "Oakwood Joinery"],
  ["Sean Doherty Plumbing", "Clearflow Plumbing"],
  ["Paul McAlister Electrical", "Brightline Electrical"],
  ["Conor Murphy Plastering", "Smooth Finish Plastering"],
  ["Brian Kerr Painting & Decorating", "Prestige Painting & Decorating"],
  ["Ronan Fitzpatrick Roofing", "Ridgeline Roofing"],
  ["Stephen Lavery Tiling", "Precision Tiling"],
  ["Dermot O'Neill Building", "Cornerstone Building"],
  ["Alan Smyth Kitchen Fitting", "Fitted Kitchen Specialists"],
  ["Niall Brennan Bathrooms", "Aqua Bathroom Fitting"],
  ["Paddy Quinn Landscaping", "Greenscape Landscaping"],
  ["Liam Gallagher Carpentry", "Craftwood Carpentry"],
  ["Thomas Reid Plumbing & Heating", "Heatwise Plumbing & Heating"],
  ["Kevin McBride Electrical Services", "Smartwire Electrical"],
  ["Ciaran Walsh Painting", "Colourcraft Decorating"],
];

console.log("Anonymising supplier names in database...");
for (const [oldName, newName] of supplierRenames) {
  const [result] = await connection.execute(
    "UPDATE suppliers SET name = ? WHERE name = ?",
    [newName, oldName]
  );
  const changed = result.affectedRows;
  console.log(`  ${changed > 0 ? "✓" : "–"} ${oldName} → ${newName}${changed === 0 ? " (not found, may already be updated)" : ""}`);
}

// Also clear real website URLs and phone numbers from suppliers
console.log("\nClearing real website URLs and phone numbers from suppliers...");
await connection.execute(
  `UPDATE suppliers SET 
    websiteUrl = NULL,
    phone = NULL,
    address = NULL
   WHERE websiteUrl IS NOT NULL OR phone IS NOT NULL OR address IS NOT NULL`
);
console.log("  ✓ Cleared websiteUrl, phone, address from all suppliers");

console.log("\nAnonymising tradesperson names in database...");
for (const [oldName, newName] of tradespeopleRenames) {
  const [result] = await connection.execute(
    "UPDATE tradespeople SET name = ? WHERE name = ?",
    [newName, oldName]
  );
  const changed = result.affectedRows;
  console.log(`  ${changed > 0 ? "✓" : "–"} ${oldName} → ${newName}${changed === 0 ? " (not found, may already be updated)" : ""}`);
}

// Also clear real phone numbers from tradespeople
console.log("\nClearing real phone numbers from tradespeople...");
await connection.execute("UPDATE tradespeople SET phone = NULL WHERE phone IS NOT NULL");
console.log("  ✓ Cleared phone numbers from all tradespeople");

// Also update the description text to remove "Northern Ireland" references
console.log("\nUpdating descriptions to remove Northern Ireland references...");
await connection.execute(
  "UPDATE suppliers SET description = REPLACE(description, 'Northern Ireland', 'the island of Ireland')"
);
await connection.execute(
  "UPDATE tradespeople SET bio = REPLACE(bio, 'Northern Ireland', 'Ireland')"
);
await connection.execute(
  "UPDATE tradespeople SET bio = REPLACE(bio, 'across NI', 'across Ireland')"
);
console.log("  ✓ Updated descriptions");

console.log("\n✅ Anonymisation complete.");
await connection.end();
