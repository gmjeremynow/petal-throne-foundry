import { SYSTEM_ID } from "./config.mjs";

/**
 * Initiative, by world setting:
 *  - "side":  EPT 1975 Sec. 720/1200(c). Each side rolls a d6; ties roll again; the higher side acts first.
 *  - "sg":    Swords & Glory Vol 2 Sec. 2.822. Every combatant rolls a d20 at the start of each round.
 *             Optional: in the first round, the longer melee weapon strikes first (weapon length groups).
 *  - "d6each": a d6 for each combatant (the system's original behaviour).
 * Sides come from token disposition: Friendly = the party, Hostile (or Secret) = foes, Neutral = others.
 */

export const INITIATIVE_MODES = {
  side: "PT.Init.Mode.side",
  sg: "PT.Init.Mode.sg",
  d6each: "PT.Init.Mode.d6each"
};

export function initiativeMode() {
  return game.settings.get(SYSTEM_ID, "initiativeMode") ?? "side";
}

export function applyInitiativeFormula() {
  CONFIG.Combat.initiative = { formula: initiativeMode() === "sg" ? "1d20" : "1d6", decimals: 0 };
}

const loc = k => game.i18n.localize(k);
const fmt = (k, d) => game.i18n.format(k, d);

function sideOf(combatant) {
  const d = combatant.token?.disposition ?? combatant.actor?.prototypeToken?.disposition ?? 0;
  const D = CONST.TOKEN_DISPOSITIONS;
  if ( d === D.FRIENDLY ) return "friendly";
  if ( d === D.HOSTILE || d === D.SECRET ) return "hostile";
  return "neutral";
}

/**
 * Weapon length group for the S&G first-round rule (1 = pike ... 9 = dagger, 10 = all others).
 * Characters use their equipped melee weapons, creatures any melee weapon they carry; the longest counts.
 */
export function lengthGroupOf(actor) {
  if ( !actor ) return 10;
  const weapons = actor.items.filter(i => i.type === "weapon" && (i.system.lengthGroup ?? 0) > 0
    && (actor.type === "creature" || i.system.equipped));
  if ( !weapons.length ) return 10;
  return Math.min(...weapons.map(w => w.system.lengthGroup));
}

export class PTCombat extends Combat {

  /** Roll a d6 for each side with no tie for any place; returns { side: score }. */
  static async #rollSides(sides, fixed = {}) {
    const result = {};
    const rolls = [];
    let pending = [...sides];
    let guard = 0;
    while ( pending.length && guard++ < 50 ) {
      for ( const s of pending ) {
        const r = await new Roll("1d6").evaluate();
        rolls.push(r);
        result[s] = r.total;
      }
      // Ties among the newly rolled sides, or with a side that already has its roll, are rolled again.
      const all = { ...fixed, ...result };
      pending = pending.filter(s => Object.entries(all).some(([o, v]) => o !== s && v === all[s]));
    }
    return { result, rolls };
  }

  async rollInitiative(ids, { formula = null, updateTurn = true, messageOptions = {} } = {}) {
    const mode = initiativeMode();
    if ( mode !== "side" ) {
      return super.rollInitiative(ids, { formula: formula ?? (mode === "sg" ? "1d20" : "1d6"), updateTurn, messageOptions });
    }
    ids = typeof ids === "string" ? [ids] : ids;
    const chosen = ids.map(id => this.combatants.get(id)).filter(Boolean);
    const sides = [...new Set(chosen.map(sideOf))];
    // Sides not being rolled now keep any roll they already have.
    const fixed = {};
    for ( const c of this.combatants ) {
      const s = sideOf(c);
      if ( !sides.includes(s) && Number.isFinite(c.initiative) ) fixed[s] = c.initiative;
    }
    const { result, rolls } = await PTCombat.#rollSides(sides, fixed);
    // Every member of a rolled side takes the side's score, including members not in this batch.
    const updates = this.combatants.filter(c => sides.includes(sideOf(c))).map(c => ({ _id: c.id, initiative: result[sideOf(c)] }));
    const currentId = this.combatant?.id;
    await this.updateEmbeddedDocuments("Combatant", updates);
    if ( updateTurn && currentId ) await this.update({ turn: this.turns.findIndex(t => t.id === currentId) });

    const scores = { ...fixed, ...result };
    const order = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const rows = order.map(([s, v]) => `<tr><th>${loc(`PT.Init.Side.${s}`)}</th><td>${v}</td></tr>`).join("");
    const first = order.length > 1 ? `<p><b>${fmt("PT.Init.ActsFirst", { side: loc(`PT.Init.Side.${order[0][0]}`) })}</b></p>` : "";
    await ChatMessage.create({
      ...messageOptions,
      content: `<div class="pt-card"><header class="pt-card-title">${loc("PT.Init.ReactionTime")}</header><div class="pt-card-body"><table class="pt-table">${rows}</table>${first}<p class="hint">${loc("PT.Init.SideHint")}</p></div></div>`,
      rolls
    });
    return this;
  }

  /** S&G: everyone rolls again at the start of each round. */
  async nextRound() {
    const out = await super.nextRound();
    if ( initiativeMode() === "sg" && game.user.isGM ) {
      await this.updateEmbeddedDocuments("Combatant", this.combatants.map(c => ({ _id: c.id, initiative: null })));
      await this.rollAll({ updateTurn: false });
      await this.update({ turn: 0 });
    }
    return out;
  }

  /** S&G first round: the longer melee weapon strikes first; the d20 decides within a length group. */
  _sortCombatants(a, b) {
    return ptSort(a, b);
  }
}

function ptSort(a, b) {
  const combat = a.parent;
  if ( combat && initiativeMode() === "sg" && (combat.round ?? 0) <= 1
       && game.settings.get(SYSTEM_ID, "weaponLengthFirstRound") ) {
    const ga = lengthGroupOf(a.actor), gb = lengthGroupOf(b.actor);
    if ( ga !== gb ) return ga - gb;
  }
  const ia = Number.isFinite(a.initiative) ? a.initiative : -Infinity;
  const ib = Number.isFinite(b.initiative) ? b.initiative : -Infinity;
  return (ib - ia) || (a.id > b.id ? 1 : -1);
}
PTCombat._sortCombatants = ptSort;
