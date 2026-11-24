/**
 * Treasure and magic item roller: EPT 1975 Secs. 1300-1920 and 2200.
 * The tables live in treasure-data.mjs (generated from tools/treasure_data.py, which also builds the RollTables).
 * Everything here is rolled for the GM and whispered as a chat card; items are linked to the compendiums,
 * so they can be dragged onto sheets.
 */
import { TREASURE } from "./treasure-data.mjs";

const SYS = "petal-throne";
const T = TREASURE.tables;

/* -------------------------------------------- */
/*  Dice                                        */
/* -------------------------------------------- */

let rand = () => (globalThis.CONFIG?.Dice?.randomUniform ?? Math.random)();
/** For tests: replace the random source. */
export function setRandom(fn) { rand = fn; }
export const d = n => Math.floor(rand() * n) + 1;
const nd = (n, s) => { let t = 0; for ( let i = 0; i < n; i++ ) t += d(s); return t; };

/** Look up a roll on one of the tables. */
export function lookup(key, roll) {
  const row = T[key].rows.find(([lo, hi]) => roll >= lo && roll <= hi);
  return row ? row[2] : "";
}
function rollOn(key) {
  const sides = Number(T[key].formula.replace("1d", ""));
  const roll = d(sides);
  return { roll, text: lookup(key, roll), index: T[key].rows.findIndex(([lo, hi]) => roll >= lo && roll <= hi) };
}

/**
 * Number of items for a treasure-table entry ("1-6", "2-12", "1-3", "10-40", ...). EPT says to roll a 6-sided die;
 * 1-3 is read as half a d6 rounded up, 2-12 / 4-24 / 6-36 as that many d6, 1-100 as d100, 10-40 and 10-60 as d4 or d6 × 10.
 */
export function countFor(range) {
  const [lo, hi] = range.split("-").map(Number);
  if ( hi === undefined || Number.isNaN(hi) ) return lo;
  if ( lo === 1 && hi === 3 ) return Math.ceil(d(6) / 2);
  if ( lo === 1 ) return d(hi);
  if ( lo === 10 ) return d(hi / 10) * 10;
  return nd(lo, hi / lo);
}

/* -------------------------------------------- */
/*  Gems and jewelry (Sec. 2210)                */
/* -------------------------------------------- */

export function gemValue() {
  const steps = TREASURE.gemSteps;
  let i = rollOn("gemBase").index;
  while ( d(6) === 1 ) i++;
  if ( i < steps.length ) return steps[i];
  return 100000 * (i - steps.length + 2); // above 100,000: 200,000, 300,000, ...
}
export function jewelryValue() {
  const cats = TREASURE.jewelry;
  let i = rollOn("jewelryBase").index;
  while ( d(6) === 1 && i < cats.length - 1 ) i++;
  const [n, s, mult] = cats[i];
  return nd(n, s) * mult;
}

/* -------------------------------------------- */
/*  Items                                       */
/* -------------------------------------------- */

const link = (pack, [name, id]) => ({ name, uuid: `Compendium.${SYS}.${pack}.Item.${id}` });
export function randomEye() {
  const e = link("eyes", TREASURE.eyes[d(36) - 1]);
  const defective = d(100) <= 5;
  return { ...e, kind: "eye", note: `${d(100)} charges${defective ? "; DEFECTIVE" : ""}` };
}
export const randomAmulet = () => ({ ...link("amulets", TREASURE.amulets[d(12) - 1]), kind: "amulet" });
export const randomMiscItem = () => {
  const row = TREASURE.miscItems[d(24) - 1];
  return { ...link("magic-items", row), kind: "misc", note: row[2] ? `${d(100)} charges` : "" };
};
export const randomBook = () => ({ ...link("magic-items", TREASURE.books[d(24) - 1]), kind: "book",
  note: d(100) <= 20 ? "disappears if not read at once" : "" });

/** Bonus spell names by group (1-3), filled from the spells compendium at run time (or by tests). */
let SPELLS = null;
export function setSpells(byGroup) { SPELLS = byGroup; }
async function loadSpells() {
  if ( SPELLS ) return SPELLS;
  const pack = game.packs.get(`${SYS}.spells`);
  const docs = pack ? await pack.getDocuments() : [];
  SPELLS = { 1: [], 2: [], 3: [] };
  for ( const s of docs ) if ( s.system.kind === "bonus" && SPELLS[s.system.group] ) SPELLS[s.system.group].push({ name: s.name, uuid: s.uuid });
  return SPELLS;
}
function randomSpell(group) {
  const list = SPELLS?.[group] ?? [];
  if ( !list.length ) return { name: `a Group ${"I".repeat(group)} bonus spell` };
  return list[d(list.length) - 1];
}

/** A scroll (Sec. 1610). */
export function randomScroll() {
  const modern = d(100) <= 60;
  const lang = rollOn(modern ? "scrollModern" : "scrollAncient").text;
  const type = d(12);
  const typeText = lookup("scrollType", type);
  const groups = { 1: [1], 2: [1, 1], 3: [1, 2], 4: [1, 1, 2], 5: [2, 2], 6: [3], 7: [3, 3], 8: [2, 3, 3] }[type];
  let spells = [];
  if ( groups ) spells = groups.map(randomSpell);
  else if ( type === 9 ) spells = [{ name: "ESP" }, { name: "Revivify" }];
  else if ( type === 10 ) spells = [{ name: "Necromancy" }, { name: "The Grey Hand" }];
  else if ( type === 11 ) spells = [{ name: "Remove Curse" }, { name: "Monster Control" }, { name: "Cure Serious Wounds" }];
  const curse = type === 12 ? lookup("scrollCurse", d(20)) : "";
  return { kind: "scroll", name: `Scroll (${typeText.split(":")[0]}) in ${lang}`, spells, curse,
    note: type === 12 ? "" : "50% chance it fades if not read at once; each spell 10% chance to remain for a second use" };
}

/** Sec. 1810 powers for a magic sword, scimitar or battle-axe. */
export function weaponPowers(plus) {
  const out = [];
  out.push(`Alignment: ${lookup("weaponAlign", d(100))}`);
  const intRoll = d(100);
  if ( intRoll > 50 ) out.push(`Intelligence: ${lookup("weaponInt", intRoll)}`);
  const egoRoll = d(100);
  if ( egoRoll > 50 ) out.push(`Ego: ${lookup("weaponEgo", egoRoll)}`);
  if ( intRoll > 80 ) {
    const en = lookup("weaponEnemy", d(100));
    if ( !en.startsWith("No ") ) out.push(en);
  }
  const p = Math.min(4, Math.max(1, plus));
  const need = TREASURE.weaponSpells[p];
  const sr = d(100);
  const n = need.filter(x => sr >= x).length;
  const spells = [];
  for ( let i = 0; i < n; i++ ) {
    const g = d(6);
    const grp = TREASURE.weaponSpellGroup[p].find(([lo, hi]) => g >= lo && g <= hi)[2];
    spells.push(randomSpell(grp));
  }
  return { powers: out, spells };
}

/** One item of magical arms or armour (Secs. 1820 and 2230). kind: "Shield" | "Helmet" | "Armour" | "Sword" | "Miscellaneous weapon" | undefined */
export function randomArms(kind) {
  kind ??= lookup("armsType", d(20));
  if ( ["Shield", "Helmet", "Armour"].includes(kind) ) return { kind: "arms", name: `${kind} ${lookup("armourPlus", d(100))}`, note: "steel or iron" };
  let text, edged = true;
  if ( kind === "Sword" ) text = `Sword, ${lookup("swordPlus", d(100))}`;
  else { text = lookup("miscWeapon", d(100)); edged = /^(Scimitar|Battle-axe)/.test(text); }
  const plus = Number(text.match(/\+(\d) on hitting/)?.[1] ?? 1);
  const r = { kind: "arms", name: text };
  if ( edged ) Object.assign(r, weaponPowers(plus));
  return r;
}

/** One "miscellaneous" treasure entry (Sec. 2230). */
export function randomMiscTreasure() {
  const t = lookup("miscType", d(20));
  if ( t.startsWith("Amulet") ) return randomAmulet();
  if ( t.startsWith("Scroll") ) return randomScroll();
  if ( t.startsWith("Miscellaneous") ) return randomMiscItem();
  return randomBook();
}

/* -------------------------------------------- */
/*  Hoards (Sec. 2220)                          */
/* -------------------------------------------- */

export function rollHoard(type) {
  const row = TREASURE.hoard[type];
  if ( !row ) return null;
  const out = { type, coins: [], gems: [], jewelry: [], items: [], checks: [] };
  TREASURE.hoardCols.forEach((col, i) => {
    const entry = row[i];
    if ( !entry ) return;
    const [range, chance] = entry;
    const roll = d(100);
    const found = roll <= chance;
    out.checks.push({ col, chance, roll, found });
    if ( !found ) return;
    const n = countFor(range);
    if ( col === "copper" || col === "silver" || col === "gold" ) out.coins.push({ col, amount: n * 1000 });
    else if ( col === "gems" ) for ( let k = 0; k < n; k++ ) out.gems.push(gemValue());
    else if ( col === "jewelry" ) for ( let k = 0; k < n; k++ ) out.jewelry.push(jewelryValue());
    else if ( col === "eyes" ) for ( let k = 0; k < n; k++ ) out.items.push(randomEye());
    else if ( col === "arms" ) for ( let k = 0; k < n; k++ ) out.items.push(randomArms());
    else if ( col === "misc" ) for ( let k = 0; k < n; k++ ) out.items.push(randomMiscTreasure());
  });
  return out;
}

/** Treasure types and chances in a creature's treasure text, e.g. "Lair 40: 4-24; treasure D: 40, E: 10". */
export function parseTreasure(text) {
  return [...String(text ?? "").matchAll(/\b([A-I]):\s*(\d+)/g)].map(m => ({ type: m[1], chance: Number(m[2]) }));
}

/* -------------------------------------------- */
/*  Nonplayer characters (Secs. 1910, 1920)     */
/* -------------------------------------------- */

const bandOf = level => level >= 10 ? 4 : level >= 8 ? 3 : level >= 6 ? 2 : level >= 4 ? 1 : 0;
const rowFor = (rows, band, roll) => rows.find(([, r]) => r[band] && roll >= r[band][0] && roll <= r[band][1])?.[0] ?? null;

/** Expand "1-3 Eyes, 1 Amulet, and 1 Scroll" into items. */
function expandDevices(text) {
  const items = [];
  for ( const part of text.split(/,\s*(?:and\s+)?|\s+and\s+/) ) {
    const m = part.trim().match(/^(1-3|1-6|\d+|one)\s+(.*)$/i);
    if ( !m ) continue;
    const n = m[1] === "1-3" ? Math.ceil(d(6) / 2) : m[1] === "1-6" ? d(6) : m[1].toLowerCase() === "one" ? 1 : Number(m[1]);
    const what = m[2].toLowerCase();
    for ( let k = 0; k < n; k++ ) {
      if ( what.startsWith("eye") ) items.push(randomEye());
      else if ( what.startsWith("amulet") ) items.push(randomAmulet());
      else if ( what.startsWith("scroll") ) items.push(randomScroll());
      else if ( what.startsWith("miscellaneous") ) items.push(randomMiscItem());
      else if ( what.startsWith("book") ) items.push(randomBook());
    }
  }
  return items;
}

/** Expand "Sword and Armour", "Miscellaneous Weapon, Armour, and Shield", ... into items. */
function expandArms(text) {
  if ( text.startsWith("One of each") ) return [{ kind: "arms", name: text }];
  return text.replace(/Miscellaneous Weapon/, "Miscellaneous weapon").split(/,\s*(?:and\s+)?|\s+and\s+/).map(w => w.trim()).filter(Boolean).map(w => {
    if ( w === "Dagger" ) return { kind: "arms", name: `Dagger, ${["+1 on hitting chances", "+2 on hitting chances", "+3 on hitting chances, +1 on damage"][d(3) - 1]}`,
      note: "one of the three dagger results of Sec. 1820, picked at random (the same as rolling that table until a dagger comes up)" };
    return randomArms(w);
  });
}

/**
 * Magic an NPC carries. profession: "warrior" | "priest" | "magicUser" (others treated as magic users for devices only).
 * Returns { arms: {roll, text, items}, devices: {confirm, roll, text, items} }.
 */
export function rollNpcMagic(level, profession) {
  const out = { level, profession, arms: null, devices: null };
  if ( level < 2 ) return out;
  const band = bandOf(level);
  if ( profession === "warrior" || profession === "priest" ) {
    let roll, text, items, tries = 0;
    do {
      roll = d(100);
      text = rowFor(TREASURE.npcArms, band, roll);
      items = text ? expandArms(text) : [];
      tries++;
      // Priests may not have swords or edged weapons: roll again (Sec. 1910). Edged follows the system weapons (spears and bows count).
    } while ( profession === "priest" && items.some(i => /^(Sword|Scimitar|Battle-axe|Dagger|Spear|Bow|10 arrows)/.test(i.name)) && tries < 50 );
    out.arms = { roll, text, items, rerolls: tries - 1 };
  }
  const confirm = profession === "warrior" ? d(20) : null;
  if ( confirm === null || confirm >= 14 ) {
    const roll = d(100);
    const text = rowFor(TREASURE.npcDevices, band, roll);
    out.devices = { confirm, roll, text, items: text ? expandDevices(text) : [] };
  } else out.devices = { confirm, roll: null, text: null, items: [] };
  return out;
}

/* -------------------------------------------- */
/*  Chat output                                 */
/* -------------------------------------------- */

const fmt = n => n.toLocaleString("en-US");
const COIN = { copper: "copper Qirgál", silver: "silver Hlásh", gold: "gold Káitars" };
function itemHtml(it) {
  const name = it.uuid ? `@UUID[${it.uuid}]{${it.name}}` : `<b>${it.name}</b>`;
  let s = name + (it.note ? ` <span class="hint">(${it.note})</span>` : "");
  if ( it.spells?.length ) s += `<br>Spells: ${it.spells.map(x => x.uuid ? `@UUID[${x.uuid}]{${x.name}}` : x.name).join(", ")}`;
  if ( it.curse ) s += `<br>Curse: ${it.curse}`;
  if ( it.powers?.length ) s += `<br>${it.powers.join("; ")}`;
  return `<li>${s}</li>`;
}
function hoardHtml(h) {
  let html = `<p class="hint">${h.checks.map(c => `${c.col} ${c.roll}/${c.chance}${c.found ? " ✓" : ""}`).join(" · ")}</p>`;
  const lines = [];
  for ( const c of h.coins ) lines.push(`<li>${fmt(c.amount)} ${COIN[c.col]}</li>`);
  if ( h.gems.length ) {
    const total = h.gems.reduce((a, b) => a + b, 0);
    const groups = {};
    for ( const g of h.gems ) groups[g] = (groups[g] ?? 0) + 1;
    lines.push(`<li>${h.gems.length} gem${h.gems.length > 1 ? "s" : ""} (${fmt(total)} Káitars): ${Object.entries(groups).sort((a, b) => b[0] - a[0]).map(([v, n]) => `${n} × ${fmt(Number(v))}`).join(", ")}</li>`);
  }
  if ( h.jewelry.length ) {
    const total = h.jewelry.reduce((a, b) => a + b, 0);
    lines.push(`<li>${h.jewelry.length} piece${h.jewelry.length > 1 ? "s" : ""} of jewelry (${fmt(total)} Káitars): ${h.jewelry.map(fmt).join(", ")}</li>`);
  }
  for ( const it of h.items ) lines.push(itemHtml(it));
  html += lines.length ? `<ul>${lines.join("")}</ul>` : "<p>Nothing.</p>";
  return html;
}

async function whisper(title, body) {
  const TE = foundry.applications?.ux?.TextEditor?.implementation ?? globalThis.TextEditor;
  const content = await TE.enrichHTML(`<div class="pt-card"><header class="pt-card-title">${title}</header><div class="pt-card-body">${body}</div></div>`);
  return ChatMessage.create({ content, whisper: game.users.filter(u => u.isGM).map(u => u.id) });
}

export async function postHoard(type, label = "") {
  await loadSpells();
  const h = rollHoard(type);
  if ( !h ) return ui.notifications.warn(`Unknown treasure type ${type}`);
  return whisper(`${label ? label + ": " : ""}Treasure type ${type}`, hoardHtml(h));
}

/** Roll a creature's carried or lair treasure from its sheet text. */
export async function rollCreatureTreasure(actor, which) {
  await loadSpells();
  const text = actor.system.treasure?.[which] ?? "";
  const entries = parseTreasure(text);
  if ( !entries.length ) return whisper(`${actor.name}: ${which === "lair" ? "lair" : "carried"} treasure`, `<p>${text || "None"}: no treasure type to roll.</p>`);
  let body = "";
  for ( const { type, chance } of entries ) {
    const roll = d(100);
    body += `<h4>Type ${type}: ${roll} vs. ${chance}%</h4>`;
    body += roll <= chance ? hoardHtml(rollHoard(type)) : "<p>No treasure of this type.</p>";
  }
  return whisper(`${actor.name}: ${which === "lair" ? "lair" : "carried"} treasure`, body);
}

export async function postNpcMagic(level, profession, label = "") {
  await loadSpells();
  const r = rollNpcMagic(level, profession);
  let body = "";
  if ( level < 2 ) body = "<p>First-level characters have no magic items (Secs. 1910, 1920).</p>";
  else {
    if ( r.arms ) body += `<h4>Arms and armour (Sec. 1910): ${r.arms.roll}${r.arms.rerolls ? ` (rolled again ${r.arms.rerolls}× for a priest)` : ""}</h4>` +
      (r.arms.items.length ? `<ul>${r.arms.items.map(itemHtml).join("")}</ul>` : "<p>None.</p>");
    body += `<h4>Devices (Sec. 1920)${r.devices.confirm !== null ? `: confirming throw ${r.devices.confirm} (needs 14)` : ""}${r.devices.roll ? `: ${r.devices.roll}` : ""}</h4>` +
      (r.devices.items.length ? `<ul>${r.devices.items.map(itemHtml).join("")}</ul>` : "<p>None.</p>");
  }
  const prof = { warrior: "Warrior", priest: "Priest", magicUser: "Magic User" }[profession] ?? profession;
  return whisper(`${label ? label + ": " : ""}NPC magic, ${prof} level ${level}`, body);
}

export async function postSingle(kind) {
  await loadSpells();
  const make = { scroll: randomScroll, arms: () => randomArms(), eye: randomEye, amulet: randomAmulet, misc: randomMiscItem, book: randomBook,
    gem: () => ({ name: `Gem worth ${fmt(gemValue())} Káitars` }), jewelry: () => ({ name: `Jewelry worth ${fmt(jewelryValue())} Káitars` }) }[kind];
  if ( !make ) return;
  return whisper("Treasure", `<ul>${itemHtml(make())}</ul>`);
}

/** Dialog for the Roll Treasure macro. */
export async function treasureDialog() {
  if ( !game.user.isGM ) return ui.notifications.warn("Only the GM can roll treasure.");
  const types = "ABCDEFGHI".split("").map(t => `<option value="${t}">${t}</option>`).join("");
  const content = `<div class="pt-treasure-dialog">
    <label>Treasure type <select name="type">${types}</select></label>
    <hr><label>NPC level <input type="number" name="level" value="5" min="1" style="width:4em"></label>
    <label>Profession <select name="prof"><option value="warrior">Warrior</option><option value="priest">Priest</option><option value="magicUser">Magic User</option></select></label>
    <hr><label>Single item <select name="single"><option value="scroll">Scroll</option><option value="arms">Magic arms or armour</option><option value="eye">Eye</option>
      <option value="amulet">Amulet</option><option value="misc">Miscellaneous magical item</option><option value="book">Book</option><option value="gem">Gem</option><option value="jewelry">Jewelry</option></select></label></div>`;
  return foundry.applications.api.DialogV2.wait({
    window: { title: "Roll Treasure (EPT Secs. 1300-2200)" }, content, rejectClose: false,
    buttons: [
      { action: "hoard", label: "Treasure hoard", callback: (e, b) => postHoard(b.form.elements.type.value) },
      { action: "npc", label: "NPC magic", callback: (e, b) => postNpcMagic(Number(b.form.elements.level.value) || 1, b.form.elements.prof.value) },
      { action: "single", label: "Single item", callback: (e, b) => postSingle(b.form.elements.single.value) }
    ]
  });
}
