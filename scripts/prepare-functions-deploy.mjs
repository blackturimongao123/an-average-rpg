import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const functionsDir = path.join(root, "functions");
const sharedDir = path.join(root, "packages/shared");
const vendorDir = path.join(functionsDir, "npm-packages/@bloodline/shared");

function rewriteGameDataPaths(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      rewriteGameDataPaths(entryPath);
      continue;
    }
    if (!entry.name.endsWith(".js")) {
      continue;
    }
    const content = fs.readFileSync(entryPath, "utf8");
    const next = content.replaceAll("../../../game-data/", "../../game-data/");
    if (next !== content) {
      fs.writeFileSync(entryPath, next);
    }
  }
}

fs.mkdirSync(vendorDir, { recursive: true });
fs.cpSync(path.join(sharedDir, "dist"), path.join(vendorDir, "dist"), { recursive: true });
fs.copyFileSync(path.join(sharedDir, "package.json"), path.join(vendorDir, "package.json"));

const bundledGameData = path.join(functionsDir, "game-data");
fs.rmSync(bundledGameData, { recursive: true, force: true });
fs.cpSync(path.join(root, "game-data"), bundledGameData, { recursive: true });

const fnPkgPath = path.join(functionsDir, "package.json");
const fnPkg = JSON.parse(fs.readFileSync(fnPkgPath, "utf8"));
fnPkg.dependencies["@bloodline/shared"] = "file:./npm-packages/@bloodline/shared";
fs.writeFileSync(fnPkgPath, `${JSON.stringify(fnPkg, null, 2)}\n`);

rewriteGameDataPaths(path.join(functionsDir, "lib"));

console.log("Prepared functions deploy bundle (shared vendor + game-data).");
