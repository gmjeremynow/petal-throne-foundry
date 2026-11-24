/**
 * Optional character background generator from Swords & Glory Vol. 2 (Secs. 2.231-2.235):
 * provenience, home region, home locale type, homeland, language mastery,
 * clan status, lineage status, family wealth and personal wealth.
 * Tables are transcribed as data; dice are rolled through Foundry.
 */
import { SYSTEM_ID } from "./config.mjs";

const { DialogV2 } = foundry.applications.api;
const loc = (k, d) => game.i18n.has(k) ? game.i18n.localize(k) : (d ?? k);

export const LOCALE_TYPES = ["Rural", "Small town", "Town", "Large town", "Small city", "Large city", "Metropolis"];

/** [localMax, outsiderMax]; above outsiderMax = foreigner (Sec. 2.231). */
const PROVENIENCE = [[80, 95], [70, 90], [65, 85], [60, 80], [55, 80], [50, 75], [45, 75]];

const HOME_REGION = [[2, "North-central"], [4, "Northeastern"], [6, "East-central"], [8, "Southeastern"], [10, "South-central"], [12, "Southwestern"], [14, "West-central"], [16, "Northwestern"], [18, "Central"], [20, "Unusual (referee's choice)"]];
const HOME_LOCALE = [[2, 0], [5, 1], [8, 2], [11, 3], [14, 4], [17, 5], [20, 6]];

const FOREIGN_NATION = [[15, "Salarvyá"], [30, "Mu'ugalavyá"], [45, "Livyánu"], [60, "Yán Kór"], [80, "Tsolyánu"], [100, "small"]];

const SMALL_NATION = [[9, "N'lüss"], [14, "Tsolei"], [17, "M'morcha / Nmartúsha"], [21, "Ghatón"], [26, "Pijéna"], [34, "Milumanayá"], [44, "Saá Allaqí"], [47, "Lorún"], [50, "Cháyakku"], [55, "Kilalámmu"], [60, "Háida Pakála"], [65, "Pecháno"], [69, "Jánnu"], [71, "Péncha Nágal"], [73, "Píltu Dasáru"], [75, "Ssrá Ab Tsáya"], [78, "Mudállu"], [81, "Nuru'ún"], [85, "Mihállu (human)"], [88, "Rannálu"], [92, "Nyémesel Isles"], [93, "Hrgá Lorúnje"], [97, "Unusual: referee's choice on the maps"], [100, "Off the maps (referee's choice)"]];


const MASTERY = ["Elementary", "Intermediate", "Advanced", "Near-native"];
const MASTERY_HUMAN = [15, 60, 85, 100];
const MASTERY_NONHUMAN = [25, 75, 90, 100];

const CLAN_STATUS = [[1, "Tlakotáni (imperial)"], [15, "Very high"], [30, "High"], [60, "Medium"], [85, "Low"], [100, "Very low"]];

/** Lineage within the clan by locale: upper bounds for Very low, Low, Medium, High; above = Very high. */
const LINEAGE = [[60, 90, 97, 99], [50, 85, 95, 98], [45, 75, 93, 97], [40, 70, 90, 96], [35, 65, 87, 95], [30, 60, 85, 94], [25, 50, 83, 93]];
const LINEAGE_LABELS = ["Very low", "Low", "Medium", "High", "Very high"];

/** Clan status (rows: Very low..Very high) x lineage (cols) -> clan-lineage letter. */
const CLAN_LINEAGE = [
  ["A", "A", "B", "B", "C"],
  ["A", "B", "B", "C", "D"],
  ["C", "D", "E", "F", "G"],
  ["D", "E", "F", "G", "H"],
  ["F", "G", "H", "I", "J"]
];
const LETTERS = "ABCDEFGHIJ";
/** Locale (rows) x letter (cols A..J) -> family wealth-group. */
const WEALTH_GROUP = [
  [1, 1, 2, 2, 2, 3, 3, 4, 5, 6],
  [1, 2, 2, 2, 3, 3, 4, 5, 6, 7],
  [2, 2, 2, 3, 3, 4, 5, 6, 7, 8],
  [2, 2, 3, 3, 4, 5, 6, 7, 8, 9],
  [3, 4, 4, 5, 6, 7, 8, 9, 10, 11],
  [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  [4, 5, 6, 7, 8, 9, 10, 11, 12, 12]
];
/** Family wealth: D100 modifier by wealth-group 1..12 (group 1 divides by 2). */
const FAMILY_MULT = [0.5, 1, 2, 3, 5, 10, 30, 50, 100, 300, 500, 1000];
/** Personal fortuitous amount multiplier by wealth-group. */
const PERSONAL_MULT = g => g <= 3 ? 1 : g <= 6 ? 2 : g <= 8 ? 3 : g <= 10 ? 5 : g === 11 ? 10 : 20;
/** Clanless: D10 -> multiplier. */
const CLANLESS_MULT = d => d <= 2 ? 0.5 : d <= 6 ? 1 : d === 7 ? 2 : d === 8 ? 3 : d === 9 ? 5 : 10;

/** Nations whose family wealth-group is capped (Sec. 2.235 footnote). */
const CAP_10 = ["Mihállu (human)", "Milumanayá", "Pecháno", "Pijéna"];
const CAP_8 = ["Cháyakku", "Ghatón", "Jánnu", "Kilalámmu"];
const FIVE_EMPIRES = ["Salarvyá", "Mu'ugalavyá", "Livyánu", "Yán Kór", "Tsolyánu"];

function pick(table, roll) {
  return table.find(([max]) => roll <= max)[1];
}

async function d(formula) {
  const r = new Roll(formula);
  await r.evaluate();
  return r;
}

/**
 * Roll a full background. Returns { lines, rolls, updates }.
 * @param {Actor} actor
 * @param {object} o
 * @param {number} o.startLocale  index into LOCALE_TYPES of the referee's starting locale
 * @param {string} o.startNation  nation where the game starts
 * @param {boolean} o.nonhuman    roll nonhuman language line
 */
export async function generateBackground(actor, { startLocale = 6, startNation = "Tsolyánu" } = {}) {
  const rolls = [];
  const lines = [];
  const roll = async f => { const r = await d(f); rolls.push(r); return r.total; };
  const isNonhuman = actor.system.species !== "human";

  // Provenience.
  let homeland = startNation, localeIdx = startLocale, region = "";
  const p = await roll("1d100");
  const [lMax, oMax] = PROVENIENCE[startLocale];
  let status = p <= lMax ? "Local resident" : p <= oMax ? "Outsider (same country)" : "Foreigner";
  if ( isNonhuman ) status = "Foreigner";
  lines.push(["Provenience", `${status} (${p})`]);

  if ( status !== "Local resident" ) {
    if ( status === "Foreigner" ) {
      // A nonhuman character's species is already chosen on the sheet; the S&G species table is not rolled.
      if ( isNonhuman ) homeland = `${CONFIG.PT.species[actor.system.species]?.label ?? "Nonhuman"} enclave`;
      else {
        const f = pick(FOREIGN_NATION, await roll("1d100"));
        // "Small nation or nonhuman": a human character always takes the small-nation table.
        if ( f === "small" ) homeland = pick(SMALL_NATION, await roll("1d100"));
        else homeland = f;
      }
    }
    region = pick(HOME_REGION, await roll("1d20"));
    localeIdx = pick(HOME_LOCALE, await roll("1d20"));
    lines.push(["Homeland", homeland]);
    lines.push(["Home region", region]);
  } else lines.push(["Homeland", homeland]);
  lines.push(["Home locale type", LOCALE_TYPES[localeIdx]]);

  // Language of the starting locale.
  let languages = `${homeland.replace(/ enclave$/, "")} (native)`;
  if ( homeland !== startNation ) {
    const lr = await roll("1d100");
    const table = isNonhuman ? MASTERY_NONHUMAN : MASTERY_HUMAN;
    const idx = table.findIndex(max => lr <= max);
    languages += `; ${startNation}: ${MASTERY[idx]}`;
    lines.push(["Language of starting locale", `${MASTERY[idx]} (${lr})`]);
  }

  // Clan and lineage (Five Empires and clan nations).
  const cr = await roll("1d100");
  const clan = pick(CLAN_STATUS, cr);
  const lb = LINEAGE[localeIdx];
  const lr = await roll("1d100");
  let li = lb.findIndex(max => lr <= max);
  if ( li === -1 ) li = 4;
  const lineage = LINEAGE_LABELS[li];
  lines.push(["Clan status", `${clan} (${cr})`]);
  lines.push(["Lineage status", `${lineage} (${lr})`]);

  // Family wealth-group. Tlakotáni is read on the "Very high" row (the wealth table has no separate row for it).
  const clanRow = { "Very low": 0, "Low": 1, "Medium": 2, "High": 3, "Very high": 4 }[clan] ?? 4;
  const letter = CLAN_LINEAGE[clanRow][li];
  let group = WEALTH_GROUP[localeIdx][LETTERS.indexOf(letter)];
  if ( CAP_10.includes(homeland) ) group = Math.min(group, 10);
  if ( CAP_8.includes(homeland) ) group = Math.min(group, 8);
  const familyRoll = await roll("1d100");
  const family = Math.floor(familyRoll * FAMILY_MULT[group - 1]);
  const pct = await roll("1d10");
  const fortune = await roll("1d100");
  const personal = Math.floor(family * pct / 100) + fortune * PERSONAL_MULT(group);
  lines.push(["Family wealth-group", `${letter} → ${group}`]);
  lines.push(["Family wealth", `${family.toLocaleString()} Káitars`]);
  lines.push(["Personal wealth", `${personal.toLocaleString()} Káitars (${pct}% of family + ${fortune} × ${PERSONAL_MULT(group)})`]);

  const notFiveEmpire = !FIVE_EMPIRES.includes(homeland);
  const updates = {
    "system.background.homeland": [homeland, region].filter(Boolean).join(", "),
    "system.background.clan": clan,
    "system.background.lineage": lineage,
    "system.background.socialStatus": `${clan} clan, ${lineage.toLowerCase()} lineage`,
    "system.background.familyWealth": `${family.toLocaleString()} Káitars (group ${group})`,
    "system.background.languages": languages
  };
  return { lines, rolls, updates, personal, notFiveEmpire };
}

/** Dialog + chat card. */
export async function backgroundDialog(actor) {
  if ( actor.system.finished ) return ui.notifications.warn(game.i18n.localize("PT.Finish.Locked"));
  if ( actor.system.background?.locked ) return ui.notifications.warn(game.i18n.localize("PT.SG.Locked"));
  const opts = LOCALE_TYPES.map((l, i) => `<option value="${i}" ${i === 6 ? "selected" : ""}>${l}</option>`).join("");
  const content = `<div class="pt-dialog">
    <p>${loc("PT.SG.BackgroundHint")}</p>
    <div class="form-group"><label>${loc("PT.SG.StartNation")}</label><input type="text" name="startNation" value="Tsolyánu"></div>
    <div class="form-group"><label>${loc("PT.SG.StartLocale")}</label><select name="startLocale">${opts}</select></div>
    <div class="form-group"><label>${loc("PT.SG.AddWealth")}</label><input type="checkbox" name="addWealth" checked></div>
  </div>`;
  let data;
  try {
    data = await DialogV2.prompt({
      window: { title: loc("PT.SG.Background") },
      content,
      ok: { label: loc("PT.Roll"), callback: (e, b) => new foundry.applications.ux.FormDataExtended(b.form).object },
      rejectClose: false
    });
  } catch ( e ) { return null; }
  if ( !data ) return null;
  const res = await generateBackground(actor, { startLocale: Number(data.startLocale), startNation: data.startNation || "Tsolyánu" });
  res.updates["system.background.locked"] = true;
  if ( data.addWealth ) res.updates["system.wealth.kaitars"] = (actor.system.wealth.kaitars ?? 0) + res.personal;
  await actor.update(res.updates);
  let body = `<table class="pt-table">${res.lines.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join("")}</table>`;
  if ( actor.system.nation ) body += `<p><b>${game.i18n.format("PT.Nation.Applied", { nation: actor.system.nation.label })}</b> ${loc(actor.system.nation.note)}</p>`;
  else if ( res.notFiveEmpire ) body += `<p class="hint">${loc("PT.SG.SmallNationHint")}</p>`;
  body += `<p class="hint">${loc("PT.SG.SourceNote")}</p>`;
  let html = `<div class="pt-card"><header class="pt-card-title">${actor.name}: ${loc("PT.SG.Background")}</header><div class="pt-card-body">${body}</div></div>`;
  return ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: html, rolls: res.rolls, flags: { [SYSTEM_ID]: { background: true } } });
}
