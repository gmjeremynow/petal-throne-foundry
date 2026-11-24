import { SYSTEM_ID } from "./config.mjs";

/**
 * Version of the bundled compendium data. Bump it whenever data/packs/*.json changes,
 * so worlds rebuild their compendiums (an old packs/ database can survive a system update).
 */
export const DATA_VERSION = "dd630b7540";

/**
 * Compendium writes from the system and from add-on modules run one at a time. Unlocking a pack rewrites the
 * shared core.compendiumConfiguration setting, so parallel fills can re-lock each other's packs
 * ("You may not create documents in the locked compendium"). Modules use the same global key.
 */
const LOCK_KEY = "__petalThronePackLock";
export function withPackLock(fn) {
  const prev = globalThis[LOCK_KEY] ?? Promise.resolve();
  const run = prev.then(() => fn(), () => fn());
  globalThis[LOCK_KEY] = run.then(() => {}, () => {});
  return run;
}

/** Unlock a pack, retrying in case another write put the old setting back. */
export async function unlockPack(pack) {
  for ( let i = 0; i < 5 && pack.locked; i++ ) await pack.configure({ locked: false });
  if ( pack.locked ) throw new Error(`${SYSTEM_ID} | Could not unlock ${pack.collection}`);
}

/**
 * On load (GM): fill empty packs, and if the packs were built from older data, offer to rebuild them.
 */
export async function checkPackData() {
  if ( !game.user.isGM ) return;
  const built = game.settings.get(SYSTEM_ID, "packDataVersion");
  if ( built === DATA_VERSION ) {
    if ( game.settings.get(SYSTEM_ID, "autoPopulatePacks") ) await populateEmptyPacks();
    return;
  }
  const packs = game.packs.filter(p => p.metadata.packageType === "system" && p.metadata.packageName === SYSTEM_ID);
  let anyFilled = false;
  for ( const p of packs ) if ( (await p.getIndex()).size ) { anyFilled = true; break; }
  if ( !anyFilled ) {
    await populateEmptyPacks();
    await game.settings.set(SYSTEM_ID, "packDataVersion", DATA_VERSION);
    return;
  }
  const ok = await foundry.applications.api.DialogV2.confirm({
    window: { title: game.i18n.localize("PT.Rebuild.Title") },
    content: `<p>${game.i18n.localize("PT.Rebuild.Body")}</p>`
  });
  if ( !ok ) return;
  await populateEmptyPacks({ force: true });
  await game.settings.set(SYSTEM_ID, "packDataVersion", DATA_VERSION);
}

/**
 * Release builds ship compiled compendium packs. When the system is installed from
 * source (no compiled packs), the declared packs start empty; this fills each empty
 * system pack from the bundled JSON in data/packs/<name>.json. GM only.
 */
export async function populateEmptyPacks({ force = false } = {}) {
  const packs = game.packs.filter(p => p.metadata.packageType === "system" && p.metadata.packageName === SYSTEM_ID);
  let filled = 0;
  for ( const pack of packs ) {
    const index = await pack.getIndex();
    if ( index.size && !force ) continue;
    let docs;
    try {
      const res = await fetch(`systems/${SYSTEM_ID}/data/packs/${pack.metadata.name}.json`);
      if ( !res.ok ) continue;
      docs = await res.json();
    } catch ( err ) { continue; }
    if ( !Array.isArray(docs) || !docs.length ) continue;
    const wasLocked = pack.locked;
    if ( wasLocked ) await unlockPack(pack);
    if ( force && index.size ) {
      const cls = pack.documentClass;
      await cls.deleteDocuments(index.map(i => i._id), { pack: pack.collection });
    }
    if ( force && pack.folders?.size ) {
      await Folder.implementation.deleteDocuments(pack.folders.map(f => f.id), { pack: pack.collection });
    }
    // Folders inside the pack (skills and spells are grouped by type).
    try {
      const fres = await fetch(`systems/${SYSTEM_ID}/data/packs/${pack.metadata.name}.folders.json`);
      if ( fres.ok ) {
        const fdocs = (await fres.json()).map(f => { const c = { ...f }; delete c._key; return c; });
        if ( fdocs.length ) await unlockPack(pack);
        if ( fdocs.length ) await Folder.implementation.createDocuments(fdocs, { pack: pack.collection, keepId: true });
      }
    } catch ( err ) { console.warn(`${SYSTEM_ID} | No folders for ${pack.metadata.name}`, err); }
    const cls = pack.documentClass;
    const stripKeys = o => {
      if ( Array.isArray(o) ) return o.forEach(stripKeys);
      if ( o && typeof o === "object" ) { delete o._key; Object.values(o).forEach(stripKeys); }
    };
    const clean = docs.map(d => { const c = foundry.utils.deepClone(d); stripKeys(c); return c; });
    await unlockPack(pack);
    await cls.createDocuments(clean, { pack: pack.collection, keepId: true });
    if ( wasLocked ) await pack.configure({ locked: true });
    filled++;
  }
  if ( filled ) ui.notifications.info(game.i18n.format("PT.Info.PacksFilled", { n: filled }));
  if ( filled ) {
    const { applyMonsterArt } = await import("./monsterart.mjs");
    await applyMonsterArt({ quiet: true });
    const { syncCreatures } = await import("./migrate.mjs");
    await syncCreatures();
  }
  return filled;
}
