import * as R from "../rules.mjs";
import PT from "../config.mjs";

const { SchemaField, NumberField, StringField, BooleanField, HTMLField, ArrayField } = foundry.data.fields;

const int = (initial = 0, opts = {}) => new NumberField({ required: true, nullable: false, integer: true, initial, ...opts });
const str = (initial = "", opts = {}) => new StringField({ required: true, blank: true, initial, ...opts });

function attributeField() {
  return new SchemaField({ value: int(50, { min: 0, max: 100 }) });
}

/* -------------------------------------------- */
/*  Character / NPC                             */
/* -------------------------------------------- */

export class CharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      attributes: new SchemaField(Object.fromEntries(R.ATTRIBUTES.map(a => [a, attributeField()]))),
      profession: str("warrior", { choices: () => Object.keys(PT.professions), blank: false }),
      species: str("human", { blank: false }),
      alignment: str("good", { choices: Object.keys(PT.alignments), blank: false }),
      deity: str(""),
      sex: str("male"),
      aridani: new BooleanField({ initial: false }),
      xp: int(0, { min: 0 }),
      levelOverride: int(0, { min: 0 }),
      hp: new SchemaField({ value: int(1), max: int(1, { min: 0 }) }),
      armour: new SchemaField({
        auto: new BooleanField({ initial: true }),
        ac: int(9, { min: 1, max: 9 }),
        magic: int(0)
      }),
      bonuses: new SchemaField({ hit: int(0), dmg: int(0), spell: int(0), save: int(0) }),
      wealth: new SchemaField({ kaitars: int(0), qirgal: int(0), hlash: int(0), carried: new BooleanField({ initial: true }) }),
      background: new SchemaField({
        homeland: str(""),
        clan: str(""),
        lineage: str(""),
        socialStatus: str(""),
        familyWealth: str(""),
        education: str(""),
        age: str(""),
        height: str(""),
        build: str(""),
        languages: str(""),
        locked: new BooleanField({ initial: false })
      }),
      divine: new SchemaField({ lastUsed: str(""), barred: new BooleanField({ initial: false }) }),
      revivals: int(0, { min: 0 }),
      finished: new BooleanField({ initial: false }),
      slots: new SchemaField({
        original: new SchemaField({ g1: int(0, { min: 0 }), g2: int(0, { min: 0 }), g3: int(0, { min: 0 }), any: int(0, { min: 0 }) }),
        profStart: int(0, { min: 0 }),
        profFrom: int(0, { min: 0 }),
        bonus: new SchemaField({ g1: int(0, { min: 0 }), g2: int(0, { min: 0 }), g3: int(0, { min: 0 }) })
      }),
      biography: new HTMLField({ required: false, blank: true }),
      notes: new HTMLField({ required: false, blank: true })
    };
  }

  /** Values computed every time the actor is prepared. */
  prepareDerivedData() {
    // Nation modifiers (S&G Sec. 2.222): follow the homeland, so rerolling the background or editing it updates them.
    this.nation = null;
    this.speciesInfo = null;
    const mods = {};
    let fixed = {};
    const spMods = PT.speciesMods[this.species];
    if ( spMods ) {
      this.speciesInfo = { label: PT.species[this.species]?.label ?? this.species, note: spMods.note, mods: spMods.mods, fixed: spMods.fixed ?? {} };
      Object.assign(mods, spMods.mods);
      fixed = spMods.fixed ?? {};
    }
    if ( (this.species ?? "human") === "human" ) {
      for ( const [key, n] of Object.entries(PT.nationMods) ) {
        if ( n.match.test(this.background?.homeland ?? "") ) {
          this.nation = { key, label: n.label, note: n.note, mods: n.mods };
          Object.assign(mods, n.mods);
          break;
        }
      }
    }
    const attrs = {};
    for ( const a of R.ATTRIBUTES ) {
      const base = this.attributes[a].value;
      if ( base > 0 && fixed[a] !== undefined ) {
        this.attributes[a].fixed = true;
        this.attributes[a].mod = fixed[a] - base;
        this.attributes[a].total = fixed[a];
        attrs[a] = fixed[a];
        continue;
      }
      this.attributes[a].fixed = false;
      const mod = base > 0 ? (mods[a] ?? 0) : 0; // an unrolled talent (0) stays 0
      this.attributes[a].mod = mod;
      this.attributes[a].total = Math.max(1, Math.min(100, base + mod)) * (base > 0 ? 1 : 0);
      attrs[a] = this.attributes[a].total;
    }
    for ( const a of R.ATTRIBUTES ) {
      const band = R.talentBand(a, attrs[a]);
      this.attributes[a].band = band;
      this.attributes[a].label = `PT.Band.${a}.${band.key}`;
    }
    const tb = R.talentBonuses(attrs);
    this.talent = tb;
    this.hitBonus = tb.hit + this.bonuses.hit;
    this.dmgBonus = tb.dmg + this.bonuses.dmg;

    const sp = PT.species[this.species] ?? PT.species.human;
    this.hdBase = sp.hdBase;

    this.computedLevel = R.levelForXP(this.profession, this.xp);
    this.level = this.levelOverride > 0 ? this.levelOverride : this.computedLevel;
    // Add-ons may supply titles (e.g. by homeland): CONFIG.PT.levelTitleOverride(system) -> title or null.
    const titleHook = typeof PT.levelTitleOverride === "function" ? PT.levelTitleOverride(this) : null;
    this.levelTitle = titleHook ?? R.levelTitle(this.profession, this.level)
      ?? `${globalThis.game?.i18n?.localize?.(PT.professions[this.profession] ?? this.profession) ?? PT.professions[this.profession] ?? this.profession} ${this.level}`;
    this.nextLevelXP = R.xpForLevel(this.profession, this.computedLevel + 1);

    const hd = R.hitDiceFor(this.hdBase, this.profession, this.level);
    this.hitDice = hd;
    this.hitDiceLabel = R.formatHD(hd);
    /** Level used on the damage dice table (2- and 3-dice beings start lower down, Sec. 730). */
    this.damageLevel = R.effectiveDamageLevel(this.level, this.hdBase);

    this.xpBonus = R.xpBonusPercent(this.profession, attrs);
    this.xpShare = R.xpReduction(this.level);

    const psyBand = this.attributes.psy.band;
    const intBand = this.attributes.int.band;
    this.spellChance = Math.min(100, R.spellChance(this.level, attrs.psy) + this.bonuses.spell);
    const limits = [psyBand.maxSpellGroup, intBand.maxSpellGroup].filter(v => v !== undefined);
    this.maxSpellGroup = limits.length ? Math.min(...limits) : 3;
    this.canUseEyes = !intBand.noEyes;

    this.saves = Object.fromEntries(R.SAVE_TYPES.map(t => [t, R.saveTarget(this.profession, this.level, t) - this.bonuses.save]));

    this.reviveChance = this.attributes.con.band.revive;
    this.healFail = this.attributes.con.band.healFail;
    this.actionChance = Math.round((attrs.str + attrs.int + attrs.dex) / 3);
    this.prepareArmour(this.parent?.items ?? []);
    this.prepareSlots(this.parent?.items ?? []);
    this.prepareLoad(this.parent?.items ?? []);
  }

  /**
   * Load and movement (Sec. 920). Weights are in Káitars; each coin weighs 1.
   * Up to 13,000 = light foot 12", up to 17,300 = heavy foot 9", up to 26,000 = armoured foot 6".
   * Nonhumans carry in proportion to their hit dice (two-dice beings double, three-dice triple).
   */
  prepareLoad(items) {
    const list = items.contents ?? [...items];
    const gear = Math.round(list.reduce((t, i) => t + ((i.system.weight ?? 0) * (i.system.quantity ?? 1)), 0));
    const w = this.wealth;
    const coins = w.carried === false ? 0 : (w.kaitars ?? 0) + (w.hlash ?? 0) + (w.qirgal ?? 0);
    const total = gear + coins;
    const scale = Math.max(1, this.hdBase ?? 1);
    const bands = R.LOAD_BANDS.map(b => ({ ...b, max: b.max * scale }));
    const band = bands.find(b => total <= b.max) ?? null;
    this.load = { gear, coins, total, scale, band: band?.key ?? "over", move: band?.move ?? null,
      next: band ? band.max : bands[bands.length - 1].max, bands };
  }

  /** Skill and spell slots: what the rolls allow, what is held, what is left. */
  prepareSlots(items) {
    const list = items.contents ?? [...items];
    const grpKey = { plebeian: "g1", skilled: "g2", noble: "g3" };
    const held = { original: { g1: 0, g2: 0, g3: 0 }, professional: 0, bonus: { g1: 0, g2: 0, g3: 0 } };
    for ( const i of list ) {
      if ( i.type === "skill" ) {
        if ( grpKey[i.system.group] ) held.original[grpKey[i.system.group]]++;
        else if ( i.system.group === this.profession ) held.professional++;
      } else if ( i.type === "spell" ) {
        if ( i.system.kind === "professional" ) held.professional++;
        else if ( [1, 2, 3].includes(i.system.group) ) held.bonus[`g${i.system.group}`]++;
      }
    }
    this.slotInfo = R.slotSummary(this.slots, this.level, held);
  }

  /** Called by the actor once embedded items are available. */
  prepareArmour(items) {
    if ( !this.armour.auto ) {
      this.ac = this.armour.ac;
      this.acMagic = this.armour.magic;
      return;
    }
    let body = "none", shield = "none", magic = 0;
    for ( const i of items ) {
      if ( i.type !== "armour" || !i.system.equipped ) continue;
      const t = i.system.armourType;
      if ( ["leather", "chain", "plate"].includes(t) ) {
        const rank = { leather: 1, chain: 2, plate: 3 };
        if ( (rank[t] ?? 0) > (rank[body] ?? 0) ) body = t;
      }
      if ( t === "shield" ) shield = i.system.material === "steel" ? "steel" : "chlen";
      magic += i.system.magic ?? 0;
    }
    this.ac = R.armourClassFor(body, shield);
    this.acMagic = magic + this.armour.magic;
  }
}

/* -------------------------------------------- */
/*  Creature                                    */
/* -------------------------------------------- */

export class CreatureData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      creatureType: str("A"),
      hitDice: str("1"),
      hp: new SchemaField({ value: int(4), max: int(4, { min: 0 }) }),
      ac: int(6, { min: 1, max: 9 }),
      acMagic: int(0),
      move: str("12"),
      numberAppearing: str("1-6"),
      attitude: str(""),
      intelligent: new BooleanField({ initial: false }),
      noMorale: new BooleanField({ initial: false }),
      attackTable: str("creature", { choices: ["creature", "man"], blank: false }),
      attacks: int(1, { min: 0 }),
      damageDice: str(""),
      hitBonus: int(0),
      dmgBonus: int(0),
      saveAs: str("warrior", { choices: ["warrior", "caster"], blank: false }),
      /** Size table "label:chance:HD|..." for creatures that come in sizes (Sec. 1126 (d)). */
      sizes: str(""),
      treasure: new SchemaField({ lair: str(""), carried: str(""), special: str("") }),
      special: str(""),
      source: str(""),
      casterLevel: int(0, { min: 0 }),
      biography: new HTMLField({ required: false, blank: true }),
      notes: new HTMLField({ required: false, blank: true })
    };
  }

  prepareDerivedData() {
    const hd = R.parseHD(this.hitDice);
    this.hd = hd;
    this.level = Math.max(1, hd.dice);
    this.damageLevel = this.level;
    this.hitDiceLabel = this.hitDice;
    this.xpValue = R.xpForKill(hd.dice);
    const prof = this.saveAs === "warrior" ? "warrior" : "priest";
    this.saves = Object.fromEntries(R.SAVE_TYPES.map(t => [t, R.saveTarget(prof, this.level, t)]));
    // Spells: EPT gives creature casters a magic-user level but no Psychic Ability score,
    // so the chance uses that level (or the hit dice) with average Psychic Ability (table ruling).
    this.spellLevel = this.casterLevel > 0 ? this.casterLevel : this.level;
    this.spellChance = R.spellChance(this.spellLevel, 50);
    this.maxSpellGroup = 3;
  }
}
