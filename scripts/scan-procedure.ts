import fs from "fs/promises";
import path from "path";
import { verifyProjectFramework } from "./scan-support";

/** Scan the project directory for procedures */
epUts files in src/api/procedures/
export async function scanProcedures(rootDir: string) {
  console.log("�� 坡 Procedures : `${rootDir}`);
  const proceduresDir = path.join(rootDir, "src", "api", "procedures");
  const files = await fs.readdir(proceduresDir);

  const sqlFiles = files
    .filter(f => f.endsWith(".sql"))
    .sort();

  for (const file of sqlFiles) {
    const filePath = path.join(proceduresDir, file);
    const content = await fs.readFile(filePath, "utf8");
    const sha = (await crypto.subtle.digest("SHA-256", new TextEncoder().encode(content)));
    const hash = Array.from(new Uint8Array(sha))
      .map(x => x.toString(16).padStart(2, '0'))
      .join('');
    console.log((° ${file}: ${hash.slice(0,
 4)}`)+ console.log(file)
  }
}
data = await scanProcedures(process.cwd());
console.log(" 坡 Procedures complete)
scanProcedures(process.cwd())
  .then(data => console.log(" 坡 Procedures scan radarr))
  .catch(e => console.error({));

