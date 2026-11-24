# Empire of the Petal Throne (Unofficial) for Foundry VTT

**This work is a Fan Publication, an unofficial work not approved for Tékumel. Tékumel, the Empire of the Petal Throne, and all related products and materials are protected by national and international intellectual property law. For additional information, please visit www.tekumelfoundation.org**

A fan-made game system for Foundry Virtual Tabletop (V13 minimum, built for V14) that plays the
1975 *Empire of the Petal Throne* rules by M.A.R. Barker, with an optional background generator
taken from *Swords & Glory* Vol. 2.

Tékumel and Empire of the Petal Throne are the property of the Tékumel Foundation
(https://www.tekumelfoundation.org). This system contains game mechanics and short summaries only;
play it alongside your own copy of the rules, available from the Foundation.

## Install

In Foundry, Game Systems → Install System, paste this manifest URL:

```
https://github.com/gmjeremynow/petal-throne-foundry/releases/latest/download/system.json
```

## What it does

**Characters (and nonplayer characters)**
- Six basic talents (1-100) with their ratings, hit and damage bonuses, and side effects worked out
  automatically: secret doors, trap detection, revival chance, healing failure, stray blows, spell bonuses,
  spell group limits, inability to use Eyes.
- Warrior, Priest and Magic User; human and nonhuman species with 1-, 2- or 3-dice hit dice progressions.
- Level and title from experience; hit dice by level; armour class from equipped armour and shield.
- One-click: roll a new character (talents, original and professional skill counts), award experience
  (talent bonus and reduced share at high levels applied), level up (hit points never lower than before,
  talent increase, original skill, bonus spell), saving throws, physical action check (Sec. 725),
  divine intervention with offerings, revival with Constitution loss, rest, dawn spell renewal.

**Combat**
- Target a token and click a weapon: Table I or Table II score needed, magical armour, range bands for
  missiles, broadsword-and-dagger double blows, natural 20 double damage and the instant-death roll.
- Damage dice by attacker level against defender hit dice, with the Priest and Magic User row shifts and
  2- and 3-dice being rows. Apply damage to targeted or selected tokens from chat.
- Morale checks for creatures and hirelings. Initiative is 1d6 (reaction time).

**Spells and devices**
- Professional and bonus spells with uses per day, the spell-working roll, aimed spells that roll to hit,
  minimum casting levels and waiting periods for the Creatures and Demon spells.
- Eyes with charges (and charge dials), aimed Eyes, damage rolls; amulets.

**Treasure and magic items**
- The 24 miscellaneous magical items (Sec. 1500) and 24 magic books (Sec. 1700) as items.
- Treasure roller (EPT Secs. 1600-2230): treasure types A-I with coins, gems and jewelry valued (with the
  d6 "move up a category" rolls), Eyes with charges, magical arms and armour (sword powers: alignment,
  intelligence, ego, enemies, spells), scrolls (language, type, spells, curses), amulets, items and books.
  Results are whispered to the GM with links that can be dragged onto sheets.
- Creature sheets have Roll carried treasure / Roll lair treasure buttons (GM) that read the treasure
  text, e.g. "treasure D: 40, E: 10". The Roll Treasure macro also rolls a nonplayer character's magic
  (Secs. 1910-1920) by level and profession, or a single scroll, weapon, Eye, amulet, item, book, gem or jewel.
- All the tables are also RollTables in the Treasure Tables compendium, and on Rules Reference pages.

**Swords & Glory background (optional)**
- Rolls provenience, homeland, home region and locale, language mastery of the starting locale, clan
  and lineage status, family wealth and personal purse (S&G Vol. 2, Secs. 2.231-2.235).

**Compendiums**
Rules reference journal, skills (original and professional, in order), all professional and bonus spells,
36 Eyes, 12 amulets, 24 miscellaneous magical items and 24 books, treasure tables, weapons, armour and gear with 1975 prices and weights, and the 68 creatures from
the specification table.

## Monster art

Put creature images in the **Monster art folder** (System Settings; default `petal-throne_monster_art`,
created in your Foundry data the first time a GM loads a world). Name each file "Token " plus the creature's
name, such as `Token Ahoggya.webp`; accents, apostrophes, case and spaces are ignored, and one level of
subfolders is searched. Then press **Apply Monster Art** in the Actors tab (GM only). It sets the portrait and token on
the creature compendium, on world creatures still using the default picture, and on their placed tokens.
Images that match no creature are listed in a chat message whispered to the GM. Art is applied again
automatically whenever the compendiums are refilled.

Token sizes on the 10-ft grid are a table choice; the books give creature lengths but no grid sizes
(the 1975 rules leave beings larger or smaller than men to the referee, Sec. 723). Rule used: the stated length
or width divided by 10 ft, rounded up, from the middle of any range. Height of upright beings does not count, and
creatures with no stated dimensions are 1x1. Creatures that come in sizes get the footprint of the size rolled
when the token is placed.

| Creature | Stated size | Token |
|---|---|---|
| Dlákolel | 10-15 ft long | 2x2 |
| Ghár | 12-15 ft long | 2x2 |
| Chlén | 5-6 m long (S&G Vol. 2 Sec. 2.370) | 2x2 |
| Shánu'u | 20-30 ft with tail | 3x3 |
| Ngóro | 30 ft | 3x3 |
| Kruá | 10 / 15-20 / 30-40 ft across | 1x1 / 2x2 / 4x4 |
| Sérudla | 15 / 25 / 35 ft | 2x2 / 3x3 / 4x4 |
| Haqél | 15 / 25-30 / 35-50 ft | 2x2 / 3x3 / 5x5 |
| Sró | 15-20 / 25-35 / 40-60 ft | 2x2 / 3x3 / 5x5 |
| Aqáa | 20-60 ft overall, spread over its three sizes | 2x2 / 4x4 / 6x6 |
| Akhó | not stated (table choice) | 1x1 / 2x2 / 3x3 |
| Dlaqó | "great" beetles, not stated (table choice) | 1x1 / 2x2 / 3x3 |
| Teqéqmu | not stated (table choice) | 1x1 / 2x2 / 2x2 |
| Tsi'íl | "huge", not stated (table choice) | 2x2 |
| Dzór | 10-12 ft tall (table choice) | 2x2 |
| Everything else | man-sized, height only, or not stated | 1x1 |

## Table rulings

- **Magic user arms and armour:** any dagger is allowed, steel or Chlén-hide (Sec. 721 says steel). Leather armour is allowed (Sec. 721), not "no armour" (Sec. 920). AC 7 is the limit, so a shield is flagged; helmets are not, since EPT armour classes do not count them. Priests: Sling, staff-sling and bolas are not edged, so they are allowed; bows, crossbows and javelins are flagged.

- **Load and movement:** every item on the sheet counts toward the load, worn or not, plus coins when "Coins are carried" is ticked. Nonhuman limits are multiplied by the species' basic hit dice (EPT: "roughly proportionate"). Loads over the armoured-foot figure have no rate in EPT and are shown as overloaded.

- **Species modifiers:** S&G Sec. 2.223 modifiers to Strength, Dexterity, Intelligence, Psychic Ability and Comeliness are added to the EPT talents of nonhuman characters. Swamp Folk have no psychic talent in S&G, so their Psychic Ability is fixed at 1 (EPT Non-Psychic: no spells). EPT's single Ssú uses S&G's Grey Ssú values. S&G's Charisma, Stamina, height and body damage changes are notes only.
- **N'lüss modifiers:** S&G gives them as changes to its own attribute rolls; here they are added to the EPT talent score (kept within 1-100) while a Human's homeland reads N'lüss. The Charisma penalty with non-N'lüss is shown as a note only.
- **Player species setting:** the S&G option lists the eight S&G player species found in the 1975 rules. S&G's ninth, the Urunén, has no EPT hit dice and is not included.

- **Initiative (world setting):** EPT reaction time rolls one d6 per side, and sides follow token disposition (Friendly = party, Hostile = foes, Neutral = others). S&G mode rolls a d20 for every combatant each round. With the S&G weapon-length option, round 1 is ordered by the longest equipped melee weapon, then the d20. Weapons the S&G length list does not name were given a group by reading: EPT battleaxe, flail, morning star and mace are 7 (long one-handed), the EPT spear is 3 (short thrusting spear), the S&G one-handed mace row is 8 and its longer mace/axe row is 7, and the combined short spear or quarterstaff row is 3 (set 5 for a quarterstaff). Every weapon's group can be changed on its sheet.

- **Treasure:** EPT says to roll a d6 for the number of items; "1-3" is read as half a d6 rounded up,
  "2-12"/"4-24"/"6-36" as that many d6, "10-40"/"10-60" as d4/d6 × 10. EPT gives no die for which amulet
  or miscellaneous item: d12 and d24 are used. Each gem is valued separately. The weapon spell table
  (Sec. 1820.4) is read as "a d100 score at or above the number gives that many spells". Sec. 1810 powers
  are rolled for swords, scimitars and battle-axes. An NPC's "Sword and Dagger" dagger is one of the three
  dagger results, picked at random. A Priest's edged result is rolled again (spears and bows count as edged).
  The Treatise of Hrsh keeps its overlapping printed results.

- **Creature spellcasting:** EPT gives creature casters a magic-user or priest level (e.g. Ssú "Magic User of level IV-XV") but no Psychic Ability. Their spell chance uses the Caster level field (or hit dice when 0) with average Psychic Ability.

Where the 1975 text is silent this system makes a labeled choice. The full list is in the
*Rules Reference → Table rulings* journal page. The main ones: Constitution 41-60 revival chance
(50%), whether a failed spell uses its casting (world setting), creature saving throws (as Warrior of
level = hit dice), and medium values for creatures with small/medium/large hit dice.

## Building from source

```
npm install
npm run data   # regenerate src/packs and data/packs from tools/*.py
npm run pack   # compile LevelDB packs into packs/
```

Releases are built by GitHub Actions (`.github/workflows/release.yml`) when a release is published.
If you install from source without compiled packs, the system fills empty compendiums from
`data/packs/*.json` the first time a GM loads a world (setting: *Fill empty compendiums*).

## Credits

Empire of the Petal Throne by M.A.R. Barker (Tactical Studies Rules, 1975); reprint by the Tékumel
Foundation. Swords & Glory by M.A.R. Barker (Gamescience, 1983-84); reprint by the Tékumel Foundation.
Foundry system by GM Jeremy.

## For add-on modules

Call `game.petalThrone.registerProfession(key, { label, skillGroupLabel, as, xp, titles, hitDice: {1: [...], 2: [...], 3: [...]}, prime, damageShift, savesAs, divineBonus, restriction })` in your module's `init` hook. Anything left out follows the profession named in `as` (default magic user). Set `CONFIG.PT.talentRollBonus = roll => bonus` to add a bonus to Roll New Character's talent rolls, and `CONFIG.PT.levelTitleOverride = system => title or null` to supply level titles.
