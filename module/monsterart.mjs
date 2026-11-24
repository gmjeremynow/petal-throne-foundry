import { SYSTEM_ID } from "./config.mjs";
import { unlockPack } from "./packs.mjs";

/**
 * Creature art: images named "Token <creature name>.<ext>" in the art folder (or one
 * subfolder down) become the portrait and token image of the matching creature.
 * Matching ignores case, accents, apostrophes, punctuation and spaces, and the part of a
 * name in brackets is optional, so "Token Huruu.webp" and "Token Hurú'u.webp" both match "Hurú'u".
 */
export const DEFAULT_ART_FOLDER = "petal-throne_monster_art";
export const DEFAULT_IMG = "icons/svg/mystery-man.svg";
const EXT = /\.(webp|png|jpe?g|gif|svg|avif)$/i;

const FP = () => foundry.applications.apps.FilePicker.implementation;

export function artFolder() {
  return game.settings.get(SYSTEM_ID, "monsterArtFolder")?.trim() || DEFAULT_ART_FOLDER;
}

/** Normalise a name for matching. */
export function artKey(name) {
  return String(name ?? "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Keys a creature answers to: full name, and the name without any bracketed part. */
export function creatureKeys(name) {
  const keys = new Set([artKey(name)]);
  const bare = String(name ?? "").replace(/\s*\(.*?\)\s*/g, " ").trim();
  if ( bare ) keys.add(artKey(bare));
  return [...keys];
}

/** Create the art folder in the Foundry data area if it is missing (outside the system folder, so updates never touch it). */
export async function ensureArtFolder() {
  if ( !game.user.isGM ) return;
  const folder = artFolder();
  try { await FP().browse("data", folder); return; } catch ( e ) { /* missing: create it */ }
  try {
    await FP().createDirectory("data", folder, {});
    ui.notifications.info(game.i18n.format("PT.Art.Created", { folder }));
  } catch ( e ) {
    console.warn(`${SYSTEM_ID} | Could not create the art folder "${folder}"`, e);
  }
}

/** Map of artKey -> image path, from the folder and its immediate subfolders. Files must start with "Token ". */
export async function loadArtIndex() {
  const folder = artFolder();
  const index = new Map();
  let root;
  try { root = await FP().browse("data", folder); } catch ( e ) { return { index, files: [] }; }
  const files = [...root.files];
  for ( const dir of root.dirs ?? [] ) {
    try { files.push(...(await FP().browse("data", dir)).files); } catch ( e ) { /* skip unreadable */ }
  }
  const art = [];
  for ( const path of files ) {
    const file = decodeURIComponent(path.split("/").pop());
    if ( !EXT.test(file) ) continue;
    const m = file.replace(EXT, "").match(/^token[\s_-]+(.+)$/i);
    if ( !m ) continue;
    const key = artKey(m[1]);
    if ( key && !index.has(key) ) index.set(key, path);
    art.push({ path, file, key });
  }
  return { index, files: art };
}

function findArt(index, name) {
  for ( const k of creatureKeys(name) ) if ( index.has(k) ) return index.get(k);
  return null;
}

/** True when an image is the default or comes from the art folder (so it is safe to replace). */
function replaceable(img, folder) {
  return !img || img === DEFAULT_IMG || decodeURIComponent(img).startsWith(`${folder}/`) || img.startsWith(`${folder}/`);
}

/**
 * Apply art to the system's creature compendium, to creatures in the world that still use the
 * default image (or earlier art from the folder), and to their placed tokens.
 */
export async function applyMonsterArt({ quiet = false } = {}) {
  if ( !game.user.isGM ) return;
  const folder = artFolder();
  const { index, files } = await loadArtIndex();
  if ( !index.size ) {
    if ( !quiet ) ui.notifications.warn(game.i18n.format("PT.Art.None", { folder }));
    return { matched: 0 };
  }
  const used = new Set();
  let packCount = 0, worldCount = 0, tokenCount = 0;

  // System compendium
  const pack = game.packs.get(`${SYSTEM_ID}.creatures`);
  if ( pack ) {
    const docs = await pack.getDocuments();
    const updates = [];
    for ( const a of docs ) {
      const src = findArt(index, a.name);
      if ( !src ) continue;
      used.add(src);
      if ( a.img === src && a.prototypeToken.texture.src === src ) continue;
      updates.push({ _id: a.id, img: src, "prototypeToken.texture.src": src });
    }
    if ( updates.length ) {
      const wasLocked = pack.locked;
      if ( wasLocked ) await unlockPack(pack);
      await Actor.updateDocuments(updates, { pack: pack.collection });
      if ( wasLocked ) await pack.configure({ locked: true });
      packCount = updates.length;
    }
  }

  // World creatures that have not been given their own picture
  const worldUpdates = [];
  for ( const a of game.actors.filter(a => a.type === "creature") ) {
    const src = findArt(index, a.name);
    if ( !src ) continue;
    used.add(src);
    const upd = { _id: a.id };
    if ( replaceable(a.img, folder) && a.img !== src ) upd.img = src;
    if ( replaceable(a.prototypeToken.texture.src, folder) && a.prototypeToken.texture.src !== src ) upd["prototypeToken.texture.src"] = src;
    if ( Object.keys(upd).length > 1 ) worldUpdates.push(upd);
  }
  if ( worldUpdates.length ) { await Actor.updateDocuments(worldUpdates); worldCount = worldUpdates.length; }

  // Placed creature tokens still showing the default image
  for ( const scene of game.scenes ) {
    const tUpd = [];
    for ( const t of scene.tokens ) {
      if ( t.actor?.type !== "creature" ) continue;
      const src = findArt(index, t.actor.name) ?? findArt(index, t.name);
      if ( !src || !replaceable(t.texture.src, folder) || t.texture.src === src ) continue;
      tUpd.push({ _id: t.id, "texture.src": src });
    }
    if ( tUpd.length ) { await scene.updateEmbeddedDocuments("Token", tUpd); tokenCount += tUpd.length; }
  }

  // Report images that matched nothing
  const unmatched = files.filter(f => !used.has(f.path) && ![...(pack?.index ?? [])].some(e => creatureKeys(e.name).includes(f.key)));
  if ( !quiet ) ui.notifications.info(game.i18n.format("PT.Art.Done", { pack: packCount, world: worldCount, tokens: tokenCount }));
  if ( unmatched.length ) {
    const list = unmatched.map(f => `<li>${foundry.utils.escapeHTML(f.file)}</li>`).join("");
    await ChatMessage.create({
      content: `<div class="pt-card"><header class="pt-card-title">${game.i18n.localize("PT.Art.Unmatched")}</header><div class="pt-card-body"><p>${game.i18n.localize("PT.Art.UnmatchedHint")}</p><ul>${list}</ul></div></div>`,
      whisper: ChatMessage.getWhisperRecipients("GM").map(u => u.id)
    });
  }
  return { matched: used.size, packCount, worldCount, tokenCount, unmatched: unmatched.length };
}
