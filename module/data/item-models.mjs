const { SchemaField, NumberField, StringField, BooleanField, HTMLField } = foundry.data.fields;

const int = (initial = 0, opts = {}) => new NumberField({ required: true, nullable: false, integer: true, initial, ...opts });
const num = (initial = 0, opts = {}) => new NumberField({ required: true, nullable: false, initial, ...opts });
const str = (initial = "", opts = {}) => new StringField({ required: true, blank: true, initial, ...opts });

function common() {
  return {
    description: new HTMLField({ required: false, blank: true }),
    source: str(""),
    cost: num(0, { min: 0 }),
    weight: num(0, { min: 0 }),
    quantity: int(1, { min: 0 }),
    priceRange: str(""),
    sgEncumbrance: str("")
  };
}

export class WeaponData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...common(),
      category: str("melee"),
      material: str("chlen"),
      die: str("d6"),
      damagePlus: int(0),
      magic: int(0),
      minStr: int(0, { min: 0, max: 100 }),
      twoHanded: new BooleanField({ initial: false }),
      noShield: new BooleanField({ initial: false }),
      edged: new BooleanField({ initial: true }),
      extraBlow: new BooleanField({ initial: false }),
      everyOtherRound: new BooleanField({ initial: false }),
      range: new SchemaField({ close: int(0), medium: int(0), long: int(0) }),
      fixedDamage: str(""),
      lengthGroup: int(0, { min: 0, max: 10 }),
      equipped: new BooleanField({ initial: false })
    };
  }
}

export class ArmourData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...common(),
      armourType: str("leather"),
      material: str("chlen"),
      magic: int(0),
      equipped: new BooleanField({ initial: false })
    };
  }
}

export class SkillData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new HTMLField({ required: false, blank: true }),
      source: str(""),
      group: str("plebeian"),
      rank: int(0, { min: 0 }),
      usesChanceTable: new BooleanField({ initial: false }),
      language: str("")
    };
  }
}

export class SpellData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new HTMLField({ required: false, blank: true }),
      source: str(""),
      kind: str("bonus"),
      profession: str(""),
      group: int(1, { min: 0, max: 3 }),
      rank: int(0, { min: 0 }),
      uses: new SchemaField({ value: int(1, { min: 0 }), max: int(1, { min: 0 }), period: str("day") }),
      unlimited: new BooleanField({ initial: false }),
      range: str(""),
      duration: str(""),
      targeting: str("none"),
      save: str(""),
      damage: str(""),
      minLevel: int(0, { min: 0 }),
      waitAfter: str("")
    };
  }
}

export class EyeData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...common(),
      charges: new SchemaField({ value: int(0, { min: 0 }), max: int(100, { min: 0 }) }),
      dial: new BooleanField({ initial: false }),
      identified: new BooleanField({ initial: true }),
      inscription: str(""),
      range: str(""),
      duration: str(""),
      targeting: str("none"),
      save: str(""),
      damage: str(""),
      rarity: str("common")
    };
  }
}

export class EquipmentData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...common(),
      category: str("gear"),
      uses: new SchemaField({ value: int(0, { min: 0 }), max: int(0, { min: 0 }) }),
      equipped: new BooleanField({ initial: false })
    };
  }
}

/** Amulets, miscellaneous magical items, scrolls and books share this model. */
export class MagicItemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...common(),
      category: str("amulet"),
      uses: new SchemaField({ value: int(0, { min: 0 }), max: int(0, { min: 0 }) }),
      range: str(""),
      duration: str(""),
      save: str(""),
      alignmentRestriction: str(""),
      equipped: new BooleanField({ initial: false })
    };
  }
}
