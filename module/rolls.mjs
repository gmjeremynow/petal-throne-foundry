import * as R from "./rules.mjs";
import PT, { SYSTEM_ID } from "./config.mjs";

const { DialogV2 } = foundry.applications.api;
const loc = (k, d) => game.i18n.has(k) ? game.i18n.localize(k) : (d ?? k);
const fmt = (k, data) => game.i18n.format(k, data);
const esc = s => foundry.utils.escapeHTML ? foundry.utils.escapeHTML(String(s ?? "")) : String(s ?? "");

/* -------------------------------------------- */
/*  Helpers                                     */
/* -------------------------------------------- */

const signed = n => (n > 0 ? ` + ${n}` : n < 0 ? ` - ${Math.abs(n)}` : "");

async function evalRoll(formula, data = {}) {
  const roll = new Roll(formula, data);
  await roll.evaluate();
  return roll;
}

function speaker(actor) {
  return ChatMessage.getSpeaker({ actor });
}

async function post(actor, { title, body, rolls = [], flags = {} }) {
  let html = `<div class="pt-card"><header class="pt-card-title">${title}</header>`;
  for ( const r of rolls ) html += await r.render();
  html += `<div class="pt-card-body">${body}</div></div>`;
  return ChatMessage.create({
    speaker: speaker(actor),
    content: html,
    rolls,
    flags: { [SYSTEM_ID]: flags }
  });
}

function badge(ok, yes, no) {
  return `<span class="pt-result ${ok ? "success" : "failure"}">${ok ? yes : no}</span>`;
}

/** Describe the attacker for the combat tables. */
export function combatProfile(actor) {
  const s = actor.system;
  if ( actor.type === "creature" ) {
    return { table: s.attackTable, level: s.level, hd: s.hd, profession: "warrior", damageLevel: s.damageLevel, hitBonus: s.hitBonus, dmgBonus: s.dmgBonus };
  }
  return { table: "man", level: s.level, hd: s.hitDice, profession: s.profession, damageLevel: s.damageLevel, hitBonus: s.hitBonus, dmgBonus: s.dmgBonus };
}

/** Describe a defender: armour class, magical armour bonus, and hit dice. */
export function defenceProfile(actor) {
  if ( !actor ) return null;
  const s = actor.system;
  if ( actor.type === "creature" ) return { name: actor.name, ac: s.ac, magic: s.acMagic ?? 0, hd: s.hd };
  return { name: actor.name, ac: s.ac ?? 9, magic: s.acMagic ?? 0, hd: s.hitDice };
}

function firstTarget() {
  const t = game.user.targets?.first?.() ?? [...(game.user.targets ?? [])][0];
  return t?.actor ?? null;
}

async function formDialog(title, content, okLabel = "PT.Roll") {
  try {
    return await DialogV2.prompt({
      window: { title },
      content: `<div class="pt-dialog">${content}</div>`,
      ok: { label: loc(okLabel, "Roll"), callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object },
      rejectClose: false
    });
  } catch ( err ) {
    return null;
  }
}

/* -------------------------------------------- */
/*  Attack                                      */
/* -------------------------------------------- */

/**
 * Roll to hit with a weapon (or an aimed spell or Eye when weapon is null).
 * @param {Actor} actor
 * @param {Item|null} weapon
 * @param {object} [opts]
 * @param {string} [opts.label]  Label for an aimed spell or device
 * @param {boolean} [opts.skipDialog]
 */
export async function rollAttack(actor, weapon = null, opts = {}) {
  const p = combatProfile(actor);
  const target = firstTarget();
  const def = defenceProfile(target);
  const ws = weapon?.system;
  const isMissile = !!ws && ["missile", "thrown", "siege"].includes(ws.category);
  const extra = ws?.extraBlow ? 1 : 0;
  const blows = ws?.extraBlow ? 2 : 1;
  const usesBonus = ws?.category !== "siege";
  const bonus = (usesBonus ? p.hitBonus : 0) + (ws?.magic ?? 0) + (opts.mod ?? 0);

  /** Lowest (best) armour class this total hits, or null if it misses even AC 9. */
  const bestAC = (total, rangeShift = 0) => {
    for ( let ac = 1; ac <= 9; ac++ ) {
      if ( total >= R.targetNumber({ table: p.table, level: p.level, hd: p.hd, ac, rangeShift }) + extra ) return ac;
    }
    return null;
  };
  const describe = ac => ac === null ? loc("PT.Chat.HitsNone") : ac === 1 ? loc("PT.Chat.HitsAll") : fmt("PT.Chat.HitsAC", { ac });

  const rolls = [];
  let body = "";
  let anyHit = false;
  if ( weapon && actor.type !== "creature" ) {
    const key = R.professionRestriction(actor.system.profession, weapon, actor.items.contents);
    if ( key ) body += `<p class="pt-warn">${loc(key)}</p>`;
  }
  for ( let b = 0; b < blows; b++ ) {
    const roll = await evalRoll(`1d20${signed(bonus)}`);
    rolls.push(roll);
    const nat = roll.dice[0].total;
    const label = blows > 1 ? `<b>${loc("PT.Chat.Blow")} ${b + 1}:</b> ` : "";
    let hitsSomething;
    if ( isMissile ) {
      body += `<p>${label}</p><table class="pt-table">`;
      for ( const [band, shift] of [["close", -1], ["medium", 0], ["long", 1]] ) {
        const ac = bestAC(roll.total, shift);
        body += `<tr><th>${loc(PT.rangeBands[band])}</th><td>${describe(ac)}</td></tr>`;
      }
      body += `</table>`;
      hitsSomething = bestAC(roll.total, -1) !== null;
    } else {
      const ac = bestAC(roll.total);
      body += `<p>${label}<span class="pt-hits">${describe(ac)}</span></p>`;
      hitsSomething = ac !== null;
    }
    // A targeted token gets a definite result, including its magical armour.
    if ( def ) {
      const need = R.targetNumber({ table: p.table, level: p.level, hd: p.hd, ac: def.ac }) + extra + (def.magic ?? 0);
      const hit = roll.total >= need;
      body += `<p>${esc(def.name)} (AC ${def.ac}${def.magic ? `, +${def.magic}` : ""}${isMissile ? `, ${loc("PT.Range.medium")}` : ""}): ${badge(hit, loc("PT.Chat.Hit"), loc("PT.Chat.Miss"))}</p>`;
    }
    if ( nat === 20 ) body += `<p class="pt-crit">${loc("PT.Chat.Natural20")}</p>`;
    if ( hitsSomething && (weapon || opts.natural) ) {
      anyHit = true;
      const src = weapon ? `data-item="${weapon.uuid}"` : `data-natural="1"`;
      body += `<button type="button" data-pt-action="damage" data-actor="${actor.uuid}" ${src} data-double="${nat === 20 ? 1 : 0}" data-target="${target?.uuid ?? ""}">${loc(nat === 20 ? "PT.Chat.RollDoubleDamage" : "PT.Chat.RollDamage")}</button>`;
    }
    if ( nat === 20 ) body += `<button type="button" data-pt-action="instantDeath" data-actor="${actor.uuid}">${loc("PT.Chat.InstantDeath")}</button>`;
  }
  body += `<p class="hint">${loc(extra ? "PT.Chat.HitsHintBlows" : "PT.Chat.HitsHint")}</p>`;
  return post(actor, { title: `${esc(actor.name)}: ${esc(weapon?.name ?? opts.label ?? loc("PT.Attack"))}`, body, rolls });
}

/* -------------------------------------------- */
/*  Damage                                      */
/* -------------------------------------------- */

export async function rollDamage(actor, weapon, { double = false, target = null } = {}) {
  const p = combatProfile(actor);
  const ws = weapon?.system ?? {};
  let def = defenceProfile(target ?? firstTarget());
  let defHD = def?.hd;
  if ( !defHD ) {
    const data = await formDialog(loc("PT.Damage"), `<div class="form-group"><label>${loc("PT.Dialog.DefenderHD")}</label><input type="text" name="hd" value="1"></div>`);
    if ( !data ) return null;
    defHD = R.parseHD(data.hd);
  }
  let formula;
  let note = "";
  if ( ws.fixedDamage ) {
    formula = ws.fixedDamage;
    note = loc("PT.Chat.FixedDamage");
  } else {
    let count = R.damageDiceCount({ level: p.damageLevel, profession: p.profession, defenderHD: defHD });
    if ( double ) count *= 2;
    const die = ws.die === "d4" ? "d4" : "d6";
    const isMissile = ["missile", "thrown", "siege"].includes(ws.category);
    const plus = (ws.damagePlus ?? 0) + (isMissile ? 0 : p.dmgBonus);
    formula = `${count}${die}${signed(plus)}`;
    note = fmt("PT.Chat.DamageDice", { count, hd: R.formatHD(defHD) });
    if ( isMissile ) note += ` ${loc("PT.Chat.NoMissileBonus")}`;
  }
  const roll = await evalRoll(formula);
  const total = Math.max(0, roll.total);
  const body = `<p>${note}</p>${double ? `<p class="pt-crit">${loc("PT.Chat.DoubleDamage")}</p>` : ""}
    <button type="button" data-pt-action="applyDamage" data-amount="${total}">${loc("PT.Chat.ApplyDamage")}</button>`;
  return post(actor, { title: `${esc(actor.name)}: ${loc("PT.Damage")} (${esc(weapon?.name ?? "")})`, body, rolls: [roll] });
}

export async function rollInstantDeath(actor) {
  const roll = await evalRoll("1d20");
  const ok = roll.total >= 19;
  return post(actor, { title: `${esc(actor.name)}: ${loc("PT.Chat.InstantDeath")}`, body: `<p>${badge(ok, loc("PT.Chat.Slain"), loc("PT.Chat.NoEffect"))}</p>`, rolls: [roll] });
}

/** Apply damage to targeted tokens, or controlled tokens if none are targeted. */
export async function applyDamage(amount) {
  let tokens = [...(game.user.targets ?? [])];
  if ( !tokens.length ) tokens = canvas?.tokens?.controlled ?? [];
  if ( !tokens.length ) return ui.notifications.warn(loc("PT.Warn.NoTokens"));
  for ( const t of tokens ) {
    const a = t.actor;
    if ( !a?.isOwner ) { ui.notifications.warn(fmt("PT.Warn.NotOwner", { name: a?.name ?? "?" })); continue; }
    const hp = a.system.hp;
    await a.update({ "system.hp.value": hp.value - amount });
  }
}

/* -------------------------------------------- */
/*  Saving throw                                */
/* -------------------------------------------- */

export async function rollSave(actor, type, { mod = null } = {}) {
  const need = actor.system.saves?.[type];
  if ( need === undefined ) return null;
  if ( mod === null ) {
    const data = await formDialog(`${loc("PT.SavingThrow")}: ${loc(PT.saveTypes[type])}`,
      `<p>${fmt("PT.Chat.Need", { need })}</p><div class="form-group"><label>${loc("PT.Dialog.Modifier")}</label><input type="number" name="mod" value="0"></div>`);
    if ( !data ) return null;
    mod = Number(data.mod) || 0;
  }
  const roll = await evalRoll(`1d20${signed(mod)}`);
  const ok = roll.total >= need;
  let body = `<p>${fmt("PT.Chat.Need", { need })}</p><p>${badge(ok, loc("PT.Chat.Saved"), loc("PT.Chat.Failed"))}</p>`;
  if ( ok && (type === "poison" || type === "eyes") ) body += `<p class="hint">${loc("PT.Chat.SaveHalf")}</p>`;
  return post(actor, { title: `${esc(actor.name)}: ${loc("PT.SavingThrow")} (${loc(PT.saveTypes[type])})`, body, rolls: [roll] });
}

/* -------------------------------------------- */
/*  Spells, skills, and Eyes                    */
/* -------------------------------------------- */

export async function castSpell(actor, spell) {
  const s = actor.system, sp = spell.system;
  const warnings = [];
  if ( sp.group > s.maxSpellGroup ) warnings.push(fmt("PT.Warn.SpellGroup", { max: s.maxSpellGroup }));
  if ( sp.minLevel && (s.spellLevel ?? s.level) < sp.minLevel ) warnings.push(fmt("PT.Warn.SpellLevel", { level: sp.minLevel }));
  if ( !sp.unlimited && sp.uses.value <= 0 ) {
    ui.notifications.warn(fmt("PT.Warn.NoUses", { name: spell.name }));
    return null;
  }
  const chance = s.spellChance;
  const roll = await evalRoll("1d100");
  const ok = roll.total <= chance;
  const consumeOnFail = game.settings.get(SYSTEM_ID, "failedSpellUsesCasting");
  if ( !sp.unlimited && (ok || consumeOnFail) ) await spell.update({ "system.uses.value": Math.max(0, sp.uses.value - 1) });

  let body = `<p>${fmt("PT.Chat.SpellChance", { chance })}</p><p>${badge(ok, loc("PT.Chat.SpellWorks"), loc("PT.Chat.SpellFails"))}</p>`;
  for ( const w of warnings ) body += `<p class="pt-warn">${w}</p>`;
  body += spellDetails(sp);
  body += await descriptionBlock(spell);
  if ( ok && sp.targeting === "aimed" ) body += `<button type="button" data-pt-action="aimed" data-actor="${actor.uuid}" data-label="${esc(spell.name)}">${loc("PT.Chat.RollToHit")}</button>`;
  if ( ok && sp.save ) body += `<p class="hint">${fmt("PT.Chat.SaveAllowed", { save: esc(sp.save) })}</p>`;
  return post(actor, { title: `${esc(actor.name)}: ${esc(spell.name)}`, body, rolls: [roll] });
}

/** The item's description, formatted for a chat card. */
async function descriptionBlock(item) {
  const raw = item.system.description ?? "";
  if ( !raw.trim() ) return "";
  const html = await foundry.applications.ux.TextEditor.implementation.enrichHTML(raw, { relativeTo: item });
  return `<div class="pt-desc">${html}</div>`;
}

function spellDetails(sp) {
  const rows = [];
  if ( sp.range ) rows.push(`<b>${loc("PT.Range.label")}:</b> ${esc(sp.range)}`);
  if ( sp.duration ) rows.push(`<b>${loc("PT.Duration")}:</b> ${esc(sp.duration)}`);
  if ( sp.damage ) rows.push(`<b>${loc("PT.Damage")}:</b> ${esc(sp.damage)}`);
  if ( sp.waitAfter ) rows.push(`<b>${loc("PT.WaitAfter")}:</b> ${esc(sp.waitAfter)}`);
  return rows.length ? `<p class="pt-details">${rows.join("<br>")}</p>` : "";
}

/** Skills that use the Chances of Spells Working table by experience level (Sec. 420). */
export async function rollSkill(actor, skill) {
  const level = actor.system.level ?? 1;
  const chance = R.spellChance(level, 50);
  const roll = await evalRoll("1d100");
  const ok = roll.total <= chance;
  const body = `<p>${fmt("PT.Chat.SkillChance", { chance, level })}</p><p>${badge(ok, loc("PT.Chat.Success"), loc("PT.Chat.Failure"))}</p>`;
  return post(actor, { title: `${esc(actor.name)}: ${esc(skill.name)}`, body, rolls: [roll] });
}

export async function useEye(actor, eye) {
  const s = actor.system, es = eye.system;
  if ( actor.type !== "creature" && s.canUseEyes === false ) {
    ui.notifications.warn(loc("PT.Warn.NoEyes"));
    return null;
  }
  if ( es.charges.value <= 0 ) {
    ui.notifications.warn(fmt("PT.Warn.NoCharges", { name: eye.name }));
    return null;
  }
  await eye.update({ "system.charges.value": es.charges.value - 1 });
  let body = spellDetails(es);
  body += await descriptionBlock(eye);
  body += `<p>${fmt("PT.Chat.ChargesLeft", { n: es.dial ? es.charges.value - 1 : "?" })}</p>`;
  if ( es.targeting === "aimed" ) body += `<button type="button" data-pt-action="aimed" data-actor="${actor.uuid}" data-label="${esc(eye.name)}">${loc("PT.Chat.RollToHit")}</button>`;
  if ( es.save ) body += `<p class="hint">${fmt("PT.Chat.SaveAllowed", { save: esc(es.save) })}</p>`;
  if ( es.damage ) body += `<button type="button" data-pt-action="rollFormula" data-formula="${esc(es.damage)}" data-actor="${actor.uuid}" data-label="${esc(eye.name)}">${loc("PT.Chat.RollDamage")}</button>`;
  body += `<p class="hint">${loc("PT.Chat.EyeXP")}</p>`;
  return post(actor, { title: `${esc(actor.name)}: ${esc(eye.name)}`, body });
}

export async function useMagicItem(actor, item) {
  const u = item.system.uses;
  if ( u?.max > 0 ) {
    if ( u.value <= 0 ) return ui.notifications.warn(fmt("PT.Warn.NoCharges", { name: item.name }));
    await item.update({ "system.uses.value": u.value - 1 });
  }
  const desc = await foundry.applications.ux.TextEditor.implementation.enrichHTML(item.system.description ?? "", { relativeTo: item });
  return post(actor, { title: `${esc(actor.name)}: ${esc(item.name)}`, body: `${spellDetails(item.system)}${desc}` });
}

export async function rollFormula(actor, formula, label) {
  const roll = await evalRoll(formula);
  const body = `<button type="button" data-pt-action="applyDamage" data-amount="${roll.total}">${loc("PT.Chat.ApplyDamage")}</button>`;
  return post(actor, { title: `${esc(actor?.name ?? "")}: ${esc(label)}`, body, rolls: [roll] });
}

/* -------------------------------------------- */
/*  Talents, morale, revival, divine aid        */
/* -------------------------------------------- */

/**
 * Talent check (table ruling): the 1975 rules have no single-talent check, so this follows the Sec. 725
 * Physical Action method: d100, succeeding when the roll is under the talent's score (after species or
 * nation modifiers), plus any modifier the referee sets.
 */
export async function rollTalentCheck(actor, key, { ask = false } = {}) {
  const att = actor?.system?.attributes?.[key];
  if ( !att ) return null;
  const label = loc(PT.attributes[key]);
  const score = att.total ?? att.value;
  let mod = 0;
  if ( ask ) {
    const val = await DialogV2.prompt({
      window: { title: fmt("PT.TalentCheckTitle", { talent: label }) },
      content: `<div class="form-group"><label>${loc("PT.TalentCheckMod")}</label><input type="number" name="mod" value="0" step="5" autofocus></div>`,
      ok: { label: loc("PT.Roll"), callback: (event, button) => Number(button.form.elements.mod.value) || 0 },
      rejectClose: false
    });
    if ( val === null || val === undefined ) return null;
    mod = val;
  }
  const chance = Math.max(0, score + mod);
  const roll = await evalRoll("1d100");
  const ok = roll.total < chance;
  const body = `<p>${fmt("PT.Chat.TalentChance", { chance, talent: label, score, mod: mod ? ` ${mod > 0 ? "+" : ""}${mod}` : "" })}</p><p>${badge(ok, loc("PT.Chat.Success"), loc("PT.Chat.Failure"))}</p>`;
  return post(actor, { title: `${esc(actor.name)}: ${fmt("PT.TalentCheckTitle", { talent: label })}`, body, rolls: [roll] });
}

/** Sec. 725: average of Strength, Intelligence and Dexterity; roll under it. */
export async function rollActionCheck(actor) {
  const chance = actor.system.actionChance;
  const roll = await evalRoll("1d100");
  const ok = roll.total < chance;
  let body = `<p>${fmt("PT.Chat.ActionChance", { chance })}</p><p>${badge(ok, loc("PT.Chat.Success"), loc("PT.Chat.Failure"))}</p>`;
  if ( ok && roll.total >= chance - 20 ) body += `<p class="hint">${loc("PT.Chat.ActionSaveHint")}</p>`;
  return post(actor, { title: `${esc(actor.name)}: ${loc("PT.ActionCheck")}`, body, rolls: [roll] });
}

export async function rollMorale(actor) {
  const hd = actor.type === "creature" ? actor.system.hd : actor.system.hitDice;
  if ( actor.type === "creature" && actor.system.noMorale ) return ui.notifications.info(fmt("PT.Warn.NoMorale", { name: actor.name }));
  const opts = R.MORALE_PERCENTS.map(p => `<option value="${p}">${p}%</option>`).join("");
  const data = await formDialog(loc("PT.Morale"), `<div class="form-group"><label>${loc("PT.Dialog.PercentRemaining")}</label><select name="pct">${opts}</select></div>`);
  if ( !data ) return null;
  const need = R.moraleTarget(Number(data.pct), hd);
  const roll = await evalRoll("2d6");
  const ok = roll.total >= need;
  const body = `<p>${fmt("PT.Chat.Need", { need })}</p><p>${badge(ok, loc("PT.Chat.Stands"), loc("PT.Chat.Flees"))}</p>`;
  return post(actor, { title: `${esc(actor.name)}: ${loc("PT.Morale")}`, body, rolls: [roll] });
}

/** Sec. 413: revival chance by Constitution; each revival costs 5 Constitution unless 91+ is rolled. */
export async function rollRevive(actor, { extraLoss = 0 } = {}) {
  const s = actor.system;
  const chance = s.reviveChance;
  const roll = await evalRoll("1d100");
  const ok = roll.total <= chance;
  let body = `<p>${fmt("PT.Chat.ReviveChance", { chance })}</p><p>${badge(ok, loc("PT.Chat.Revived"), loc("PT.Chat.NotRevived"))}</p>`;
  const rolls = [roll];
  if ( ok ) {
    const keep = await evalRoll("1d100");
    rolls.push(keep);
    const loss = (keep.total > 90 ? 0 : 5) + extraLoss;
    const newCon = Math.max(0, s.attributes.con.value - loss);
    await actor.update({ "system.attributes.con.value": newCon, "system.revivals": s.revivals + 1, "system.hp.value": Math.max(1, s.hp.value) });
    body += `<p>${loss ? fmt("PT.Chat.ConLoss", { loss, con: newCon }) : loc("PT.Chat.NoConLoss")}</p>`;
    if ( newCon <= 0 ) body += `<p class="pt-warn">${loc("PT.Chat.PermanentDeath")}</p>`;
  }
  return post(actor, { title: `${esc(actor.name)}: ${loc("PT.Revive")}`, body, rolls });
}

export async function rollDivine(actor) {
  const s = actor.system;
  if ( s.level < 2 ) return ui.notifications.warn(loc("PT.Warn.DivineLevel"));
  if ( s.divine.barred ) return ui.notifications.warn(loc("PT.Warn.DivineBarred"));
  const deity = PT.deities[s.deity];
  const defaultSource = deity?.kind === "cohort" ? "cohorts" : "gods";
  const content = `
    <p>${loc("PT.Dialog.DivineHint")}</p>
    <div class="form-group"><label>${loc("PT.Dialog.Source")}</label><select name="source">
      <option value="gods" ${defaultSource === "gods" ? "selected" : ""}>${loc("PT.Divine.gods")}</option>
      <option value="cohorts" ${defaultSource === "cohorts" ? "selected" : ""}>${loc("PT.Divine.cohorts")}</option>
    </select></div>
    <div class="form-group"><label>${loc("PT.Dialog.Offerings")}</label><input type="number" name="offer" value="0"></div>
    <p class="hint">${loc("PT.Dialog.OfferingsHint")}</p>`;
  const data = await formDialog(loc("PT.DivineIntervention"), content);
  if ( !data ) return null;
  const profBonus = R.DIVINE_PROFESSION_BONUS[s.profession] ?? 0;
  const offer = Number(data.offer) || 0;
  const roll = await evalRoll(`1d100${signed(profBonus + offer)}`);
  const result = R.divineResult(data.source, s.level, roll.total);
  let body = `<p>${loc(data.source === "gods" ? "PT.Divine.gods" : "PT.Divine.cohorts")} &middot; +${profBonus} ${loc("PT.Dialog.Profession")}, +${offer} ${loc("PT.Dialog.Offerings")}</p>`;
  body += `<p class="pt-result ${result === "intervention" ? "success" : result === "retribution" ? "failure" : ""}">${loc(`PT.Divine.${result}`)}</p>`;
  if ( result === "retribution" ) body += `<button type="button" data-pt-action="rollFormula" data-formula="${s.level}d6" data-actor="${actor.uuid}" data-label="${loc("PT.Divine.retribution")}">${fmt("PT.Chat.RetributionDamage", { n: s.level })}</button>`;
  body += `<p class="hint">${loc("PT.Chat.DivineWeekly")}</p>`;
  await actor.update({ "system.divine.lastUsed": new Date().toLocaleDateString() });
  return post(actor, { title: `${esc(actor.name)}: ${loc("PT.DivineIntervention")}`, body, rolls: [roll] });
}

/* -------------------------------------------- */
/*  Experience and advancement                  */
/* -------------------------------------------- */

export async function awardXP(actor) {
  const s = actor.system;
  const content = `
    <div class="form-group"><label>${loc("PT.Dialog.Treasure")}</label><input type="number" name="treasure" value="0" min="0"></div>
    <div class="form-group"><label>${loc("PT.Dialog.KillHD")}</label><input type="number" name="hd" value="0" min="0"></div>
    <div class="form-group"><label>${loc("PT.Dialog.EyeHD")}</label><input type="number" name="eyeHd" value="0" min="0"></div>
    <div class="form-group"><label>${loc("PT.Dialog.OtherXP")}</label><input type="number" name="other" value="0" min="0"></div>
    <p class="hint">${fmt("PT.Dialog.XPHint", { bonus: s.xpBonus, share: Math.round(s.xpShare * 100) })}</p>`;
  const data = await formDialog(loc("PT.AwardXP"), content, "PT.Apply");
  if ( !data ) return null;
  const raw = (Number(data.treasure) || 0) + R.xpForKill(Number(data.hd) || 0) + R.xpForKill(Number(data.eyeHd) || 0, true) + (Number(data.other) || 0);
  const withBonus = Math.round(raw * (1 + s.xpBonus / 100));
  const counted = Math.round(withBonus * s.xpShare);
  const before = s.computedLevel;
  await actor.update({ "system.xp": s.xp + counted });
  const after = actor.system.computedLevel;
  let body = `<p>${fmt("PT.Chat.XPAward", { raw, withBonus, counted })}</p>`;
  if ( after > before ) body += `<p class="pt-result success">${fmt("PT.Chat.NewLevel", { level: after })}</p>`;
  return post(actor, { title: `${esc(actor.name)}: ${loc("PT.AwardXP")}`, body });
}

/** Runs the end-of-adventure level rolls: hit points, talents (Sec. 417), skills (Sec. 421), bonus spells (Sec. 500). */
export async function levelUp(actor) {
  const s = actor.system;
  const level = s.level;
  const rolls = [];
  let body = `<p>${fmt("PT.Chat.LevelUpFor", { level })}</p>`;

  // Hit points: roll the new hit dice; never fewer than before (Sec. 710).
  const hd = s.hitDice;
  const hpRoll = await evalRoll(`${hd.dice}d6${signed(hd.plus)}`);
  rolls.push(hpRoll);
  const newMax = Math.max(s.hp.max, hpRoll.total);
  const gained = newMax - s.hp.max;
  body += `<p>${fmt("PT.Chat.HPRoll", { hd: s.hitDiceLabel, total: hpRoll.total, max: newMax })}</p>`;
  const updates = { "system.hp.max": newMax, "system.hp.value": s.hp.value + gained };

  // Talent increase.
  const tRoll = await evalRoll("1d100");
  rolls.push(tRoll);
  const inc = R.talentIncrease(tRoll.total);
  if ( inc ) {
    const which = await evalRoll("1d6");
    rolls.push(which);
    const attr = R.TALENT_INCREASE_ORDER[which.total - 1];
    const cur = s.attributes[attr].value;
    if ( cur >= 100 ) body += `<p>${fmt("PT.Chat.TalentMaxed", { attr: loc(PT.attributes[attr]) })}</p>`;
    else {
      updates[`system.attributes.${attr}.value`] = Math.min(100, cur + inc);
      body += `<p>${fmt("PT.Chat.TalentUp", { attr: loc(PT.attributes[attr]), inc })}</p>`;
    }
  } else body += `<p>${loc("PT.Chat.NoTalentUp")}</p>`;

  // Original skill.
  const grp = R.originalSkillOnLevel(level);
  if ( grp ) {
    const oRoll = await evalRoll("1d100");
    rolls.push(oRoll);
    body += `<p>${oRoll.total > 50 ? fmt("PT.Chat.NewOriginalSkill", { group: grp }) : loc("PT.Chat.NoOriginalSkill")}</p>`;
    if ( oRoll.total > 50 ) {
      for ( const k of R.originalSlotsOnLevel(level) ) {
        updates[`system.slots.original.${k}`] = (updates[`system.slots.original.${k}`] ?? s.slots.original[k] ?? 0) + 1;
      }
    }
  }
  body += `<p>${loc("PT.Chat.NewProfessionalSkill")}</p>`;

  // Bonus spell.
  if ( s.profession !== "warrior" ) {
    const scores = R.bonusSpellScores(level);
    if ( scores ) {
      const bRoll = await evalRoll("1d100");
      rolls.push(bRoll);
      const order = ["g2g3", "g3", "g1g2", "g2", "g1"];
      let got = order.find(k => scores[k] !== null && bRoll.total >= scores[k]);
      const adjust = R.BONUS_ADJUST[s.profession];
      if ( got && adjust ) {
        const adjusted = adjust(got, actor.items.contents) ?? null;
        if ( adjusted !== got ) {
          body += `<p class="hint">${fmt("PT.BonusSpell.Adjusted", { from: loc(`PT.BonusSpell.${got}`) })}</p>`;
          got = adjusted;
        }
      }
      body += `<p>${got ? loc(`PT.BonusSpell.${got}`) : loc("PT.BonusSpell.none")}</p>`;
      for ( const k of (got ? R.BONUS_SLOTS[got] : []) ) {
        updates[`system.slots.bonus.${k}`] = (updates[`system.slots.bonus.${k}`] ?? s.slots.bonus[k] ?? 0) + 1;
      }
      body += `<p class="hint">${loc("PT.Chat.BonusSpellHint")}</p>`;
    }
  }
  await actor.update(updates);
  return post(actor, { title: `${esc(actor.name)}: ${loc("PT.LevelUp")}`, body, rolls });
}

/** New character: roll the six talents, original skills and professional skills. */
export async function rollNewCharacter(actor) {
  if ( actor.system.finished ) return ui.notifications.warn(loc("PT.Finish.Locked"));
  const ok = await DialogV2.confirm({ window: { title: loc("PT.RollCharacter") }, content: `<p>${loc("PT.Dialog.RollCharacterWarn")}</p>` });
  if ( !ok ) return null;
  const rolls = [];
  const updates = {};
  let body = "<table class=\"pt-table\">";
  for ( const a of R.ATTRIBUTES ) {
    const r = await evalRoll("1d100");
    rolls.push(r);
    // Add-ons may give a bonus to talent rolls (CONFIG.PT.talentRollBonus: roll -> bonus).
    const bonus = typeof PT.talentRollBonus === "function" ? (Number(PT.talentRollBonus(r.total, a)) || 0) : 0;
    const score = Math.min(100, r.total + bonus);
    updates[`system.attributes.${a}.value`] = score;
    const band = R.talentBand(a, score);
    body += `<tr><th>${loc(PT.attributes[a])}</th><td>${bonus ? `${r.total} +${bonus} = ${score}` : score}</td><td>${loc(`PT.Band.${a}.${band.key}`)}</td></tr>`;
  }
  body += "</table>";
  const o = await evalRoll("1d100");
  const p = await evalRoll("1d100");
  rolls.push(o, p);
  const os = R.originalSkillsFor(o.total);
  const ps = R.professionalSkillsFor(p.total);
  body += `<p>${fmt("PT.Chat.OriginalSkills", { roll: o.total, ...os })}</p>`;
  body += `<p>${fmt("PT.Chat.ProfessionalSkills", { roll: p.total, ...ps })}</p>`;
  body += `<p class="hint">${loc("PT.Chat.RerollHint")}</p>`;
  Object.assign(updates, {
    "system.slots.original": { g1: os.g1, g2: os.g2, g3: os.g3, any: 0 },
    "system.slots.profStart": ps.choose, "system.slots.profFrom": ps.from,
    "system.slots.bonus": { g1: 0, g2: 0, g3: 0 }
  });
  await actor.update(updates);
  return post(actor, { title: `${esc(actor.name)}: ${loc("PT.RollCharacter")}`, body, rolls });
}

/** A creature's natural attack, using its listed damage or the damage dice table with d6. */
export function naturalWeapon(actor) {
  const s = actor?.system ?? {};
  return { name: loc("PT.NaturalAttack"), uuid: "", system: { category: "melee", die: "d6", damagePlus: 0, magic: 0, fixedDamage: s.damageDice ?? "" } };
}

/* -------------------------------------------- */
/*  Chat card buttons                           */
/* -------------------------------------------- */

export function registerChatListeners() {
  Hooks.on("renderChatMessageHTML", (message, html) => {
    html.querySelectorAll("button[data-pt-action]").forEach(btn => {
      btn.addEventListener("click", ev => onChatButton(ev, message));
    });
  });
}

async function onChatButton(event, message) {
  event.preventDefault();
  const btn = event.currentTarget;
  const d = btn.dataset;
  const actor = d.actor ? await fromUuid(d.actor) : null;
  switch ( d.ptAction ) {
    case "damage": {
      const item = d.natural ? naturalWeapon(actor) : await fromUuid(d.item);
      const target = d.target ? await fromUuid(d.target) : null;
      return rollDamage(actor, item, { double: d.double === "1", target });
    }
    case "instantDeath": return rollInstantDeath(actor);
    case "applyDamage": return applyDamage(Number(d.amount) || 0);
    case "aimed": return rollAttack(actor, null, { label: d.label });
    case "rollFormula": return rollFormula(actor, d.formula, d.label);
  }
}
