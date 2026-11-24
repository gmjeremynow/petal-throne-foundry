/**
 * Pure rules tables and lookups for the 1975 Empire of the Petal Throne rules.
 * Section numbers refer to the 1975 rulebook. No Foundry globals are used here,
 * so this file can be tested with plain Node.
 */

export const ATTRIBUTES = ["str", "int", "con", "psy", "dex", "com"];
export const PROFESSIONS = ["warrior", "priest", "magicUser"];

/* -------------------------------------------- */
/*  Basic Talents (Sec. 411-416)                */
/* -------------------------------------------- */

/** Each band: [min, max, key, hit, dmg, extra] */
export const TALENT_BANDS = {
  str: [
    [1, 40, "weak", -1, 0],
    [41, 60, "average", 0, 0],
    [61, 80, "strong", 1, 0],
    [81, 95, "powerful", 1, 1],
    [96, 100, "superb", 2, 2]
  ],
  int: [
    [1, 20, "stupid", -1, -1, { noEyes: true, maxSpellGroup: 1 }],
    [21, 40, "dumb", 0, -1, { maxSpellGroup: 1 }],
    [41, 60, "average", 0, 0],
    [61, 80, "smart", 1, 0],
    [81, 95, "brilliant", 1, 1, { secretDoors: 40 }],
    [96, 100, "genius", 2, 2, { secretDoors: 60, traps: 40 }]
  ],
  con: [
    [1, 20, "weakling", -2, 0, { revive: 30, healFail: 40 }],
    [21, 40, "puny", -1, 0, { revive: 40, healFail: 20 }],
    [41, 60, "average", 0, 0, { revive: 50, healFail: 0 }],
    [61, 80, "healthy", 1, 0, { revive: 60, healFail: 0 }],
    [81, 95, "veryHealthy", 1, 1, { revive: 70, healFail: 0 }],
    [96, 100, "robust", 2, 1, { revive: 90, healFail: 0, healBonus: 1 }]
  ],
  psy: [
    [1, 20, "nonPsychic", 0, 0, { spellBonus: 0, maxSpellGroup: 0 }],
    [21, 40, "barelyPsychic", 0, 0, { spellBonus: 0, maxSpellGroup: 2 }],
    [41, 60, "averagePsychic", 0, 0, { spellBonus: 0 }],
    [61, 80, "somewhatPsychic", 0, 0, { spellBonus: 5 }],
    [81, 95, "quitePsychic", 0, 0, { spellBonus: 10 }],
    [96, 100, "highlyPsychic", 0, 0, { spellBonus: 15 }]
  ],
  dex: [
    [1, 20, "allThumbs", -1, -1, { strayChance: 20 }],
    [21, 40, "clumsy", -1, 0, { strayChance: 10 }],
    [41, 60, "average", 0, 0],
    [61, 80, "clever", 1, 0],
    [81, 95, "dexterous", 1, 1],
    [96, 100, "agile", 2, 1]
  ],
  com: [
    [1, 10, "hideous", 0, 0],
    [11, 20, "ugly", 0, 0],
    [21, 50, "average", 0, 0],
    [51, 70, "goodlooking", 0, 0],
    [71, 80, "veryGoodlooking", 0, 0],
    [81, 90, "handsome", 0, 0],
    [91, 95, "veryHandsome", 0, 0],
    [96, 100, "wildlyHandsome", 0, 0]
  ]
};

/**
 * Note on Constitution 41-60: the 1975 text lists "Average [no bonuses or penalties]"
 * without a revival figure. 50 percent is used here as the midpoint between 40 and 60
 * and is labeled as an interpretation on the sheet.
 */
export const CON_AVERAGE_REVIVE_IS_INTERPRETATION = true;

export function talentBand(attr, score) {
  const s = Math.max(1, Math.min(100, Number(score) || 0));
  const bands = TALENT_BANDS[attr];
  if ( !bands ) return null;
  const b = bands.find(([min, max]) => s >= min && s <= max) ?? bands[0];
  return { key: b[2], hit: b[3], dmg: b[4], ...(b[5] ?? {}) };
}

/** Total hit and damage bonuses from all talents (pluses cancel minuses, Sec. 418). */
export function talentBonuses(attrs) {
  let hit = 0, dmg = 0;
  for ( const a of ["str", "int", "con", "dex"] ) {
    const b = talentBand(a, attrs[a]);
    hit += b.hit; dmg += b.dmg;
  }
  return { hit, dmg };
}

/* -------------------------------------------- */
/*  Experience (Sec. 600-630)                   */
/* -------------------------------------------- */

export const XP_THRESHOLDS = {
  warrior: [0, 2001, 4001, 8001, 16001, 32001, 64001, 120001, 240001],
  priest: [0, 2001, 4001, 8001, 16001, 32001, 64001, 120001, 240001],
  magicUser: [0, 2001, 4001, 8001, 16001, 32001, 64001, 110001, 200001]
};
/** Counted points needed for each level beyond IX (Sec. 630). */
export const XP_PER_LEVEL_BEYOND_IX = 10000;

export function levelForXP(profession, xp) {
  const t = XP_THRESHOLDS[profession] ?? XP_THRESHOLDS.warrior;
  const pts = Math.max(0, Number(xp) || 0);
  let level = 1;
  for ( let i = 0; i < t.length; i++ ) if ( pts >= t[i] ) level = i + 1;
  if ( level === 9 ) level += Math.floor((pts - t[8]) / XP_PER_LEVEL_BEYOND_IX);
  return Math.max(1, level);
}

export function xpForLevel(profession, level) {
  const t = XP_THRESHOLDS[profession] ?? XP_THRESHOLDS.warrior;
  if ( level <= 9 ) return t[Math.max(0, level - 1)];
  return t[8] + (level - 9) * XP_PER_LEVEL_BEYOND_IX;
}

/** Sec. 620: share of earned points that count at the character's current level. */
export function xpReduction(level) {
  if ( level <= 3 ) return 1;
  if ( level <= 5 ) return 0.5;
  if ( level <= 7 ) return 0.25;
  if ( level <= 9 ) return 0.1;
  return 0.05;
}

/** Prime talent for the XP bonus (Sec. 610); add-on professions add to this. */
export const PRIME = { warrior: "str", priest: "int", magicUser: "psy" };
/** Rows moved up on the damage table (Sec. 730). */
export const DAMAGE_SHIFT = { warrior: 0, priest: 1, magicUser: 2 };
/** Saving throw column set (Sec. 2000). */
export const SAVES_AS = { warrior: "warrior", priest: "caster", magicUser: "caster" };
/** Sec. 721-style limits for add-on professions: key -> function(item) returning a warning key or null. */
export const RESTRICTIONS = {};
/** Custom XP bonus rules for add-on professions: key -> function(attrs) returning a percentage. */
export const XP_BONUS_FN = {};
/** Bonus spell roll adjustments for add-on professions: key -> function(resultKey, items) returning a result key or null. */
export const BONUS_ADJUST = {};

/**
 * Register an add-on profession's rules (used by add-on modules, e.g. a shaman).
 * def: { as, xp, titles, hitDice: { 1: [[d,p],...], 2: ..., 3: ... }, prime, damageShift, savesAs, divineBonus, restriction }
 * Anything left out is taken from the profession named in `as` (default "magicUser").
 */
export function registerProfessionRules(key, def = {}) {
  const as = def.as ?? "magicUser";
  XP_THRESHOLDS[key] = def.xp ?? XP_THRESHOLDS[as];
  LEVEL_TITLES[key] = def.titles ?? null;
  for ( const base of [1, 2, 3] ) HIT_DICE[base][key] = def.hitDice?.[base] ?? HIT_DICE[base][as];
  PRIME[key] = def.prime ?? PRIME[as];
  DAMAGE_SHIFT[key] = def.damageShift ?? DAMAGE_SHIFT[as];
  SAVES_AS[key] = def.savesAs ?? SAVES_AS[as];
  DIVINE_PROFESSION_BONUS[key] = def.divineBonus ?? DIVINE_PROFESSION_BONUS[as];
  if ( def.restriction ) RESTRICTIONS[key] = def.restriction;
  if ( def.xpBonus ) XP_BONUS_FN[key] = def.xpBonus;
  if ( def.bonusAdjust ) BONUS_ADJUST[key] = def.bonusAdjust;
  if ( !PROFESSIONS.includes(key) ) PROFESSIONS.push(key);
}

/** Sec. 610: percentage bonus to acquired points. */
export function xpBonusPercent(profession, attrs) {
  if ( XP_BONUS_FN[profession] ) {
    return (Number(XP_BONUS_FN[profession](attrs)) || 0) + ((Number(attrs.con) || 0) >= 96 ? 5 : 0);
  }
  let pct = 0;
  const prime = PRIME[profession] ?? "str";
  const v = Number(attrs[prime]) || 0;
  if ( v >= 96 ) pct += 10;
  else if ( v >= 81 ) pct += 5;
  if ( (Number(attrs.con) || 0) >= 96 ) pct += 5;
  return pct;
}

/** Sec. 600: 50 points per hit die of a slain foe, ignoring pluses; half (rounded up) if slain by an Eye. */
export function xpForKill(hitDice, byEye = false) {
  const hd = Math.max(0, Math.floor(Number(hitDice) || 0));
  return (byEye ? Math.ceil(hd / 2) : hd) * 50;
}

export const LEVEL_TITLES = {
  warrior: ["Changadésha (Soldier)", "Kuruthúni (Heavy Infantry)", "Kási (Captain)", "Molkár (Commander)", "Dritlán (Cohort Commander)", "Kérdu (General)", "Hehéllu (Count)", "Pachú (Lord)", "Mríngu (Great Noble)"],
  priest: ["Kengyél (Acolyte)", "Shárto (Priest)", "Su'úmel (Temple Priest)", "Njáshte (Temple Commandant)", "Qusúnchu (High Priest)", "Hrugásh (Prelate)", "Mriyán (Bishop)", "Tsémel (Cardinal)", "Tiritlén (Holy Adept)"],
  magicUser: ["Shátun (Magician)", "Nyélme (Illusionist)", "Rusalá (Seer)", "Bálash (Warlock)", "Durún (Enchanter)", "Chágun (Sorcerer)", "Tselinál (Wizard)", "Hnéshtu (Necromancer)", "Badrágu (Master Magician)"]
};

export function levelTitle(profession, level) {
  if ( profession in LEVEL_TITLES && !LEVEL_TITLES[profession] ) return null; // add-on profession without titles
  const list = LEVEL_TITLES[profession] ?? LEVEL_TITLES.warrior;
  return list[Math.min(level, list.length) - 1];
}

/* -------------------------------------------- */
/*  Hit Dice (Sec. 710)                         */
/* -------------------------------------------- */

/** [dice, plus] per level I..X (humans) or I..IX (2- and 3-dice beings). */
export const HIT_DICE = {
  1: {
    warrior: [[1,1],[2,0],[3,0],[4,1],[5,1],[6,2],[7,1],[8,2],[9,3],[10,4]],
    priest: [[1,0],[1,3],[2,1],[3,3],[4,1],[5,0],[6,0],[7,0],[8,1],[9,1]],
    magicUser: [[1,0],[1,2],[2,0],[3,0],[3,3],[4,0],[5,0],[6,1],[7,1],[8,1]]
  },
  2: {
    warrior: [[2,0],[3,0],[4,0],[5,1],[6,1],[7,1],[8,3],[9,3],[10,3]],
    priest: [[2,1],[2,3],[3,0],[4,0],[5,0],[6,0],[7,1],[8,0],[9,1]],
    magicUser: [[2,-1],[2,2],[3,-1],[3,3],[4,1],[5,0],[6,0],[7,0],[8,1]]
  },
  3: {
    warrior: [[3,0],[4,0],[5,1],[6,3],[7,3],[8,3],[9,3],[10,1],[11,1]],
    priest: [[3,-1],[3,2],[4,0],[5,0],[6,1],[7,0],[8,1],[9,0],[10,0]],
    magicUser: [[2,4],[3,1],[3,4],[4,1],[5,1],[6,0],[7,1],[8,0],[9,0]]
  }
};

/**
 * Hit dice for a level. Beyond the table, Sec. 710 adds the dice of a lower level
 * to the top row: a human warrior XIV = X + IV. The book's nonhuman example
 * (Ssú warrior XV = IX row 10+3 plus V row 6+1 = 16+4) also subtracts 10, so
 * the added row is always (level - 10). A nonhuman at exactly level X keeps the IX row.
 */
export function hitDiceFor(base, profession, level) {
  const table = (HIT_DICE[base] ?? HIT_DICE[1])[profession] ?? HIT_DICE[1].warrior;
  const top = table.length;
  const lvl = Math.max(1, Number(level) || 1);
  if ( lvl <= top ) {
    const [d, p] = table[lvl - 1];
    return { dice: d, plus: p };
  }
  const [d, p] = table[top - 1];
  const extraLevel = lvl - 10;
  if ( extraLevel < 1 ) return { dice: d, plus: p };
  const extra = hitDiceFor(base, profession, extraLevel);
  return { dice: d + extra.dice, plus: p + extra.plus };
}

export function formatHD({ dice, plus }) {
  if ( !plus ) return `${dice}`;
  return plus > 0 ? `${dice}+${plus}` : `${dice}${plus}`;
}

/**
 * Parse a hit dice string such as "4+1", "3-1", "1-1". Slashed values such as "6/10/16"
 * are small / medium / large specimens (Sec. 1126 (d)); the medium (middle) value is used.
 */
export function parseHD(str) {
  // "1 hp" / "1 hit point each": a fixed number of hit points, no hit dice.
  const fixed = String(str ?? "").trim().match(/^(\d+)\s*(hp|hit points?)\b/i);
  if ( fixed ) return { dice: 0, plus: 0, fixed: Number(fixed[1]) };
  const parts = String(str ?? "").trim().split("/");
  const s = parts[Math.floor(parts.length / 2)];
  const m = s.match(/^(\d+)\s*([+-]\s*\d+)?/);
  if ( !m ) return { dice: 0, plus: 0 };
  return { dice: Number(m[1]), plus: m[2] ? Number(m[2].replace(/\s/g, "")) : 0 };
}

/* -------------------------------------------- */
/*  Combat Tables (Sec. 720)                    */
/* -------------------------------------------- */

/** Table I: men attacking. Columns: levels 1-3, 4-6, 7-9, 10-12, 13+. Rows: AC 1..9. */
export const TABLE_I = [
  [19, 16, 13, 10, 7],
  [18, 15, 12, 9, 6],
  [17, 14, 11, 8, 5],
  [16, 13, 10, 7, 4],
  [15, 12, 9, 6, 3],
  [14, 11, 8, 5, 2],
  [13, 10, 7, 4, 2],
  [12, 9, 6, 3, 2],
  [11, 8, 5, 2, 1]
];

/** Table II: nonhumans, animals, etc. attacking. Columns by HD: <=1, 1+1, 2-3, 4-5, 6-7, 8-9, 10-11, 12+. */
export const TABLE_II = [
  [18, 17, 16, 15, 14, 13, 12, 11],
  [17, 16, 15, 14, 13, 12, 11, 10],
  [16, 15, 14, 13, 12, 11, 10, 9],
  [15, 14, 13, 12, 11, 10, 9, 8],
  [14, 13, 12, 11, 10, 9, 8, 7],
  [13, 12, 11, 10, 9, 8, 7, 6],
  [12, 11, 10, 9, 8, 7, 6, 5],
  [11, 10, 9, 8, 7, 6, 5, 4],
  [10, 9, 8, 7, 6, 5, 4, 3]
];

export function levelBandI(level) {
  if ( level <= 3 ) return 0;
  if ( level <= 6 ) return 1;
  if ( level <= 9 ) return 2;
  if ( level <= 12 ) return 3;
  return 4;
}

/** HD column used by Table II and the damage dice table. */
export function hdColumn({ dice, plus }) {
  if ( dice <= 0 || (dice === 1 && plus <= 0) ) return 0;
  if ( dice === 1 ) return 1;
  if ( dice <= 3 ) return 2;
  if ( dice <= 5 ) return 3;
  if ( dice <= 7 ) return 4;
  if ( dice <= 9 ) return 5;
  if ( dice <= 11 ) return 6;
  return 7;
}

/**
 * Score needed on d20 (before the attacker's bonuses) to hit.
 * @param {object} o
 * @param {"man"|"creature"} o.table   Which table the attacker uses
 * @param {number} o.level             Attacker level (men)
 * @param {{dice:number,plus:number}} o.hd  Attacker hit dice (creatures)
 * @param {number} o.ac                Defender armour class 1-9
 * @param {number} o.rangeShift        Missiles: -1 close, 0 medium, +1 long (Sec. 722)
 */
export function targetNumber({ table = "man", level = 1, hd = { dice: 1, plus: 0 }, ac = 9, rangeShift = 0 }) {
  const row = Math.max(1, Math.min(9, Math.round(Number(ac) || 9))) - 1;
  if ( table === "creature" ) {
    const col = Math.max(0, Math.min(7, hdColumn(hd) - rangeShift));
    return TABLE_II[row][col];
  }
  const col = Math.max(0, Math.min(4, levelBandI(level) - rangeShift));
  return TABLE_I[row][col];
}

/* -------------------------------------------- */
/*  Damage Dice (Sec. 730)                      */
/* -------------------------------------------- */

/** Rows: attacker level I..X. Columns: defender HD as hdColumn(). */
export const DAMAGE_TABLE = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [2, 1, 1, 1, 1, 1, 1, 1],
  [2, 2, 1, 1, 1, 1, 1, 1],
  [3, 2, 2, 1, 1, 1, 1, 1],
  [3, 3, 2, 2, 1, 1, 1, 1],
  [4, 3, 3, 2, 2, 1, 1, 1],
  [4, 4, 3, 3, 2, 2, 1, 1],
  [5, 4, 4, 3, 3, 2, 2, 1]
];

/**
 * Number of damage dice. Rows above X follow the table's own progression
 * ("Further advanced levels can be found using the same progression"):
 * every entry of the printed table equals max(1, floor((level - column) / 2)).
 * Priests move up one row, magic users with a dagger up two (Sec. 730).
 */
export function damageDiceCount({ level = 1, profession = "warrior", defenderHD = { dice: 1, plus: 0 } }) {
  let row = Math.max(1, Math.floor(Number(level) || 1));
  row -= DAMAGE_SHIFT[profession] ?? 0;
  row = Math.max(1, row);
  const col = hdColumn(defenderHD);
  if ( row <= 10 ) return DAMAGE_TABLE[row - 1][col];
  return Math.max(1, Math.floor((row - col) / 2));
}

/** Two-dice beings start at row II, three-dice beings at row III (Sec. 730). */
export function effectiveDamageLevel(level, hdBase) {
  return Number(level) + Math.max(0, (Number(hdBase) || 1) - 1);
}

/* -------------------------------------------- */
/*  Saving Throws (Sec. 2000)                   */
/* -------------------------------------------- */

export const SAVE_TYPES = ["poison", "spells", "paralysis", "eyes"];

/** [maxLevel, poison, spells, paralysis/hypnosis, eyes] */
export const SAVES = {
  warrior: [[3, 12, 16, 13, 15], [6, 10, 14, 12, 13], [9, 8, 11, 10, 11], [Infinity, 7, 10, 9, 10]],
  caster: [[4, 13, 15, 14, 14], [7, 11, 12, 13, 12], [10, 9, 9, 11, 10], [Infinity, 8, 7, 10, 7]]
};

export function saveTarget(profession, level, type) {
  const rows = (SAVES_AS[profession] ?? "warrior") === "warrior" ? SAVES.warrior : SAVES.caster;
  const row = rows.find(r => level <= r[0]);
  const idx = SAVE_TYPES.indexOf(type) + 1;
  return row[idx];
}

/* -------------------------------------------- */
/*  Spells (Sec. 434, 500)                      */
/* -------------------------------------------- */

/** Base percent chance a spell WORKS by level (average psychic ability). */
export function spellChance(level, psy) {
  const fail = [60, 50, 40, 30, 20, 15, 10, 5][Math.min(level, 9) - 1] ?? 0;
  const bonus = talentBand("psy", psy).spellBonus ?? 0;
  return Math.min(100, 100 - fail + bonus);
}

/** Bonus spell table (Sec. 500). Rows by kind, columns levels 2..10+ (null = not possible). */
export const BONUS_SPELL_TABLE = {
  g1: [80, 70, 60, 50, 40, 30, 20, 10, 5, 0],
  g2: [90, 80, 70, 60, 50, 40, 30, 20, 10, 5],
  g1g2: [null, 90, 80, 70, 60, 50, 40, 30, 20, 10],
  g3: [null, null, 90, 80, 70, 60, 50, 40, 30, 20],
  g2g3: [null, null, null, 90, 80, 70, 60, 50, 40, 30]
};
/** The printed columns are 2,3,4,5,6,7,8,9,10 and "up"; level 11+ uses the last column. */
export function bonusSpellScores(level) {
  if ( level < 2 ) return null;
  const idx = Math.min(level, 11) - 2;
  const out = {};
  for ( const [k, row] of Object.entries(BONUS_SPELL_TABLE) ) out[k] = row[idx];
  return out;
}

/* -------------------------------------------- */
/*  Morale (Sec. 740)                           */
/* -------------------------------------------- */

export const MORALE_PERCENTS = [30, 25, 20, 10, 5];
export const MORALE_TABLE = [
  [8, 7, 6, 5, 4, 3, 2, 1],
  [9, 8, 7, 6, 5, 4, 3, 2],
  [10, 9, 8, 7, 6, 5, 4, 3],
  [11, 10, 9, 8, 7, 6, 5, 4],
  [12, 11, 10, 9, 8, 7, 6, 5]
];
export function moraleTarget(percentRemaining, hd) {
  const idx = MORALE_PERCENTS.findIndex(p => percentRemaining >= p);
  const row = idx === -1 ? 4 : idx;
  return MORALE_TABLE[row][hdColumn(hd)];
}

/* -------------------------------------------- */
/*  Divine Intervention (Sec. 2110)             */
/* -------------------------------------------- */

/** [retributionMax, noEffectMax] by level band 2-3, 4-5, 6-7, 8-9, 10+. Above noEffectMax = intervention. */
export const DIVINE = {
  gods: [[70, 95], [50, 80], [30, 70], [20, 60], [10, 50]],
  cohorts: [[60, 85], [40, 70], [20, 60], [10, 50], [5, 40]]
};
export function divineBand(level) {
  if ( level <= 3 ) return 0;
  if ( level <= 5 ) return 1;
  if ( level <= 7 ) return 2;
  if ( level <= 9 ) return 3;
  return 4;
}
export function divineResult(source, level, total) {
  if ( level < 2 ) return "none";
  const [ret, none] = DIVINE[source][divineBand(level)];
  if ( total <= ret ) return "retribution";
  if ( total <= none ) return "noEffect";
  return "intervention";
}
export const DIVINE_PROFESSION_BONUS = { warrior: 0, priest: 5, magicUser: 3 };

/* -------------------------------------------- */
/*  Character generation (Sec. 420, 430)        */
/* -------------------------------------------- */

export function originalSkillsFor(roll) {
  if ( roll <= 35 ) return { g1: 1, g2: 0, g3: 0 };
  if ( roll <= 60 ) return { g1: 1, g2: 1, g3: 0 };
  if ( roll <= 80 ) return { g1: 1, g2: 1, g3: 1 };
  if ( roll <= 90 ) return { g1: 2, g2: 2, g3: 1 };
  if ( roll <= 95 ) return { g1: 3, g2: 2, g3: 2 };
  return { g1: 4, g2: 3, g3: 3 };
}

export function professionalSkillsFor(roll) {
  if ( roll <= 20 ) return { choose: 2, from: 3 };
  if ( roll <= 50 ) return { choose: 3, from: 4 };
  if ( roll <= 80 ) return { choose: 4, from: 5 };
  if ( roll <= 95 ) return { choose: 5, from: 6 };
  return { choose: 5, from: 7 };
}

/** Sec. 421: extra original skill on reaching a level (roll over 50 needed). */
export function originalSkillOnLevel(level) {
  return { 2: "Group I", 3: "Group II", 4: "Group III", 5: "Group I and Group II", 6: "Group II", 7: "Group III", 8: "any Group", 9: "any Group" }[level] ?? (level > 9 ? "any Group" : null);
}

/** Slot keys gained with the extra original skill at a level (same table as above). */
export function originalSlotsOnLevel(level) {
  const g = { 2: ["g1"], 3: ["g2"], 4: ["g3"], 5: ["g1", "g2"], 6: ["g2"], 7: ["g3"] }[level];
  if ( g ) return g;
  return level >= 8 ? ["any"] : [];
}

/** Bonus spell result -> spell group slots gained (Sec. 500). */
export const BONUS_SLOTS = { g1: ["g1"], g2: ["g2"], g1g2: ["g1", "g2"], g3: ["g3"], g2g3: ["g2", "g3"], g1g1: ["g1", "g1"], g2g2: ["g2", "g2"] };

/**
 * Slots used and left (Secs. 420, 430, 500).
 * Original skills fill their own group first; "any group" slots take the overflow.
 * Professional slots: the starting number plus one per level above 1st, shared by professional skills and spells.
 */
export function slotSummary(slots, level, held) {
  const orig = {};
  let overflow = 0;
  for ( const g of ["g1", "g2", "g3"] ) {
    const allowed = slots.original[g] ?? 0;
    const used = held.original[g] ?? 0;
    overflow += Math.max(0, used - allowed);
    orig[g] = { allowed, used: Math.min(used, allowed), left: Math.max(0, allowed - used) };
  }
  const anyAllowed = slots.original.any ?? 0;
  orig.any = { allowed: anyAllowed, used: Math.min(overflow, anyAllowed), left: Math.max(0, anyAllowed - overflow) };
  orig.over = Math.max(0, overflow - anyAllowed);
  const profAllowed = slots.profStart > 0 ? slots.profStart + Math.max(0, level - 1) : 0;
  const prof = { allowed: profAllowed, used: held.professional, left: profAllowed - held.professional, from: slots.profFrom };
  const bonus = {};
  for ( const g of ["g1", "g2", "g3"] ) {
    const allowed = slots.bonus[g] ?? 0;
    const used = held.bonus[g] ?? 0;
    bonus[g] = { allowed, used, left: allowed - used };
  }
  const set = slots.profStart > 0 || ["g1", "g2", "g3", "any"].some(g => slots.original[g]) || ["g1", "g2", "g3"].some(g => slots.bonus[g]);
  return { original: orig, professional: prof, bonus, set };
}

/** Sec. 920: loads (in Káitars) and the foot movement they allow, in inches per turn. */
export const LOAD_BANDS = [
  { key: "light", max: 13000, move: 12 },
  { key: "heavy", max: 17300, move: 9 },
  { key: "armoured", max: 26000, move: 6 }
];

/**
 * EPT Sec. 721 limits, as a warning key (null when allowed).
 * Magic users: daggers only (table ruling: steel or Chlén-hide), nothing heavier than leather armour
 * (AC 7, so no mail, plate, shield or armour pieces). Priests: no edged weapons, edged missiles included.
 * Helmets are not flagged: EPT's armour classes do not count them.
 */
export function professionRestriction(profession, item, items = []) {
  const s = item.system ?? {};
  if ( item.type === "weapon" ) {
    if ( profession === "magicUser" && !/dagger|knife/i.test(item.name ?? "") ) return "PT.Restrict.muWeapon";
    if ( profession === "priest" && s.edged ) return "PT.Restrict.priestEdged";
  }
  if ( item.type === "armour" && profession === "magicUser" && ["chain", "plate", "shield", "piece"].includes(s.armourType) ) {
    return "PT.Restrict.muArmour";
  }
  if ( RESTRICTIONS[profession] ) return RESTRICTIONS[profession](item, items) ?? null;
  return null;
}

/** Sec. 417: talent increase on a new level. */
export function talentIncrease(roll) {
  if ( roll === 100 ) return 10;
  if ( roll >= 81 ) return 5;
  return 0;
}
export const TALENT_INCREASE_ORDER = ["str", "int", "con", "psy", "dex", "com"];

/* -------------------------------------------- */
/*  Armour class (Sec. 720, Table I)            */
/* -------------------------------------------- */

/** armour: none|leather|chain|plate; shield: none|chlen|steel */
export function armourClassFor(armour, shield) {
  const hasShield = shield && shield !== "none";
  switch ( armour ) {
    case "plate": return !hasShield ? 3 : (shield === "steel" ? 1 : 2);
    case "chain": return hasShield ? 4 : 5;
    case "leather": return hasShield ? 6 : 7;
    default: return hasShield ? 8 : 9;
  }
}
