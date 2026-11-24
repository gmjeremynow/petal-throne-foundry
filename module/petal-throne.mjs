/**
 * Empire of the Petal Throne (Unofficial) for Foundry VTT.
 * A fan-made system for the 1975 rules, with optional Swords & Glory background generation.
 */
import PT, { SYSTEM_ID } from "./config.mjs";
import * as R from "./rules.mjs";
import * as Rolls from "./rolls.mjs";
import { CharacterData, CreatureData } from "./data/actor-models.mjs";
import { WeaponData, ArmourData, SkillData, SpellData, EyeData, EquipmentData, MagicItemData } from "./data/item-models.mjs";
import { PTActor, PTItem } from "./documents.mjs";
import { PTCharacterSheet, PTCreatureSheet, PTItemSheet, addDroppedItem } from "./sheets.mjs";
import { backgroundDialog } from "./sg-background.mjs";
import { populateEmptyPacks, checkPackData, withPackLock } from "./packs.mjs";
import { applyMonsterArt, ensureArtFolder, DEFAULT_ART_FOLDER } from "./monsterart.mjs";
import { syncCreatures, migrateIfNeeded } from "./migrate.mjs";
import { PTCombat, INITIATIVE_MODES, applyInitiativeFormula } from "./combat.mjs";
import { organizeItems, addOrganizeButton, scheduleOrganize } from "./organize.mjs";
import * as Treasure from "./treasure.mjs";

Hooks.once("init", () => {
  console.log(`${SYSTEM_ID} | Initialising`);
  CONFIG.PT = PT;
  game.petalThrone = { rules: R, rolls: Rolls, backgroundDialog, populateEmptyPacks, applyMonsterArt, syncCreatures, organizeItems,
    treasure: Treasure, treasureDialog: Treasure.treasureDialog,
    /**
     * For add-on modules: add a profession (call in the module's "init" hook).
     * def: { label, skillGroupLabel, as, xp, titles, hitDice, prime, damageShift, savesAs, divineBonus, restriction }
     */
    registerProfession(key, def = {}) {
      R.registerProfessionRules(key, def);
      PT.professions[key] = def.label ?? key;
      PT.skillGroups[key] = def.skillGroupLabel ?? def.label ?? key;
    }
  };

  CONFIG.Actor.documentClass = PTActor;
  CONFIG.Item.documentClass = PTItem;
  CONFIG.Actor.dataModels = { character: CharacterData, npc: CharacterData, creature: CreatureData };
  CONFIG.Item.dataModels = {
    weapon: WeaponData, armour: ArmourData, skill: SkillData, spell: SpellData,
    eye: EyeData, equipment: EquipmentData, magicItem: MagicItemData
  };
  CONFIG.Actor.trackableAttributes = {
    character: { bar: ["hp"], value: ["xp"] },
    npc: { bar: ["hp"], value: [] },
    creature: { bar: ["hp"], value: [] }
  };

  // Initiative: EPT side reaction time, S&G individual d20, or a d6 each (world setting).
  CONFIG.Combat.documentClass = PTCombat;
  CONFIG.Combat.initiative = { formula: "1d6", decimals: 0 };

  const DSC = foundry.applications.apps.DocumentSheetConfig;
  DSC.registerSheet(Actor, SYSTEM_ID, PTCharacterSheet, { types: ["character", "npc"], makeDefault: true, label: "PT.Sheet.character" });
  DSC.registerSheet(Actor, SYSTEM_ID, PTCreatureSheet, { types: ["creature"], makeDefault: true, label: "PT.Sheet.creature" });
  DSC.registerSheet(Item, SYSTEM_ID, PTItemSheet, { makeDefault: true, label: "PT.Sheet.item" });

  game.settings.register(SYSTEM_ID, "failedSpellUsesCasting", {
    name: "PT.Setting.failedSpell.name",
    hint: "PT.Setting.failedSpell.hint",
    scope: "world", config: true, type: Boolean, default: true
  });
  game.settings.register(SYSTEM_ID, "autoPopulatePacks", {
    name: "PT.Setting.autoPacks.name",
    hint: "PT.Setting.autoPacks.hint",
    scope: "world", config: true, type: Boolean, default: true
  });

  game.settings.register(SYSTEM_ID, "rollCreatureHP", {
    name: "PT.Setting.rollHP.name",
    hint: "PT.Setting.rollHP.hint",
    scope: "world", config: true, type: Boolean, default: true
  });

  game.settings.register(SYSTEM_ID, "playableSpecies", {
    name: "PT.Playable.name",
    hint: "PT.Playable.hint",
    scope: "world", config: true, type: String, default: "sg",
    choices: { human: "PT.Playable.human", sg: "PT.Playable.sg", all: "PT.Playable.all" },
    onChange: () => Object.values(foundry.applications.instances ?? {}).forEach(app => { if ( app.actor?.type === "character" ) app.render(); })
  });
  game.settings.register(SYSTEM_ID, "initiativeMode", {
    name: "PT.Init.Setting.name",
    hint: "PT.Init.Setting.hint",
    scope: "world", config: true, type: String, default: "side",
    choices: INITIATIVE_MODES,
    onChange: () => applyInitiativeFormula()
  });
  game.settings.register(SYSTEM_ID, "weaponLengthFirstRound", {
    name: "PT.Init.Length.name",
    hint: "PT.Init.Length.hint",
    scope: "world", config: true, type: Boolean, default: true,
    onChange: () => game.combats?.forEach(c => { c.setupTurns(); ui.combat?.render(); })
  });
  applyInitiativeFormula();

  game.settings.register(SYSTEM_ID, "packDataVersion", { scope: "world", config: false, type: String, default: "" });
  game.settings.register(SYSTEM_ID, "lastSyncedVersion", { scope: "world", config: false, type: String, default: "" });
  game.settings.register(SYSTEM_ID, "monsterArtFolder", {
    name: "PT.Art.FolderName",
    hint: "PT.Art.FolderHint",
    scope: "world", config: true, type: String, default: DEFAULT_ART_FOLDER, filePicker: "folder"
  });

  registerHandlebars();
  foundry.applications.handlebars.loadTemplates([
    `systems/${SYSTEM_ID}/templates/actor/character-sheet.hbs`,
    `systems/${SYSTEM_ID}/templates/actor/creature-sheet.hbs`,
    `systems/${SYSTEM_ID}/templates/actor/rich-text.hbs`,
    `systems/${SYSTEM_ID}/templates/actor/slot-bar.hbs`,
    `systems/${SYSTEM_ID}/templates/item/item-sheet.hbs`
  ]);

  Rolls.registerChatListeners();
});

Hooks.once("ready", async () => {
  // Queued so add-on modules filling their own packs at ready wait their turn.
  await withPackLock(async () => {
    if ( game.user.isGM ) await ensureArtFolder();
    try { await checkPackData(); }
    catch ( err ) { console.error(`${SYSTEM_ID} | Compendium check failed`, err); }
  });
  await migrateIfNeeded();
  scheduleOrganize();
});

/**
 * Sec. 710: when a creature is met, the referee rolls its hit dice for its hit points.
 * Each unlinked creature token placed rolls its own; creatures with sizes roll the size first.
 */
Hooks.on("preCreateToken", (tokenDoc, data, options, userId) => {
  if ( userId !== game.user.id ) return;
  const actor = tokenDoc.actor;
  if ( actor?.type !== "creature" || tokenDoc.actorLink ) return;
  if ( !game.settings.get(SYSTEM_ID, "rollCreatureHP") ) return;
  try { rollPlacedCreature(tokenDoc, actor); }
  catch ( err ) { console.error(`${SYSTEM_ID} | Could not roll size and hit points for ${tokenDoc.name}`, err); }
});

/** Roll n six-sided dice directly (preCreateToken cannot wait for an async Roll). */
function rollD6s(n) {
  const dice = Array.from({ length: n }, () => Math.ceil(Math.random() * 6) || 1);
  return { dice, sum: dice.reduce((a, b) => a + b, 0) };
}

function rollPlacedCreature(tokenDoc, actor) {
  const s = actor.system;
  let hdText = R.parseHD(s.hitDice);
  let hdString = null, sizeLabel = null, squares = null, sizeRoll = null;
  const sizes = (s.sizes || "").split("|").map(x => x.split(":")).filter(x => x.length >= 3);
  if ( sizes.length ) {
    const r = Math.ceil(Math.random() * 100);
    sizeRoll = r;
    let acc = 0;
    const pick = sizes.find(([, c]) => (acc += Number(c)) >= r) ?? sizes[sizes.length - 1];
    sizeLabel = pick[0];
    hdString = pick[2];
    squares = Number(pick[3]) || null;
    hdText = R.parseHD(hdString);
  }
  const nDice = Math.max(1, hdText.dice);
  let formula = `${nDice}d6${hdText.plus > 0 ? ` + ${hdText.plus}` : hdText.plus < 0 ? ` - ${-hdText.plus}` : ""}`;
  let r6 = rollD6s(nDice);
  let roll = { total: r6.sum + hdText.plus };
  if ( hdText.fixed ) { formula = `${hdText.fixed} hp`; r6 = { dice: [], sum: hdText.fixed }; roll = { total: hdText.fixed }; }
  const hp = Math.max(1, roll.total);
  const update = {};
  if ( sizeLabel ) update.name = `${tokenDoc.name} (${sizeLabel})`;
  if ( squares ) { update.width = squares; update.height = squares; }
  if ( Object.keys(update).length ) tokenDoc.updateSource(update);
  const deltaSystem = { hp: { value: hp, max: hp } };
  if ( hdString ) deltaSystem.hitDice = hdString;
  try { tokenDoc.updateSource({ delta: { system: deltaSystem } }); }
  catch ( err ) { console.error(`${SYSTEM_ID} | Could not set rolled hit points on ${tokenDoc.name}`, err); }

  // Tell the GM what was rolled (whispered).
  const lines = [];
  if ( sizeLabel ) lines.push(game.i18n.format("PT.Placed.Size", { roll: sizeRoll, size: sizeLabel, hd: hdString, sq: squares || 1 }));
  lines.push(game.i18n.format("PT.Placed.HP", { formula: r6.dice.length ? `${formula} [${r6.dice.join(", ")}]` : formula, total: roll.total, hp }));
  ChatMessage.create({
    content: `<div class="pt-card"><header class="pt-card-title">${foundry.utils.escapeHTML(update.name ?? tokenDoc.name)}</header><div class="pt-card-body">${lines.map(l => `<p>${l}</p>`).join("")}</div></div>`,
    whisper: game.users.filter(u => u.isGM).map(u => u.id)
  });
}

/** GM-only "Sort Skills & Spells" button in the Items tab. */
Hooks.on("renderItemDirectory", (app, html) => addOrganizeButton(app, html));

/** Keep skills and spells in the Items tab sorted into type folders automatically. */
Hooks.on("createItem", (item) => { if ( !item.parent && ["skill", "spell"].includes(item.type) ) scheduleOrganize(); });
Hooks.on("updateItem", (item, changes) => {
  if ( item.parent || !["skill", "spell"].includes(item.type) ) return;
  if ( "folder" in changes ) return; // a move we (or the GM) just made
  if ( changes.system && ["group", "kind", "profession", "rank"].some(k => k in changes.system) ) scheduleOrganize();
});

/** GM-only "Apply Monster Art" button in the Actors tab, beside Create Actor and Create Folder. */
Hooks.on("renderActorDirectory", (app, html) => {
  if ( !game.user.isGM ) return;
  const root = html instanceof HTMLElement ? html : html?.[0];
  if ( !root || root.querySelector(".pt-apply-art") ) return;
  const bar = root.querySelector(".header-actions") ?? root.querySelector(".directory-header .action-buttons");
  if ( !bar ) return;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "pt-apply-art";
  btn.innerHTML = `<i class="fa-solid fa-image"></i> ${game.i18n.localize("PT.Art.MenuLabel")}`;
  btn.addEventListener("click", async ev => {
    ev.preventDefault();
    btn.disabled = true;
    try { await withPackLock(async () => { await applyMonsterArt(); await syncCreatures(); }); } finally { btn.disabled = false; }
  });
  bar.append(btn);
});

/** Dropping an item onto a token on the map gives it to that token's actor. */
Hooks.on("dropCanvasData", (cnv, data) => {
  if ( data?.type !== "Item" ) return;
  const token = [...(cnv.tokens?.placeables ?? [])].reverse().find(t => {
    const b = t.bounds ?? new PIXI.Rectangle(t.x, t.y, t.w, t.h);
    return b.contains(data.x, data.y);
  });
  if ( !token?.actor ) return;
  addDroppedItem(token.actor, data);
  return false;
});

/** Dragging an item to the hotbar creates a macro that uses it. */
Hooks.on("hotbarDrop", (bar, data, slot) => {
  if ( data.type !== "Item" || !data.uuid ) return;
  createItemMacro(data, slot);
  return false;
});

async function createItemMacro(data, slot) {
  const item = await fromUuid(data.uuid);
  if ( !item ) return;
  const command = `const item = await fromUuid("${data.uuid}");\nif ( item ) item.use();`;
  let macro = game.macros.find(m => m.name === item.name && m.command === command);
  if ( !macro ) macro = await Macro.create({ name: item.name, type: "script", img: item.img, command, flags: { [SYSTEM_ID]: { itemMacro: true } } });
  game.user.assignHotbarMacro(macro, slot);
}

function registerHandlebars() {
  Handlebars.registerHelper("ptSigned", n => {
    const v = Number(n) || 0;
    return v > 0 ? `+${v}` : `${v}`;
  });
  Handlebars.registerHelper("ptEq", (a, b) => a === b);
  Handlebars.registerHelper("ptGt", (a, b) => Number(a) > Number(b));
  Handlebars.registerHelper("ptOr", (...args) => args.slice(0, -1).some(Boolean));
  Handlebars.registerHelper("ptLabel", (map, key) => {
    const v = map?.[key];
    if ( !v ) return key ?? "";
    return game.i18n.localize(typeof v === "string" ? v : v.label);
  });
}
