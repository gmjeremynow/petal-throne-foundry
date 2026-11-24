import * as Rolls from "./rolls.mjs";

export class PTActor extends Actor {
  /** Default token settings for new actors. */
  async _preCreate(data, options, user) {
    if ( (await super._preCreate(data, options, user)) === false ) return false;
    const given = data.prototypeToken ?? {};
    const HOVER = CONST.TOKEN_DISPLAY_MODES.HOVER; // "Hovered by Anyone"
    const proto = {};
    // Name and hit point bar show when anyone hovers over the token, unless the creator set them.
    if ( given.displayName === undefined ) proto.displayName = HOVER;
    if ( given.displayBars === undefined ) proto.displayBars = HOVER;
    if ( !given.bar1?.attribute ) proto.bar1 = { attribute: "hp" };
    if ( this.type === "character" ) {
      if ( given.actorLink === undefined ) proto.actorLink = true;
      if ( given.disposition === undefined ) proto.disposition = CONST.TOKEN_DISPOSITIONS.FRIENDLY;
    }
    if ( this.type === "creature" && given.disposition === undefined ) proto.disposition = CONST.TOKEN_DISPOSITIONS.HOSTILE;
    if ( Object.keys(proto).length ) this.updateSource({ prototypeToken: proto });
  }

  /**
   * Keep token names in step with the actor's name. When the actor is renamed, its prototype token takes the
   * new name if it still carried the old one (or none), so tokens dropped on a scene afterwards use it.
   */
  async _preUpdate(changed, options, user) {
    if ( (await super._preUpdate(changed, options, user)) === false ) return false;
    const name = changed.name;
    if ( (typeof name === "string") && name && (name !== this.name)
      && !foundry.utils.hasProperty(changed, "prototypeToken.name")
      && (!this.prototypeToken.name || (this.prototypeToken.name === this.name)) ) {
      foundry.utils.setProperty(changed, "prototypeToken.name", name);
      options.ptOldName = this.name;
    }
  }

  /** Placed tokens linked to this actor that still carry the old name are renamed too (by the active GM). */
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    const old = options.ptOldName;
    if ( !old || !("name" in changed) || !game.users.activeGM?.isSelf ) return;
    for ( const scene of game.scenes ) {
      const updates = scene.tokens.filter(t => t.actorLink && (t.actorId === this.id) && (t.name === old))
        .map(t => ({ _id: t.id, name: changed.name }));
      if ( updates.length ) scene.updateEmbeddedDocuments("Token", updates).catch(err => console.error("petal-throne | Token rename failed", err));
    }
  }

  rollSave(type, opts) { return Rolls.rollSave(this, type, opts); }
  rollMorale() { return Rolls.rollMorale(this); }
  rollActionCheck() { return Rolls.rollActionCheck(this); }
  rollDivine() { return Rolls.rollDivine(this); }
  rollRevive() { return Rolls.rollRevive(this); }
  awardXP() { return Rolls.awardXP(this); }
  levelUp() { return Rolls.levelUp(this); }

  /** Restore all daily spell uses (Sec. 434: spells return at about 6:00 A.M.). */
  async regainSpells() {
    const updates = this.items.filter(i => i.type === "spell" && i.system.uses.period === "day")
      .map(i => ({ _id: i.id, "system.uses.value": i.system.uses.max }));
    if ( updates.length ) await this.updateEmbeddedDocuments("Item", updates);
    ui.notifications.info(game.i18n.format("PT.Info.SpellsRegained", { name: this.name }));
  }

  /** Natural healing: one hit point per day of rest (Sec. 710). */
  async restDay() {
    const hp = this.system.hp;
    await this.update({ "system.hp.value": Math.min(hp.max, hp.value + 1) });
  }
}

export class PTItem extends Item {
  /** Use the item from an actor sheet or a hotbar macro. */
  async use() {
    const actor = this.actor;
    if ( !actor ) return ui.notifications.warn(game.i18n.localize("PT.Warn.NoActor"));
    switch ( this.type ) {
      case "weapon": return Rolls.rollAttack(actor, this);
      case "spell": return Rolls.castSpell(actor, this);
      case "eye": return Rolls.useEye(actor, this);
      case "skill": return this.system.usesChanceTable ? Rolls.rollSkill(actor, this) : this.toChat();
      case "magicItem": return Rolls.useMagicItem(actor, this);
      default: return this.toChat();
    }
  }

  async toChat() {
    const TE = foundry.applications.ux.TextEditor.implementation;
    const desc = await TE.enrichHTML(this.system.description ?? "", { relativeTo: this });
    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: `<div class="pt-card"><header class="pt-card-title"><img src="${this.img}" width="24" height="24"> ${this.name}</header><div class="pt-card-body">${desc}</div></div>`
    });
  }
}
