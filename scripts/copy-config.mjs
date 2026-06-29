// Copies runtime config files (read from disk by the server) into the build
// output so the bundled production server can find them. esbuild does not bundle
// files that are read via fs.readFileSync at runtime, so they must be copied.
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = resolve(root, "server/config");
const dest = resolve(root, "dist/config");

if (!existsSync(src)) {
  console.error(`[copy-config] source not found: ${src}`);
  process.exit(1);
}

mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log(`[copy-config] copied ${src} -> ${dest}`);
