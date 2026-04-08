import mysql from "mysql2/promise";
import { readFileSync } from "fs";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL not set");

const conn = await mysql.createConnection(url);

const sqls = [
  `CREATE TABLE IF NOT EXISTS \`project_visualisations\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`userId\` int NOT NULL,
    \`leadId\` int,
    \`imageUrl\` text NOT NULL,
    \`roomType\` varchar(128),
    \`promptUsed\` text,
    \`projectType\` varchar(128),
    \`createdAt\` timestamp NOT NULL DEFAULT (now()),
    CONSTRAINT \`project_visualisations_id\` PRIMARY KEY(\`id\`)
  )`,
  `ALTER TABLE \`users\` ADD COLUMN IF NOT EXISTS \`freeVisualisationsUsed\` int DEFAULT 0 NOT NULL`,
];

for (const sql of sqls) {
  try {
    await conn.execute(sql);
    console.log("OK:", sql.slice(0, 60));
  } catch (e) {
    if (e.code === "ER_DUP_FIELDNAME" || e.code === "ER_TABLE_EXISTS_ERROR") {
      console.log("Already exists, skipping:", e.code);
    } else {
      throw e;
    }
  }
}

await conn.end();
console.log("Migration complete.");
