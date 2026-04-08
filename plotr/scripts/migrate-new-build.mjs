import mysql from "mysql2/promise";
import "dotenv/config";

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log("Applying new_build migration to guest_leads...");
await connection.execute(
  "ALTER TABLE `guest_leads` ADD COLUMN IF NOT EXISTS `estimateType` varchar(32) DEFAULT 'renovation' NOT NULL"
);
await connection.execute(
  "ALTER TABLE `guest_leads` ADD COLUMN IF NOT EXISTS `rooms` json"
);
console.log("✅ Migration complete.");
await connection.end();
