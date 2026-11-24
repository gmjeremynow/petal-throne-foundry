import * as Treasure from "./treasure.mjs";
import PT, { SYSTEM_ID } from "./config.mjs";
import * as R from "./rules.mjs";
import * as Rolls from "./rolls.mjs";
import { backgroundDialog } from "./sg-background.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2, ItemSheetV2 } = foundry.applications.sheets;
const TE = () => foundry.applications.ux.TextEditor.implementation;

const loc = k => game.i18n.localize(k);
const choices = obj => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, typeof v === "string" ? loc(v) : v.label]));

/**
 * Add a dropped Item (from a compendium, the Items tab or another sheet) to an actor.
 * Every outcome is reported, so a drop never fails silently.
 */
export async function addDroppedItem(actor, data) {
  try {
    if ( actor.pack ) return ui.notifications.warn(game.i18n.format("PT.Warn.DropCompendium", { actor: actor.name }));
    if ( !actor.isOwner ) return ui.notifications.warn(game.i18n.format("PT.Warn.DropNoPermission", { actor: actor.name }));
    const item = data.uuid ? await fromUuid(data.uuid) : (data.data ? new Item.implementation(data.data) : null);
    if ( !item ) return ui.notifications.warn(game.i18n.localize("PT.Warn.DropNotFound"));
    if ( item.parent?.uuid === actor.uuid ) return null; // dropped back onto its own sheet
    const src = item.toObject();
    delete src._id;
    const [created] = await actor.createEmbeddedDocuments("Item", [src]);
    if ( created ) ui.notifications.info(game.i18n.format("PT.Info.ItemAdded", { item: created.name, actor: actor.name }));
    return created;
  } catch ( err ) {
    console.error(`${SYSTEM_ID} | Could not add the dropped item to ${actor?.name}`, err, data);
    ui.notifications.error(game.i18n.format("PT.Warn.DropFailed", { actor: actor?.name ?? "" }));
    return null;
  }
}

/* -------------------------------------------- */
/*  Shared actor sheet behaviour                */
/* -------------------------------------------- */

class PTActorSheetBase extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["petal-throne", "sheet", "actor"],
    position: { width: 760, height: 780 },
    window: { resizable: true },
    form: { submitOnChange: true },
    actions: {
      itemCreate: PTActorSheetBase.#onItemCreate,
      itemEdit: PTActorSheetBase.#onItemEdit,
      itemDelete: PTActorSheetBase.#onItemDelete,
      itemUse: PTActorSheetBase.#onItemUse,
      itemToggle: PTActorSheetBase.#onItemToggle,
      itemChat: PTActorSheetBase.#onItemChat,
      usesReset: PTActorSheetBase.#onUsesReset,
      save: PTActorSheetBase.#onSave,
      morale: PTActorSheetBase.#onMorale,
      editImage: PTActorSheetBase.#onEditImage,
      toggleText: PTActorSheetBase.#onToggleText
    }
  };

  tabGroups = { primary: "main" };

  /** Rich-text fields currently open for editing. */
  _editingText = {};

  /** Group the actor's items for display. */
  _prepareItems() {
    const items = this.actor.items.contents.sort((a, b) => (a.sort - b.sort) || a.name.localeCompare(b.name));
    const by = t => items.filter(i => i.type === t);
    const skills = by("skill");
    const skillGroups = Object.keys(PT.skillGroups)
      .map(g => ({ key: g, label: loc(PT.skillGroups[g]), items: skills.filter(s => s.system.group === g).sort((a, b) => a.system.rank - b.system.rank) }))
      .filter(g => g.items.length);
    const spells = by("spell");
    const spellGroups = [
      { key: "professional", label: loc("PT.SpellKind.professional"), items: spells.filter(s => s.system.kind === "professional") },
      ...[1, 2, 3].map(n => ({ key: `g${n}`, label: `${loc("PT.SpellKind.bonus")}: ${loc(`PT.SpellGroup.${n}`)}`, items: spells.filter(s => s.system.kind !== "professional" && s.system.group === n) }))
    ].filter(g => g.items.length);
    const weight = items.reduce((t, i) => t + ((i.system.weight ?? 0) * (i.system.quantity ?? 1)), 0);
    return {
      weapons: by("weapon"), armour: by("armour"), skillGroups, spellGroups, spells,
      eyes: by("eye"), magicItems: by("magicItem"), equipment: by("equipment"),
      encumbrance: Math.round(weight)
    };
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.actor;
    Object.assign(context, {
      actor, system: actor.system, source: actor.system._source ?? actor._source.system,
      config: PT, editable: this.isEditable, owner: actor.isOwner,
      tab: this.tabGroups.primary,
      ...this._prepareItems()
    });
    context.enrichedBio = await TE().enrichHTML(actor.system.biography ?? "", { relativeTo: actor, secrets: actor.isOwner });
    context.enrichedNotes = await TE().enrichHTML(actor.system.notes ?? "", { relativeTo: actor, secrets: actor.isOwner });
    context.editingText = this._editingText;
    context.saves = Object.entries(PT.saveTypes).map(([k, v]) => ({ key: k, label: loc(v), target: actor.system.saves?.[k] }));
    return context;
  }

  _onRender(context, options) {
    super._onRender?.(context, options);
    // Item rows can be dragged to the hotbar or to other sheets.
    this.element.querySelectorAll("[data-item-id][draggable]").forEach(el => {
      el.addEventListener("dragstart", ev => {
        const item = this.actor.items.get(el.dataset.itemId);
        if ( item ) ev.dataTransfer.setData("text/plain", JSON.stringify(item.toDragData()));
      });
    });
    // Accept items dropped anywhere on the sheet. Bound once; _onDrop ignores an event it has already handled,
    // so a core drop handler and this one never add the item twice.
    if ( !this._ptDropBound ) {
      this._ptDropBound = true;
      this.element.addEventListener("dragover", ev => { ev.preventDefault(); this.element.classList.add("pt-drop-over"); });
      this.element.addEventListener("dragleave", ev => { if ( !this.element.contains(ev.relatedTarget) ) this.element.classList.remove("pt-drop-over"); });
      this.element.addEventListener("drop", ev => { this.element.classList.remove("pt-drop-over"); this._onDrop(ev); });
    }
    // Restore active tab.
    this._activateTab(this.tabGroups.primary);
    this.element.querySelectorAll("nav.sheet-tabs [data-tab]").forEach(a => {
      a.addEventListener("click", ev => {
        ev.preventDefault();
        this.tabGroups.primary = a.dataset.tab;
        this._activateTab(a.dataset.tab);
      });
    });
  }

  _activateTab(tab) {
    this.element.querySelectorAll("nav.sheet-tabs [data-tab]").forEach(a => a.classList.toggle("active", a.dataset.tab === tab));
    this.element.querySelectorAll("section.tab[data-tab]").forEach(s => s.classList.toggle("active", s.dataset.tab === tab));
  }

  async _onDrop(event) {
    if ( event._ptHandled ) return;
    event._ptHandled = true;
    event.preventDefault();
    const data = TE().getDragEventData(event);
    if ( data?.type !== "Item" ) return typeof super._onDrop === "function" ? super._onDrop(event) : undefined;
    return addDroppedItem(this.actor, data);
  }

  static async #onItemCreate(event, target) {
    const type = target.dataset.type;
    const data = { name: game.i18n.format("PT.NewItem", { type: loc(`TYPES.Item.${type}`) }), type, system: {} };
    if ( target.dataset.group ) data.system.group = target.dataset.group;
    if ( target.dataset.kind ) data.system.kind = target.dataset.kind;
    const [created] = await this.actor.createEmbeddedDocuments("Item", [data]);
    if ( created ) { created.sheet._unlocked = true; created.sheet.render(true); }
  }
  static #getItem(target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    return this.actor.items.get(id);
  }
  static #onItemEdit(event, target) { PTActorSheetBase.#getItem.call(this, target)?.sheet.render(true); }
  static async #onItemDelete(event, target) {
    const item = PTActorSheetBase.#getItem.call(this, target);
    if ( !item ) return;
    const ok = await foundry.applications.api.DialogV2.confirm({ window: { title: loc("PT.Delete") }, content: `<p>${game.i18n.format("PT.DeleteConfirm", { name: item.name })}</p>` });
    if ( ok ) await item.delete();
  }
  static #onItemUse(event, target) { PTActorSheetBase.#getItem.call(this, target)?.use(); }
  static #onItemChat(event, target) { PTActorSheetBase.#getItem.call(this, target)?.toChat(); }
  static #onItemToggle(event, target) {
    const item = PTActorSheetBase.#getItem.call(this, target);
    if ( !item ) return;
    if ( !item.system.equipped && this.actor.type !== "creature" ) {
      const key = R.professionRestriction(this.actor.system.profession, item, this.actor.items.contents);
      if ( key ) ui.notifications.warn(`${item.name}: ${loc(key)}`);
    }
    item.update({ "system.equipped": !item.system.equipped });
  }
  static async #onUsesReset(event, target) {
    const item = PTActorSheetBase.#getItem.call(this, target);
    if ( !item ) return;
    if ( item.type === "spell" ) return item.update({ "system.uses.value": item.system.uses.max });
  }
  static #onToggleText(event, target) {
    const f = target.dataset.field;
    this._editingText[f] = !this._editingText[f];
    this.render();
  }
  static #onSave(event, target) { Rolls.rollSave(this.actor, target.dataset.save); }
  static #onMorale() { Rolls.rollMorale(this.actor); }
  static async #onEditImage(event, target) {
    if ( !this.isEditable ) return;
    const FP = foundry.applications.apps.FilePicker.implementation;
    const fp = new FP({ type: "image", current: this.actor.img, callback: path => this.actor.update({ img: path }) });
    return fp.browse();
  }
}

/* -------------------------------------------- */
/*  Character sheet                             */
/* -------------------------------------------- */

export class PTCharacterSheet extends PTActorSheetBase {
  static DEFAULT_OPTIONS = {
    classes: ["character"],
    actions: {
      actionCheck: PTCharacterSheet.#onActionCheck,
      talentCheck: PTCharacterSheet.#onTalentCheck,
      divine: PTCharacterSheet.#onDivine,
      revive: PTCharacterSheet.#onRevive,
      awardXP: PTCharacterSheet.#onAwardXP,
      levelUp: PTCharacterSheet.#onLevelUp,
      rollCharacter: PTCharacterSheet.#onRollCharacter,
      regainSpells: PTCharacterSheet.#onRegainSpells,
      rest: PTCharacterSheet.#onRest,
      sgBackground: PTCharacterSheet.#onBackground,
      toggleBackgroundLock: PTCharacterSheet.#onToggleBackgroundLock,
      finishCharacter: PTCharacterSheet.#onFinish,
      editSlots: PTCharacterSheet.#onEditSlots,
      reopenCharacter: PTCharacterSheet.#onReopen
    }
  };

  static PARTS = {
    sheet: { template: `systems/${SYSTEM_ID}/templates/actor/character-sheet.hbs`, scrollable: [".sheet-body"] }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const s = this.actor.system;
    context.attributeRows = R.ATTRIBUTES.map(a => ({
      key: a, label: loc(PT.attributes[a]), value: s.attributes[a].value,
      mod: s.attributes[a].mod, total: s.attributes[a].total,
      fixed: s.attributes[a].fixed,
      modTip: s.attributes[a].fixed ? game.i18n.format("PT.Species.FixedTip", { species: s.speciesInfo?.label ?? "", total: s.attributes[a].total })
        : s.attributes[a].mod ? game.i18n.format("PT.Nation.ModTip", { nation: [s.speciesInfo?.label, s.nation?.label].filter(Boolean).join(" / "), mod: (s.attributes[a].mod > 0 ? "+" : "") + s.attributes[a].mod, total: s.attributes[a].total }) : "",
      band: loc(s.attributes[a].label), hit: s.attributes[a].band.hit, dmg: s.attributes[a].band.dmg,
      notes: this.#bandNotes(a, s.attributes[a].band)
    }));
    context.professionChoices = choices(PT.professions);
    context.alignmentChoices = choices(PT.alignments);
    context.sexChoices = choices(PT.sexes);
    const allowed = PT.playableSpecies[game.settings.get(SYSTEM_ID, "playableSpecies")] ?? null;
    context.speciesChoices = Object.fromEntries(Object.entries(choices(PT.species))
      .filter(([k]) => !allowed || allowed.includes(k) || k === s.species)); // keep the current choice visible
    context.nation = s.nation ? { label: s.nation.label, note: loc(s.nation.note) } : null;
    context.speciesNote = s.speciesInfo ? { label: s.speciesInfo.label, note: loc(s.speciesInfo.note) } : null;
    context.deityChoices = { "": "—", ...Object.fromEntries(Object.entries(PT.deities).filter(([, d]) => s.alignment === "neutral" || d.alignment === s.alignment).map(([k, d]) => [k, d.label])) };
    context.isGM = game.user.isGM;
    context.bgLocked = !!s.background?.locked && !game.user.isGM;
    context.restrict = Object.fromEntries(this.actor.items
      .map(i => [i.id, R.professionRestriction(s.profession, i, this.actor.items.contents)]).filter(([, k]) => k).map(([id, k]) => [id, loc(k)]));
    context.slots = this.#slotView(s.slotInfo);
    context.isCaster = s.profession !== "warrior";
    context.xpPercent = Math.min(100, Math.round(100 * s.xp / Math.max(1, s.nextLevelXP)));
    context.levelUpReady = s.computedLevel > (this.actor.getFlag(SYSTEM_ID, "lastLevelRolled") ?? 1);
    context.tabs = [
      { id: "main", label: loc("PT.Tab.main") },
      { id: "skills", label: loc("PT.Tab.skills") },
      ...(context.isCaster || context.spellGroups.length ? [{ id: "spells", label: loc("PT.Tab.spells") }] : []),
      { id: "devices", label: loc("PT.Tab.devices") },
      { id: "gear", label: loc("PT.Tab.gear") },
      { id: "background", label: loc("PT.Tab.background") },
      { id: "notes", label: loc("PT.Tab.notes") }
    ];
    if ( !context.tabs.find(t => t.id === this.tabGroups.primary) ) this.tabGroups.primary = "main";
    context.tab = this.tabGroups.primary;
    return context;
  }

  #slotView(si) {
    if ( !si ) return null;
    const chip = (label, x, extra = "") => ({ label, left: x.left, allowed: x.allowed, used: x.used, extra,
      cls: x.left < 0 ? "over" : x.left === 0 ? "full" : "open" });
    const o = si.original;
    const original = [
      chip(loc("PT.SkillGroup.plebeian"), o.g1), chip(loc("PT.SkillGroup.skilled"), o.g2), chip(loc("PT.SkillGroup.noble"), o.g3)
    ];
    if ( o.any.allowed ) original.push(chip(loc("PT.Slots.AnyGroup"), o.any));
    if ( o.over ) original.push({ label: loc("PT.Slots.OverOriginal"), left: -o.over, allowed: 0, used: o.over, cls: "over" });
    const profession = chip(loc("PT.Slots.Professional"), si.professional,
      si.professional.from ? game.i18n.format("PT.Slots.FromFirst", { n: si.professional.from + Math.max(0, this.actor.system.level - 1) }) : "");
    const bonus = ["g1", "g2", "g3"].map((g, i) => chip(loc(`PT.SpellGroup.${i + 1}`), si.bonus[g]));
    return { set: si.set, original, profession, bonus };
  }

  #bandNotes(a, b) {
    const n = [];
    if ( b.noEyes ) n.push(loc("PT.Note.noEyes"));
    if ( b.maxSpellGroup === 0 ) n.push(loc("PT.Note.noSpells"));
    else if ( b.maxSpellGroup ) n.push(game.i18n.format("PT.Note.maxGroup", { n: b.maxSpellGroup }));
    if ( b.secretDoors ) n.push(game.i18n.format("PT.Note.secretDoors", { n: b.secretDoors }));
    if ( b.traps ) n.push(game.i18n.format("PT.Note.traps", { n: b.traps }));
    if ( a === "con" ) {
      n.push(game.i18n.format(b.key === "average" ? "PT.Note.reviveInterp" : "PT.Note.revive", { n: b.revive }));
      if ( b.healFail ) n.push(game.i18n.format("PT.Note.healFail", { n: b.healFail }));
      if ( b.healBonus ) n.push(loc("PT.Note.healBonus"));
    }
    if ( b.spellBonus ) n.push(game.i18n.format("PT.Note.spellBonus", { n: b.spellBonus }));
    if ( b.strayChance ) n.push(game.i18n.format("PT.Note.stray", { n: b.strayChance }));
    if ( a === "dex" && b.key === "clever" ) n.push(loc("PT.Note.clever"));
    return n.join("; ");
  }

  static #onActionCheck() { Rolls.rollActionCheck(this.actor); }
  /** Click a talent: roll under its score. Shift-click asks for a modifier first. */
  static #onTalentCheck(event, target) { Rolls.rollTalentCheck(this.actor, target.dataset.talent, { ask: event.shiftKey }); }
  static #onDivine() { Rolls.rollDivine(this.actor); }
  static #onRevive() { Rolls.rollRevive(this.actor); }
  static #onAwardXP() { Rolls.awardXP(this.actor); }
  static async #onLevelUp() {
    await Rolls.levelUp(this.actor);
    await this.actor.setFlag(SYSTEM_ID, "lastLevelRolled", this.actor.system.level);
  }
  static async #onRollCharacter() {
    await Rolls.rollNewCharacter(this.actor);
    await this.actor.setFlag(SYSTEM_ID, "lastLevelRolled", 1);
  }
  static #onRegainSpells() { this.actor.regainSpells(); }
  static #onRest() { this.actor.restDay(); }
  static #onBackground() { backgroundDialog(this.actor); }
  /** The background locks itself once rolled; only a GM can unlock (or lock) it. */
  static async #onToggleBackgroundLock() {
    if ( !game.user.isGM ) return;
    await this.actor.update({ "system.background.locked": !this.actor.system.background.locked });
  }
  static async #onFinish() {
    const ok = await foundry.applications.api.DialogV2.confirm({
      window: { title: loc("PT.Finish.Label") },
      content: `<p>${loc("PT.Finish.Confirm")}</p>`
    });
    if ( ok ) await this.actor.update({ "system.finished": true });
  }
  /** Set the slot numbers by hand (characters made before slots existed, or GM rulings). */
  static async #onEditSlots() {
    const sl = this.actor.system.slots;
    const n = (name, v, label) => `<div class="form-group"><label>${loc(label)}</label><input type="number" name="${name}" value="${v}" min="0"></div>`;
    const content = `<div class="pt-dialog"><p class="hint">${loc("PT.Slots.EditHint")}</p>
      <h4>${loc("PT.Slots.Original")}</h4>
      ${n("og1", sl.original.g1, "PT.SkillGroup.plebeian")}${n("og2", sl.original.g2, "PT.SkillGroup.skilled")}${n("og3", sl.original.g3, "PT.SkillGroup.noble")}${n("oany", sl.original.any, "PT.Slots.AnyGroup")}
      <h4>${loc("PT.Slots.Professional")}</h4>
      ${n("profStart", sl.profStart, "PT.Slots.ProfStart")}${n("profFrom", sl.profFrom, "PT.Slots.ProfFrom")}
      <h4>${loc("PT.Slots.Bonus")}</h4>
      ${n("bg1", sl.bonus.g1, "PT.SpellGroup.1")}${n("bg2", sl.bonus.g2, "PT.SpellGroup.2")}${n("bg3", sl.bonus.g3, "PT.SpellGroup.3")}</div>`;
    let data;
    try {
      data = await foundry.applications.api.DialogV2.prompt({
        window: { title: loc("PT.Slots.Edit") }, content, rejectClose: false,
        ok: { label: loc("PT.Slots.Save"), callback: (e, b) => new foundry.applications.ux.FormDataExtended(b.form).object }
      });
    } catch ( e ) { return; }
    if ( !data ) return;
    const v = k => Math.max(0, Number(data[k]) || 0);
    await this.actor.update({ "system.slots": {
      original: { g1: v("og1"), g2: v("og2"), g3: v("og3"), any: v("oany") },
      profStart: v("profStart"), profFrom: v("profFrom"),
      bonus: { g1: v("bg1"), g2: v("bg2"), g3: v("bg3") }
    } });
  }
  static async #onReopen() {
    if ( !game.user.isGM ) return;
    await this.actor.update({ "system.finished": false });
  }
}

/* -------------------------------------------- */
/*  Creature sheet                              */
/* -------------------------------------------- */

export class PTCreatureSheet extends PTActorSheetBase {
  static DEFAULT_OPTIONS = {
    classes: ["creature"],
    position: { width: 660, height: 640 },
    actions: { attack: PTCreatureSheet.#onAttack, toggleEdit: PTCreatureSheet.#onToggleEdit, rollTreasure: PTCreatureSheet.#onRollTreasure }
  };

  /** Creature stats are locked by default; only a GM can unlock them. */
  _editing = false;

  static PARTS = {
    sheet: { template: `systems/${SYSTEM_ID}/templates/actor/creature-sheet.hbs`, scrollable: [".sheet-body"] }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.typeChoices = choices(PT.creatureTypes);
    context.tableChoices = { creature: loc("PT.Table.creature"), man: loc("PT.Table.man") };
    context.saveAsChoices = { warrior: loc("PT.Prof.warrior"), caster: loc("PT.SaveAs.caster") };
    const s = this.actor.system;
    context.canEdit = game.user.isGM && this.isEditable;
    context.editing = context.canEdit && this._editing;
    context.editable = context.editing;
    // Weapons can be added and removed by the GM without unlocking the stat block.
    context.itemControls = context.canEdit;
    context.statRows = this.#statRows();
    context.treasureButtons = game.user.isGM && (Treasure.parseTreasure(s.treasure.carried).length || Treasure.parseTreasure(s.treasure.lair).length)
      ? { carried: Treasure.parseTreasure(s.treasure.carried).length > 0, lair: Treasure.parseTreasure(s.treasure.lair).length > 0 } : null;
    context.tabs = [
      { id: "main", label: loc("PT.Tab.main") },
      { id: "items", label: loc("PT.Tab.creatureItems") },
      { id: "notes", label: loc("PT.Tab.notes") }
    ];
    if ( !context.tabs.find(t => t.id === this.tabGroups.primary) ) this.tabGroups.primary = "main";
    context.tab = this.tabGroups.primary;
    return context;
  }

  #statRows() {
    const s = this.actor.system, rows = [];
    const add = (label, value, cls = "") => { if ( value !== undefined && value !== null && value !== "" ) rows.push({ label: loc(label), value, cls }); };
    add("PT.CreatureType.label", loc(PT.creatureTypes[s.creatureType] ?? s.creatureType) + (s.treasure.special ? ` (${s.treasure.special})` : ""));
    add("PT.NumberAppearing", s.numberAppearing);
    add("PT.Attitude", s.attitude);
    add("PT.Attacks", s.attacks);
    add("PT.Damage", s.damageDice || loc("PT.DamageByTable"));
    if ( s.hitBonus ) add("PT.HitBonus", s.hitBonus > 0 ? `+${s.hitBonus}` : s.hitBonus);
    if ( s.dmgBonus ) add("PT.DmgBonus", s.dmgBonus > 0 ? `+${s.dmgBonus}` : s.dmgBonus);
    if ( s.acMagic ) add("PT.ExtraToHitIt", `+${s.acMagic}`);
    if ( s.sizes ) add("PT.Sizes", s.sizes.split("|").map(x => { const [l, c, h, q] = x.split(":"); return `${l} ${h} HD, ${q || 1}x${q || 1} (${c}%)`; }).join("; "));
    add("PT.AttackTable", loc(s.attackTable === "man" ? "PT.Table.man" : "PT.Table.creature"));
    add("PT.SaveAs.label", `${loc(s.saveAs === "warrior" ? "PT.Prof.warrior" : "PT.SaveAs.caster")} ${s.level}`);
    add("PT.Morale", loc(s.noMorale ? "PT.NoMorale" : "PT.ChecksMorale"));
    if ( this.actor.items.some(i => i.type === "spell") || s.casterLevel ) {
      add("PT.CreatureSpells", game.i18n.format("PT.CreatureSpellsValue", { level: s.spellLevel, chance: s.spellChance }));
    }
    add("PT.Treasure.carried", s.treasure.carried);
    add("PT.Treasure.lair", s.treasure.lair);
    add("PT.Special", s.special);
    add("PT.Source", s.source, "source");
    return rows;
  }

  static #onToggleEdit() {
    if ( !game.user.isGM ) return;
    this._editing = !this._editing;
    this.render();
  }

  /** GM: roll the creature's carried or lair treasure (EPT Sec. 2220). */
  static #onRollTreasure(event, target) {
    if ( !game.user.isGM ) return;
    return Treasure.rollCreatureTreasure(this.actor, target.dataset.which);
  }

  /** A natural attack without a weapon item: d20 on the creature's table, then the creature's damage. */
  static #onAttack() {
    return Rolls.rollAttack(this.actor, null, { label: loc("PT.NaturalAttack"), natural: true });
  }
}

/* -------------------------------------------- */
/*  Item sheet                                  */
/* -------------------------------------------- */

export class PTItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["petal-throne", "sheet", "item"],
    position: { width: 560, height: 640 },
    window: { resizable: true },
    form: { submitOnChange: true },
    actions: {
      editImage: PTItemSheet.#onEditImage,
      toggleDescription: PTItemSheet.#onToggleDescription,
      toggleLock: PTItemSheet.#onToggleLock
    }
  };

  static PARTS = {
    sheet: { template: `systems/${SYSTEM_ID}/templates/item/item-sheet.hbs`, scrollable: [".sheet-body"] }
  };

  tabGroups = { primary: "summary" };

  /** Whether the description is open for editing. */
  #editingDescription = false;

  /** Items open locked; the Edit button unlocks every field. Set true before rendering to open unlocked. */
  _unlocked = false;

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const item = this.item;
    const s = item.system;
    Object.assign(context, {
      item, system: s, config: PT, editable: this.isEditable,
      isType: Object.fromEntries(["weapon", "armour", "skill", "spell", "eye", "equipment", "magicItem"].map(t => [t, item.type === t])),
      hasCost: ["weapon", "armour", "eye", "equipment", "magicItem"].includes(item.type),
      skillGroupChoices: choices(PT.skillGroups),
      spellKindChoices: choices(PT.spellKinds),
      spellGroupChoices: { 0: "—", 1: loc("PT.SpellGroup.1"), 2: loc("PT.SpellGroup.2"), 3: loc("PT.SpellGroup.3") },
      professionChoices: { "": "—", ...choices(PT.professions) },
      targetingChoices: choices(PT.spellTargeting),
      weaponCatChoices: choices(PT.weaponCategories),
      lengthGroupChoices: Object.fromEntries([0,1,2,3,4,5,6,7,8,9,10].map(n => [String(n), loc(`PT.Length.${n}`)])),
      lengthGroupSelected: String(item.system.lengthGroup ?? 0),
      dieChoices: { d4: "1d4", d6: "1d6" },
      materialChoices: choices(PT.materials),
      armourTypeChoices: choices(PT.armourTypes),
      periodChoices: { day: loc("PT.Period.day"), week: loc("PT.Period.week"), other: loc("PT.Period.other") },
      magicCatChoices: { amulet: loc("PT.MagicCat.amulet"), misc: loc("PT.MagicCat.misc"), scroll: loc("PT.MagicCat.scroll"), book: loc("PT.MagicCat.book") },
      gearCatChoices: { gear: loc("PT.GearCat.gear"), clothing: loc("PT.GearCat.clothing"), provisions: loc("PT.GearCat.provisions"), transport: loc("PT.GearCat.transport"), treasure: loc("PT.GearCat.treasure"), other: loc("PT.GearCat.other") },
      unlocked: this._unlocked && this.isEditable,
      editingDescription: this.#editingDescription && this._unlocked && this.isEditable,
      typeLabel: loc(`TYPES.Item.${item.type}`),
      summary: this.#summary(),
      tab: this.tabGroups.primary
    });
    context.tags = this.#tags();
    context.enrichedDescription = await TE().enrichHTML(s.description ?? "", { relativeTo: item, secrets: item.isOwner });
    return context;
  }

  /** Short labels shown under the item name. */
  #tags() {
    const s = this.item.system, t = [];
    const L = (map, key) => { const v = map?.[key]; return v ? loc(typeof v === "string" ? v : v.label) : null; };
    switch ( this.item.type ) {
      case "weapon": t.push(L(PT.weaponCategories, s.category), L(PT.materials, s.material)); break;
      case "armour": t.push(L(PT.armourTypes, s.armourType), L(PT.materials, s.material)); break;
      case "skill": t.push(L(PT.skillGroups, s.group)); break;
      case "spell": t.push(L(PT.spellKinds, s.kind), s.group ? loc(`PT.SpellGroup.${s.group}`) : null, s.profession ? L(PT.professions, s.profession) : null); break;
      case "eye": t.push(s.rarity ? s.rarity : null); break;
      case "magicItem": t.push(s.category); break;
      case "equipment": t.push(s.category); break;
    }
    return t.filter(Boolean).map(x => String(x).charAt(0).toUpperCase() + String(x).slice(1));
  }

  /** Label/value pairs for the summary tab; empty values are left out. */
  #summary() {
    const s = this.item.system, rows = [];
    const add = (label, value) => { if ( value !== undefined && value !== null && value !== "" && value !== 0 ) rows.push({ label: loc(label), value }); };
    const sign = n => (n > 0 ? `+${n}` : `${n}`);
    switch ( this.item.type ) {
      case "weapon":
        add("PT.Damage", s.fixedDamage || `${s.die === "d4" ? "1d4" : "1d6"}${s.damagePlus ? sign(s.damagePlus) : ""} ${loc("PT.PerDamageDie")}`);
        if ( s.magic ) add("PT.MagicPlus", sign(s.magic));
        if ( s.minStr ) add("PT.MinStr", s.minStr);
        if ( s.range.long ) add("PT.Range.label", `${s.range.close} / ${s.range.medium} / ${s.range.long} ft`);
        if ( s.extraBlow ) add("PT.Special", loc("PT.ExtraBlow"));
        if ( s.noShield ) add("PT.Special", loc("PT.NoShield"));
        if ( s.everyOtherRound ) add("PT.Special", loc("PT.EveryOtherRound"));
        break;
      case "armour":
        if ( s.magic ) add("PT.MagicPlus", sign(s.magic));
        break;
      case "skill":
        if ( s.rank ) add("PT.Rank", s.rank);
        if ( s.usesChanceTable ) add("PT.Roll", loc("PT.UsesChanceTable"));
        add("PT.Language", s.language);
        break;
      case "spell":
        add("PT.Uses", s.unlimited ? loc("PT.Unlimited") : `${s.uses.max} ${loc(`PT.Period.${s.uses.period}`)}`);
        if ( s.targeting !== "none" ) add("PT.Targeting.label", loc(PT.spellTargeting[s.targeting]));
        add("PT.Range.label", s.range); add("PT.Duration", s.duration); add("PT.SaveText", s.save); add("PT.Damage", s.damage);
        add("PT.MinLevel", s.minLevel); add("PT.WaitAfter", s.waitAfter);
        break;
      case "eye":
        add("PT.Charges", s.dial ? s.charges.value : `${s.charges.value} (${loc("PT.NoDial")})`);
        if ( s.targeting !== "none" ) add("PT.Targeting.label", loc(PT.spellTargeting[s.targeting]));
        add("PT.Range.label", s.range); add("PT.Duration", s.duration); add("PT.SaveText", s.save); add("PT.DamageFormula", s.damage);
        add("PT.Inscription", s.inscription);
        break;
      case "magicItem":
        if ( s.uses.max ) add("PT.Uses", `${s.uses.value} / ${s.uses.max}`);
        add("PT.Range.label", s.range); add("PT.Duration", s.duration); add("PT.SaveText", s.save); add("PT.AlignmentRestriction", s.alignmentRestriction);
        break;
    }
    if ( "cost" in s ) {
      if ( s.priceRange ) add("PT.PriceRange", s.priceRange);
      else add("PT.CostK", s.cost ? s.cost.toLocaleString() : "");
      add("PT.SGEncumbrance", s.sgEncumbrance);
      add("PT.WeightK", s.weight ? s.weight.toLocaleString() : "");
      if ( s.quantity !== 1 ) add("PT.Quantity", s.quantity);
    }
    if ( s.source ) rows.push({ label: loc("PT.Source"), value: s.source, cls: "source" });
    return rows;
  }

  _onRender(context, options) {
    super._onRender?.(context, options);
    const activate = tab => {
      this.element.querySelectorAll("nav.sheet-tabs [data-tab]").forEach(a => a.classList.toggle("active", a.dataset.tab === tab));
      this.element.querySelectorAll("section.tab[data-tab]").forEach(sec => sec.classList.toggle("active", sec.dataset.tab === tab));
    };
    activate(this.tabGroups.primary);
    this.element.querySelectorAll("nav.sheet-tabs [data-tab]").forEach(a => a.addEventListener("click", ev => {
      ev.preventDefault();
      this.tabGroups.primary = a.dataset.tab;
      activate(a.dataset.tab);
    }));
  }

  static #onToggleLock() {
    this._unlocked = !this._unlocked;
    if ( !this._unlocked ) this.#editingDescription = false;
    this.render();
  }

  static #onToggleDescription() {
    this.#editingDescription = !this.#editingDescription;
    this.render();
  }

  static async #onEditImage() {
    if ( !this.isEditable ) return;
    const FP = foundry.applications.apps.FilePicker.implementation;
    return new FP({ type: "image", current: this.item.img, callback: path => this.item.update({ img: path }) }).browse();
  }
}
