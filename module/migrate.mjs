import { SYSTEM_ID } from "./config.mjs";

/**
 * World copies of compendium creatures do not change when the compendium does.
 * This copies each creature's token footprint and size table from the system compendium
 * onto world creatures of the same name, and resizes their placed tokens.
 * Only the footprint and size table are touched: names, art, hit points and notes are kept.
 */
export async function syncCreatures({ quiet = false } = {}) {
  if ( !game.user.isGM ) return { actors: 0, tokens: 0 };
  const pack = game.packs.get(`${SYSTEM_ID}.creatures`);
  if ( !pack ) return { actors: 0, tokens: 0 };
  const source = new Map((await pack.getDocuments()).map(a => [a.name, a]));

  // World actors
  const actorUpdates = [];
  for ( const a of game.actors.filter(a => a.type === "creature") ) {
    const src = source.get(a.name);
    if ( !src ) continue;
    const w = src.prototypeToken.width, h = src.prototypeToken.height;
    const upd = { _id: a.id };
    if ( a.prototypeToken.width !== w || a.prototypeToken.height !== h ) {
      upd["prototypeToken.width"] = w;
      upd["prototypeToken.height"] = h;
    }
    if ( a.system.sizes !== src.system.sizes ) upd["system.sizes"] = src.system.sizes;
    if ( Object.keys(upd).length > 1 ) actorUpdates.push(upd);
  }
  if ( actorUpdates.length ) await Actor.updateDocuments(actorUpdates);

  // Placed tokens: a token named "Name (size)" takes that size's footprint; others take the base footprint.
  let tokenCount = 0;
  for ( const scene of game.scenes ) {
    const upd = [];
    for ( const t of scene.tokens ) {
      const actor = t.actor;
      if ( actor?.type !== "creature" ) continue;
      const src = source.get(actor.name) ?? source.get(t.baseActor?.name);
      if ( !src ) continue;
      let w = src.prototypeToken.width, h = src.prototypeToken.height;
      const label = t.name.match(/\(([^)]+)\)\s*$/)?.[1];
      if ( label && src.system.sizes ) {
        const row = src.system.sizes.split("|").map(x => x.split(":")).find(r => r[0] === label);
        if ( row?.[3] ) w = h = Number(row[3]);
      }
      if ( t.width !== w || t.height !== h ) upd.push({ _id: t.id, width: w, height: h });
    }
    if ( upd.length ) { await scene.updateEmbeddedDocuments("Token", upd); tokenCount += upd.length; }
  }
  if ( !quiet || actorUpdates.length || tokenCount ) {
    ui.notifications.info(game.i18n.format("PT.Sync.Done", { actors: actorUpdates.length, tokens: tokenCount }));
  }
  return { actors: actorUpdates.length, tokens: tokenCount };
}

/**
 * Weapons copied into the world before weapon lengths existed have length 0 ("none").
 * Fill those in from the compendium weapon of the same name (sidebar items and items on actors).
 */
export async function syncWeaponLengths() {
  if ( !game.user.isGM ) return 0;
  const lengths = new Map();
  for ( const key of ["equipment", "sg-gear"] ) {
    const pack = game.packs.get(`${SYSTEM_ID}.${key}`);
    if ( !pack ) continue;
    for ( const it of await pack.getDocuments() ) {
      if ( it.type === "weapon" && it.system.lengthGroup ) lengths.set(it.name, it.system.lengthGroup);
    }
  }
  if ( !lengths.size ) return 0;
  const needs = i => i.type === "weapon" && !i.system.lengthGroup && lengths.has(i.name);
  let count = 0;
  const world = game.items.filter(needs).map(i => ({ _id: i.id, "system.lengthGroup": lengths.get(i.name) }));
  if ( world.length ) { await Item.updateDocuments(world); count += world.length; }
  for ( const a of game.actors ) {
    const upd = a.items.filter(needs).map(i => ({ _id: i.id, "system.lengthGroup": lengths.get(i.name) }));
    if ( upd.length ) { await a.updateEmbeddedDocuments("Item", upd); count += upd.length; }
  }
  for ( const scene of game.scenes ) {
    for ( const t of scene.tokens ) {
      if ( t.actorLink || !t.actor ) continue;
      const upd = t.actor.items.filter(needs).map(i => ({ _id: i.id, "system.lengthGroup": lengths.get(i.name) }));
      if ( upd.length ) { await t.actor.updateEmbeddedDocuments("Item", upd); count += upd.length; }
    }
  }
  if ( count ) ui.notifications.info(game.i18n.format("PT.Sync.Lengths", { n: count }));
  return count;
}

/** Run the sync once after each system update (GM only). */
export async function migrateIfNeeded() {
  if ( !game.user.isGM ) return;
  const current = game.system.version;
  const last = game.settings.get(SYSTEM_ID, "lastSyncedVersion");
  if ( last === current ) return;
  try { await syncCreatures({ quiet: true }); await syncWeaponLengths(); await syncCharacterTokenNames(); }
  catch ( err ) { console.error(`${SYSTEM_ID} | Creature sync failed`, err); return; }
  await game.settings.set(SYSTEM_ID, "lastSyncedVersion", current);
}

/**
 * One-time fix (0.7.6): player characters renamed before token names followed the actor kept their old
 * prototype token name. Player-owned characters get their prototype token (and linked placed tokens) renamed.
 */
export async function syncCharacterTokenNames() {
  if ( !game.user.isGM ) return 0;
  const fixes = game.actors.filter(a => (a.type === "character") && a.hasPlayerOwner && (a.prototypeToken.name !== a.name));
  for ( const a of fixes ) {
    const old = a.prototypeToken.name;
    await a.update({ "prototypeToken.name": a.name });
    for ( const scene of game.scenes ) {
      const updates = scene.tokens.filter(t => t.actorLink && (t.actorId === a.id) && (t.name === old)).map(t => ({ _id: t.id, name: a.name }));
      if ( updates.length ) await scene.updateEmbeddedDocuments("Token", updates);
    }
  }
  return fixes.length;
}
