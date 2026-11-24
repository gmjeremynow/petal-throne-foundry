export const SYSTEM_ID = "petal-throne";

export const PT = {};

PT.attributes = {
  str: "PT.Attr.str", int: "PT.Attr.int", con: "PT.Attr.con",
  psy: "PT.Attr.psy", dex: "PT.Attr.dex", com: "PT.Attr.com"
};

PT.professions = { warrior: "PT.Prof.warrior", priest: "PT.Prof.priest", magicUser: "PT.Prof.magicUser" };

PT.alignments = { good: "PT.Align.good", evil: "PT.Align.evil", neutral: "PT.Align.neutral" };

PT.sexes = { male: "PT.Sex.male", female: "PT.Sex.female", other: "PT.Sex.other" };

/** Playable species and their basic hit dice potential (Sec. 340, 710). */
PT.species = {
  human: { label: "Human", hdBase: 1, attitude: "" },
  pachiLei: { label: "Páchi Léi", hdBase: 1, attitude: "neutral" },
  peChoi: { label: "Pé Chói", hdBase: 1, attitude: "friendly" },
  swampFolk: { label: "Swamp Folk", hdBase: 1, attitude: "friendly" },
  pygmyFolk: { label: "Pygmy Folk", hdBase: 1, attitude: "friendly" },
  tinaliya: { label: "Tinalíya", hdBase: 1, attitude: "friendly" },
  hlaka: { label: "Hláka", hdBase: 2, attitude: "neutral" },
  shen: { label: "Shén", hdBase: 3, attitude: "neutral" },
  ahoggya: { label: "Ahoggyá", hdBase: 3, attitude: "neutral" },
  hlutrgu: { label: "Hlutrgú", hdBase: 2, attitude: "hostile" },
  hlyss: { label: "Hlýss", hdBase: 2, attitude: "hostile" },
  shunnedOnes: { label: "Shunned Ones", hdBase: 2, attitude: "hostile" },
  ssu: { label: "Ssú", hdBase: 2, attitude: "hostile" }
};

/**
 * Which species players may choose, by world setting:
 *  human: Humans only.  sg: the nonhumans S&G Vol 2 Sec. 2.223 allows as player characters.
 *  all: every species in EPT Sec. 340, including the four races hostile to Man (anti-human campaigns).
 * (S&G also allows the Urunén, who are not in the 1975 rules and so have no EPT hit dice.)
 */
PT.playableSpecies = {
  human: ["human"],
  sg: ["human", "ahoggya", "hlaka", "pachiLei", "peChoi", "pygmyFolk", "shen", "swampFolk", "tinaliya"],
  all: null
};

/**
 * Talent modifiers for human nations (S&G Vol 2 Sec. 2.222). Applied while a Human's homeland matches.
 * S&G gives them as changes to its own attribute rolls; here they are added to the EPT talent (1-100).
 */
PT.nationMods = {
  nluss: {
    label: "N'lüss", match: /n['’`]?\s*l[uü]ss(?!a)/i,
    mods: { str: 10, dex: -10, int: -10, psy: -5 },
    note: "PT.Nation.nlussNote"
  }
};

/**
 * Species talent modifiers (S&G Vol 2 Sec. 2.223, read from the page images). Only the attributes that
 * match EPT talents are used; S&G's height, body-build, Stamina, Reservoir and body damage are not.
 * `fixed` sets a talent outright (Swamp Folk have no psychic talent: EPT's Non-Psychic band, Sec. 414).
 */
PT.speciesMods = {
  ahoggya: { mods: { str: 20, dex: -20, int: -10, psy: -20 }, note: "PT.SpeciesNote.ahoggya" },
  hlaka: { mods: { str: -10, dex: 15 }, note: "PT.SpeciesNote.hlaka" },
  pachiLei: { mods: {}, note: "PT.SpeciesNote.pachiLei" },
  peChoi: { mods: { dex: 10, psy: 15, com: 5 }, note: "PT.SpeciesNote.peChoi" },
  pygmyFolk: { mods: { str: -10, dex: 20 }, note: "PT.SpeciesNote.pygmyFolk" },
  shen: { mods: { str: 20, dex: -20, int: -5, psy: -10 }, note: "PT.SpeciesNote.shen" },
  swampFolk: { mods: {}, fixed: { psy: 1 }, note: "PT.SpeciesNote.swampFolk" },
  tinaliya: { mods: { str: -20, dex: 10, int: 5, psy: 15 }, note: "PT.SpeciesNote.tinaliya" },
  hlyss: { mods: { dex: 5, psy: 10 }, note: "PT.SpeciesNote.hlyss" },
  hlutrgu: { mods: { dex: 5 }, note: "PT.SpeciesNote.hlutrgu" },
  shunnedOnes: { mods: { psy: 20 }, note: "PT.SpeciesNote.shunnedOnes" },
  ssu: { mods: { str: 5, psy: 30 }, note: "PT.SpeciesNote.ssu" }
};

/** The Five Good Gods, the Five Evil Gods, and their Cohorts (Sec. 2100). */
PT.deities = {
  hnalla: { label: "Hnálla", alignment: "good", kind: "god" },
  karakan: { label: "Karakán", alignment: "good", kind: "god" },
  thumis: { label: "Thúmis", alignment: "good", kind: "god" },
  avanthe: { label: "Avánthe", alignment: "good", kind: "god" },
  belkhanu: { label: "Belkhánu", alignment: "good", kind: "god" },
  dra: { label: "Drá (Cohort of Hnálla)", alignment: "good", kind: "cohort" },
  chegarra: { label: "Chegárra (Cohort of Karakán)", alignment: "good", kind: "cohort" },
  ketengku: { label: "Keténgku (Cohort of Thúmis)", alignment: "good", kind: "cohort" },
  dilinala: { label: "Dilinála (Cohort of Avánthe)", alignment: "good", kind: "cohort" },
  qon: { label: "Qón (Cohort of Belkhánu)", alignment: "good", kind: "cohort" },
  hruu: { label: "Hrü'ü", alignment: "evil", kind: "god" },
  vimuhla: { label: "Vimúhla", alignment: "evil", kind: "god" },
  ksarul: { label: "Ksárul", alignment: "evil", kind: "god" },
  sarku: { label: "Sárku", alignment: "evil", kind: "god" },
  dlamelish: { label: "Dlamélish", alignment: "evil", kind: "god" },
  wuru: { label: "Wurú (Cohort of Hrü'ü)", alignment: "evil", kind: "cohort" },
  chiteng: { label: "Chiténg (Cohort of Vimúhla)", alignment: "evil", kind: "cohort" },
  grugdanu: { label: "Grugánu (Cohort of Ksárul)", alignment: "evil", kind: "cohort" },
  durritlamish: { label: "Durritlámish (Cohort of Sárku)", alignment: "evil", kind: "cohort" },
  hrihayal: { label: "Hriháyal (Cohort of Dlamélish)", alignment: "evil", kind: "cohort" }
};

PT.skillGroups = {
  plebeian: "PT.SkillGroup.plebeian",
  skilled: "PT.SkillGroup.skilled",
  noble: "PT.SkillGroup.noble",
  warrior: "PT.SkillGroup.warrior",
  priest: "PT.SkillGroup.priest",
  magicUser: "PT.SkillGroup.magicUser",
  language: "PT.SkillGroup.language",
  other: "PT.SkillGroup.other"
};

PT.spellKinds = { professional: "PT.SpellKind.professional", bonus: "PT.SpellKind.bonus" };
PT.spellGroups = { 0: "—", 1: "PT.SpellGroup.1", 2: "PT.SpellGroup.2", 3: "PT.SpellGroup.3" };
PT.spellTargeting = { none: "PT.Targeting.none", aimed: "PT.Targeting.aimed", area: "PT.Targeting.area" };

PT.saveTypes = { poison: "PT.Save.poison", spells: "PT.Save.spells", paralysis: "PT.Save.paralysis", eyes: "PT.Save.eyes" };

PT.weaponCategories = { melee: "PT.WeaponCat.melee", missile: "PT.WeaponCat.missile", thrown: "PT.WeaponCat.thrown", siege: "PT.WeaponCat.siege" };
PT.weaponDice = { d4: "1d4", d6: "1d6" };
PT.materials = { chlen: "PT.Material.chlen", steel: "PT.Material.steel", other: "PT.Material.other" };
PT.armourTypes = { none: "PT.Armour.none", leather: "PT.Armour.leather", chain: "PT.Armour.chain", plate: "PT.Armour.plate", shield: "PT.Armour.shield", helmet: "PT.Armour.helmet", piece: "PT.Armour.piece" };

PT.creatureTypes = {
  N: "PT.CreatureType.N", A: "PT.CreatureType.A", U: "PT.CreatureType.U",
  F: "PT.CreatureType.F", W: "PT.CreatureType.W", M: "PT.CreatureType.M"
};

PT.rangeBands = { close: "PT.Range.close", medium: "PT.Range.medium", long: "PT.Range.long" };

/** Swords & Glory background options. */
PT.socialStatus = {
  low: "PT.Social.low", middle: "PT.Social.middle", high: "PT.Social.high", veryHigh: "PT.Social.veryHigh", imperial: "PT.Social.imperial"
};

export default PT;
