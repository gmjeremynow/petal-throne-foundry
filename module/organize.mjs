import { SYSTEM_ID } from "./config.mjs";

/**
 * Sort skills and spells in the Items tab into type folders, the same groups the compendiums use.
 * Each item goes into a subfolder of the folder it is in now (or a top-level folder when it has none).
 * Items already in a type folder stay under that folder's parent. Professional skills and spells are
 * ordered by their rank on the profession's list.
 */
const SKILL_GROUPS = {
  plebeian: "Group I: Plebeian", skilled: "Group II: Skilled", noble: "Group III: Noble",
  warrior: "Warrior professional skills", priest: "Priest professional skills", magicUser: "Magic User professional skills",
  language: "Languages", other: "Other skills"
};
const SPELL_GROUPS = {
  "prof-priest": "Priest professional spells", "prof-magicUser": "Magic User professional spells",
  "bonus-1": "Bonus spells: Group I", "bonus-2": "Bonus spells: Group II", "bonus-3": "Bonus spells: Group III"
};
const ROMAN = { 1: "I", 2: "II", 3: "III" };
const profLabel = p => game.i18n.localize(CONFIG.PT?.professions?.[p] ?? p);
const isProfession = p => !!CONFIG.PT?.professions?.[p];

/** Folder name for a group key; add-on professions get their own folders. */
function folderName(key) {
  if ( SKILL_GROUPS[key] ) return SKILL_GROUPS[key];
  if ( SPELL_GROUPS[key] ) return SPELL_GROUPS[key];
  let m;
  if ( (m = key.match(/^skill-(.+)$/)) ) return `${profLabel(m[1])} professional skills`;
  if ( (m = key.match(/^prof-(.+)$/)) ) return `${profLabel(m[1])} professional spells`;
  if ( (m = key.match(/^bonus-(.+)-(\d)$/)) ) return `${profLabel(m[1])} bonus spells: Group ${ROMAN[m[2]]}`;
  return null;
}
const MANUAL_RE = /^(warrior|priest|magicUser|skill-.+|prof-.+)$/;

function groupOf(item) {
  const s = item.system;
  if ( item.type === "skill" ) {
    if ( SKILL_GROUPS[s.group] ) return s.group;
    if ( isProfession(s.group) ) return `skill-${s.group}`;
    return "other";
  }
  if ( item.type === "spell" ) {
    if ( s.kind === "professional" ) return isProfession(s.profession) ? `prof-${s.profession}` : null;
    if ( ![1, 2, 3].includes(s.group) ) return null;
    if ( s.profession && isProfession(s.profession) && !["priest", "magicUser"].includes(s.profession) ) return `bonus-${s.profession}-${s.group}`;
    return `bonus-${s.group}`;
  }
  return null;
}
const isTypeFolderName = name => Object.values(SKILL_GROUPS).includes(name) || Object.values(SPELL_GROUPS).includes(name)
  || / professional (skills|spells)$/.test(name) || / bonus spells: Group I{1,3}$/.test(name);

export async function organizeItems({ quiet = false } = {}) {
  if ( !game.user.isGM ) return 0;
  try { return await _organize(quiet); }
  catch ( err ) {
    console.error(`${SYSTEM_ID} | Sorting skills and spells failed`, err);
    ui.notifications.error(game.i18n.localize("PT.Organize.Failed"));
    return 0;
  }
}

/** True when some skill or spell in the Items tab is not yet in its type folder. */
export function needsOrganizing() {
  return game.items.some(i => {
    const key = groupOf(i);
    if ( !key ) return false;
    return i.folder?.name !== folderName(key);
  });
}

let _timer = null;
/** Sort shortly after skills or spells are added (many arrive at once when a pack is imported). */
export function scheduleOrganize() {
  if ( !game.user.isGM ) return;
  if ( game.users.activeGM && game.users.activeGM.id !== game.user.id ) return;
  clearTimeout(_timer);
  _timer = setTimeout(() => { if ( needsOrganizing() ) organizeItems({ quiet: true }); }, 1500);
}

async function _organize(quiet) {
  const items = game.items.filter(i => ["skill", "spell"].includes(i.type));
  if ( !items.length ) { if ( !quiet ) ui.notifications.info(game.i18n.localize("PT.Organize.None")); return 0; }
  const cache = new Map();
  const findOrMake = async (parent, key) => {
    const name = folderName(key);
    const id = `${parent?.id ?? "root"}|${name}`;
    if ( cache.has(id) ) return cache.get(id);
    let f = game.folders.find(x => x.type === "Item" && x.name === name && (x.folder?.id ?? null) === (parent?.id ?? null));
    if ( !f ) f = await Folder.implementation.create({ name, type: "Item", folder: parent?.id ?? null, sorting: MANUAL_RE.test(key) ? "m" : "a" });
    cache.set(id, f);
    return f;
  };
  const updates = [];
  for ( const item of items ) {
    const key = groupOf(item);
    if ( !key ) continue;
    let parent = item.folder ?? null;
    if ( parent && isTypeFolderName(parent.name) ) parent = parent.folder ?? null;
    const target = await findOrMake(parent, key);
    const upd = { _id: item.id };
    if ( item.folder?.id !== target.id ) upd.folder = target.id;
    if ( MANUAL_RE.test(key) ) {
      const sort = (item.system.rank || 0) * 1000;
      if ( item.sort !== sort ) upd.sort = sort;
    }
    if ( Object.keys(upd).length > 1 ) updates.push(upd);
  }
  if ( updates.length ) await Item.updateDocuments(updates);
  if ( !quiet || updates.length ) ui.notifications.info(game.i18n.format("PT.Organize.Done", { n: updates.length }));
  return updates.length;
}

/** GM-only button in the Items tab header. */
export function addOrganizeButton(app, html) {
  if ( !game.user.isGM ) return;
  const root = html instanceof HTMLElement ? html : html?.[0];
  if ( !root || root.querySelector(".pt-organize") ) return;
  const bar = root.querySelector(".header-actions") ?? root.querySelector(".directory-header .action-buttons");
  if ( !bar ) return;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "pt-organize pt-apply-art";
  btn.innerHTML = `<i class="fa-solid fa-folder-tree"></i> ${game.i18n.localize("PT.Organize.Label")}`;
  btn.dataset.tooltip = game.i18n.localize("PT.Organize.Hint");
  btn.addEventListener("click", async ev => {
    ev.preventDefault();
    btn.disabled = true;
    try { await organizeItems(); } finally { btn.disabled = false; }
  });
  bar.append(btn);
}

export { SYSTEM_ID };
