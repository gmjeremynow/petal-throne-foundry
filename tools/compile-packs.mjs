// Compiles src/packs/<name>/*.json into LevelDB packs at packs/<name>.
import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const SRC = "src/packs";
for ( const name of readdirSync(SRC) ) {
  const dest = join("packs", name);
  rmSync(dest, { recursive: true, force: true });
  await compilePack(join(SRC, name), dest, { log: true, recursive: false });
  console.log(`Compiled ${name}`);
}
